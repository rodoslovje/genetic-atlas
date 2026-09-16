// Block tree: an icicle-style view of one Y-DNA haplogroup and its descendants
// where the vertical axis is time. Each haplogroup is a block spanning from
// the TMRCA of its parent (when the branch formed) down to its own TMRCA;
// project members hang below their terminal haplogroup as one column each,
// reaching to the present — the span in which their private variants
// accumulated. Modeled on the FTDNA Big Y Block Tree.
//
// It is the second viewing mode of the Y-DNA view (state.ymode === "block").
// The people shown follow the lineage filter; the search box picks the
// starting haplogroup and highlights matches. The root is either explicit
// (state.block, set by drilling down or a ?block= link) or computed: the
// first haplogroup below the members' common ancestor where their lines split.
//
// Data comes from slo-ydna-paths.json (age, age68/age99, variants,
// placements/modern) and slo-ydna.json (people). See tools/ftdna-get-paths.py.

import { select } from "d3-selection";
import { state, t, getPersonTooltip, eraColors, isProminentPerson, translations, updateURLState, matchesSearchQuery, getSelectedGroups } from "./shared.js";
import { getFlagDataUri } from "./flags.js";

const COL_W = 150;          // column pitch per sample / leaf
const INSET = 4;            // horizontal gap between neighbouring blocks
const MIN_GAP = 30;         // min pixel height of any time slice (one block row)
const MIN_SAMPLE_H = 170;   // min height of the sample area (terminal TMRCA → present)
const MAX_LINEAR_H = 1600;  // cap on total height at the linear time scale
const PX_PER_YEAR = 0.35;
const AXIS_W = 100;
const TOP_PAD = 28;
const BOTTOM_PAD = 24;
const LINE_H = 14;
const CHAR_W = 6.4;         // approx. glyph width at 11-12px IBM Plex Sans
const MAX_CRUMBS = 6;
const MAX_AUTO_COLS = 150;  // wider than this, an automatic root asks for a narrower filter
                            // (the largest single lineage, R1a, has ~120 members)
const PRESENT = new Date().getFullYear();

const SVG_NS = "http://www.w3.org/2000/svg";
const XLINK_NS = "http://www.w3.org/1999/xlink";
const EXPORT_FONT_FAMILY = "'IBM Plex Sans', 'Segoe UI', Tahoma, sans-serif";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Clamp that degrades gracefully when the range is empty (lo > hi).
const between = (v, lo, hi) => (hi < lo ? null : Math.min(Math.max(v, lo), hi));

function decodeHtmlEntities(text) {
    const ta = document.createElement("textarea");
    ta.innerHTML = text || "";
    return ta.value;
}

function eraColorFor(year) {
    let color = eraColors[0].color;
    for (const era of eraColors) if (era.start < year) color = era.color;
    return color;
}

// Calendar years read better without digit grouping ("1765 CE"); keep grouping
// only for the deep-time BCE values ("705,000 BCE").
function fmtYear(year) {
    if (year === null || year === undefined) return "?";
    const abs = Math.abs(year);
    const num = abs < 10000 ? String(abs) : abs.toLocaleString(state.currentLang);
    return `${num} ${t(year < 0 ? "bce" : "ce")}`;
}

function truncate(text, maxChars) {
    const s = String(text || "");
    if (maxChars < 2) return "";
    return s.length > maxChars ? s.slice(0, maxChars - 1) + "…" : s;
}

// Greedy word wrap into at most maxLines lines; overflow ends in an ellipsis.
function wrap(text, maxChars, maxLines) {
    if (maxLines < 1) return [];
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    for (const w of words) {
        const candidate = cur ? `${cur} ${w}` : w;
        if (candidate.length <= maxChars) { cur = candidate; continue; }
        if (cur) lines.push(cur);
        cur = w;
        if (lines.length === maxLines) {
            lines[maxLines - 1] = truncate(lines[maxLines - 1] + " …", maxChars);
            return lines;
        }
    }
    if (cur) {
        if (lines.length < maxLines) lines.push(truncate(cur, maxChars));
        else lines[maxLines - 1] = truncate(lines[maxLines - 1] + " …", maxChars);
    }
    return lines;
}

// The live view is styled through class rules and CSS custom properties, which
// many SVG consumers (Illustrator, older Inkscape, Word) ignore. Bake the same
// values in as presentation attributes for the exported file. Colors mirror
// srd-tokens.css.
function inlineExportStyles(svg) {
    const set = (selector, attrs) => svg.querySelectorAll(selector).forEach((el) => {
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    });
    svg.querySelectorAll("text").forEach((el) => el.setAttribute("font-family", EXPORT_FONT_FAMILY));
    set(".bt-block__title", { "font-size": 12, "font-weight": "bold", fill: "#1a202c" });
    set(".bt-block__variant", { "font-size": 11, fill: "#4a5568" });
    set(".bt-block rect", { "stroke-width": 1.5 });
    set(".bt-block--root > rect", { "stroke-width": 2.5 });
    set(".bt-ci line", { "stroke-width": 1.5, opacity: 0.8 });
    set(".bt-sample rect", { fill: "#ffffff", stroke: "#94a3b8", "stroke-width": 1.5 });
    set(".bt-sample--bigy rect", { fill: "#e8eef6" });
    set(".bt-sample--match rect", { fill: "#fff8e1" });
    set(".bt-sample__surname", { "font-size": 12, "font-weight": "bold", fill: "#1a365d" });
    set(".bt-sample__line", { "font-size": 11, fill: "#4a5568" });
    set(".bt-sample__sub", { "font-size": 10, fill: "#718096" });
    set(".bt-axis__label", { "font-size": 11, fill: "#4a5568" });
    set(".bt-axis__line", { stroke: "#cbd5e0", "stroke-width": 1 });
    set(".bt-grid", { stroke: "#e2e8f0", "stroke-width": 1 });
}

// Keep the sidebar Tree / Block tree tabs in step with state.ymode.
export function syncModeToggle() {
    const active = state.ymode === "block" ? "block" : "tree";
    document.querySelectorAll(".mode-tab").forEach((btn) => {
        const on = btn.dataset.ymode === active;
        btn.classList.toggle("active", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
}

export class BlockTree {
    constructor(containerSelector) {
        const container = select(containerSelector);
        this.el = container.append("div").attr("class", "blocktree").style("display", "none");

        // No close button here: the Tree / Block tree tabs at the top of the
        // sidebar are the way back. This header only navigates within the tree.
        const header = this.el.append("div").attr("class", "blocktree__header");
        this.upBtn = header.append("button").attr("type", "button").attr("class", "blocktree__btn")
            .text("↑").on("click", () => { if (this.parentHg) this.open(this.parentHg); });
        this.crumbs = header.append("nav").attr("class", "blocktree__crumbs");

        this.scroll = this.el.append("div").attr("class", "blocktree__scroll");
        this.msg = this.scroll.append("div").attr("class", "blocktree__msg").style("display", "none");
        this.inner = this.scroll.append("div").attr("class", "blocktree__inner");
        this.axisSvg = this.inner.append("svg").attr("class", "blocktree__axis");
        this.svg = this.inner.append("svg").attr("class", "blocktree__svg");

        this.tooltip = select("body").select(".tooltip");
        if (this.tooltip.empty()) {
            this.tooltip = select("body").append("div").attr("class", "tooltip").style("opacity", 0);
        }
        this.scroll.on("scroll", () => {
            this.hideTooltip(0);
            if (this._stickyRaf) return;
            this._stickyRaf = requestAnimationFrame(() => {
                this._stickyRaf = null;
                this._updateStickyLabels();
            });
        });

        this.rootHg = null;     // haplogroup currently drawn
        this.parentHg = null;
        this.drawn = false;     // something is on the canvas (not a message)
        this.lastQuery = undefined;   // search text at the previous render
        this.haploData = null;
        this.peopleData = null;
    }

    // Visible and showing a diagram (as opposed to a message).
    get isOpen() { return state.ymode === "block" && this.drawn; }

    setData(haploData, peopleData) {
        if (haploData === this.haploData && peopleData === this.peopleData) return;
        this.haploData = haploData;
        this.peopleData = peopleData;
        this.nodeByHg = new Map();
        this.childrenByHg = new Map();
        for (const n of haploData || []) {
            this.nodeByHg.set(n.haplogroup, n);
            if (n.parent) {
                if (!this.childrenByHg.has(n.parent)) this.childrenByHg.set(n.parent, []);
                this.childrenByHg.get(n.parent).push(n);
            }
        }
    }

    // Focus on an explicit haplogroup, switching to block mode if needed.
    open(hg) {
        if (!hg) return;
        state.block = hg;
        state.ymode = "block";
        updateURLState();
        this.scroll.node().scrollTop = 0;
        this.scroll.node().scrollLeft = 0;
        this.render();
    }

    // Back to the automatic starting haplogroup (reset button).
    home() {
        state.block = null;
        updateURLState();
        this.scroll.node().scrollTop = 0;
        this.scroll.node().scrollLeft = 0;
        this.render();
    }

    hide() {
        this.el.style("display", "none");
        this.drawn = false;
        this.hideTooltip(0);
        syncModeToggle();
    }

    // ------------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------------

    render() {
        if (!this.nodeByHg) return;
        if (state.ymode !== "block") {
            this.lastQuery = state.searchQuery;
            this.hide();
            return;
        }
        this.el.style("display", "flex");
        syncModeToggle();

        // Typing a new search is a navigation request, so a root the user
        // drilled into earlier must give way — otherwise the matches stay
        // off-screen. The very first render (lastQuery undefined) keeps an
        // explicit root, so ?block=…&q=… deep links still work.
        if (this.lastQuery !== undefined && state.searchQuery !== this.lastQuery && state.block) {
            state.block = null;
            updateURLState();
        }
        this.lastQuery = state.searchQuery;

        this.upBtn.attr("title", t("blockTreeUp")).attr("aria-label", t("blockTreeUp"));
        this.svg.selectAll("*").remove();
        this.axisSvg.selectAll("*").remove();
        this.drawn = false;

        // People follow the lineage filter; the search only steers the root
        // and highlights, so relatives of a searched person stay visible.
        const selected = getSelectedGroups();
        const shown = (this.peopleData || []).filter((p) =>
            selected.has(p.group) && p.haplogroup && this.nodeByHg.has(p.haplogroup));
        const matches = state.searchQuery ? shown.filter((p) => matchesSearchQuery(p, state.searchQuery)) : [];
        this.matchSet = new Set(matches);
        this.indexPeople(shown);

        const explicit = !!state.block;
        let rootHg = state.block;
        if (!explicit) {
            if (!shown.length || (state.searchQuery && !matches.length)) {
                this.setRoot(null);
                this.showMessage(t("blockTreeNoMatch"));
                return;
            }
            rootHg = this.autoRoot(matches.length ? matches : shown);
        }
        this.setRoot(rootHg);

        const rootData = this.nodeByHg.get(rootHg);
        if (!rootData) {
            this.showMessage(t("blockTreeUnknown", rootHg));
            return;
        }
        const tree = this.buildSubtree(rootData);
        if (tree.peopleCount === 0) {
            this.showMessage(t("blockTreeEmpty"));
            return;
        }
        this.layout(tree, rootData);
        if (!explicit && tree.cols > MAX_AUTO_COLS) {
            this.showMessage(t("blockTreeTooWide", tree.peopleCount));
            return;
        }
        this.showMessage(null);
        this.draw(tree);
        this.drawn = true;
    }

    setRoot(hg) {
        this.rootHg = hg;
        const data = hg ? this.nodeByHg.get(hg) : null;
        this.parentHg = data && data.parent ? data.parent : null;
        this.upBtn.attr("disabled", this.parentHg ? null : true);
        this.renderCrumbs(data, hg);
    }

    showMessage(text) {
        this.msg.style("display", text ? "block" : "none").text(text || "");
        this.inner.style("display", text ? "none" : "flex");
    }

    // peopleByHg: members directly on a haplogroup; subtreeCounts: members
    // anywhere at or below it (only nodes with members are present).
    indexPeople(people) {
        this.peopleByHg = new Map();
        this.subtreeCounts = new Map();
        for (const p of people) {
            if (!this.peopleByHg.has(p.haplogroup)) this.peopleByHg.set(p.haplogroup, []);
            this.peopleByHg.get(p.haplogroup).push(p);
            for (const hg of this.ancestryOf(p.haplogroup)) {
                this.subtreeCounts.set(hg, (this.subtreeCounts.get(hg) || 0) + 1);
            }
        }
    }

    ancestryOf(hg) {
        const out = [];
        const seen = new Set();
        let cur = hg;
        while (cur && this.nodeByHg.has(cur) && !seen.has(cur)) {
            seen.add(cur);
            out.push(cur);
            cur = this.nodeByHg.get(cur).parent;
        }
        return out;
    }

    // Number of member-carrying branches leaving a node: children with members
    // below them plus members placed directly on the node.
    splitDegree(hg) {
        const direct = (this.peopleByHg.get(hg) || []).length;
        const branches = (this.childrenByHg.get(hg) || []).filter((c) => this.subtreeCounts.get(c.haplogroup) > 0).length;
        return direct + branches;
    }

    // Starting haplogroup for a set of focus people: their deepest common
    // ancestor, moved down past single-branch stretches to the first split,
    // or up until at least two member lines meet (single member searched).
    autoRoot(focus) {
        const chains = focus.map((p) => this.ancestryOf(p.haplogroup)).filter((c) => c.length);
        if (!chains.length) return null;
        const others = chains.slice(1).map((c) => new Set(c));
        let cur = chains[0].find((hg) => others.every((s) => s.has(hg))) || chains[0][chains[0].length - 1];

        let guard = 0;
        while (guard++ < 500 && this.splitDegree(cur) === 1 && !(this.peopleByHg.get(cur) || []).length) {
            const kid = (this.childrenByHg.get(cur) || []).find((c) => this.subtreeCounts.get(c.haplogroup) > 0);
            if (!kid) break;
            cur = kid.haplogroup;
        }
        guard = 0;
        while (guard++ < 500 && this.splitDegree(cur) < 2) {
            const parent = this.nodeByHg.get(cur) && this.nodeByHg.get(cur).parent;
            if (!parent || !this.nodeByHg.has(parent)) break;
            cur = parent;
        }
        return cur;
    }

    getNote(hg) {
        const dict = translations[state.currentLang] || translations.en;
        const notes = dict && dict.ydnaNotes;
        const custom = notes && notes[hg];
        if (custom) return custom;
        const data = this.nodeByHg.get(hg);
        return data && data.note ? data.note : "";
    }

    renderCrumbs(rootData, rootHg) {
        this.crumbs.html("");
        if (!rootHg) return;
        const chain = [];
        let cur = rootData;
        let guard = 0;
        while (cur && guard++ < 200) {
            chain.unshift(cur.haplogroup);
            cur = cur.parent ? this.nodeByHg.get(cur.parent) : null;
        }
        if (!chain.length) chain.push(rootHg);

        const shown = chain.length > MAX_CRUMBS ? chain.slice(-MAX_CRUMBS) : chain;
        if (chain.length > MAX_CRUMBS) {
            this.crumbs.append("span").attr("class", "blocktree__ellipsis").text("…");
            this.crumbs.append("span").attr("class", "blocktree__sep").text("›");
        }
        shown.forEach((hg, i) => {
            const isLast = i === shown.length - 1;
            if (isLast) {
                this.crumbs.append("span").attr("class", "blocktree__current").text(hg);
                const note = this.getNote(hg);
                if (note) this.crumbs.append("span").attr("class", "blocktree__note").text(`(${decodeHtmlEntities(note)})`);
            } else {
                this.crumbs.append("a").attr("href", "#").text(hg)
                    .on("click", (e) => { e.preventDefault(); this.open(hg); });
                this.crumbs.append("span").attr("class", "blocktree__sep").text("›");
            }
        });
    }

    // Subtree pruned to branches that contain at least one shown member.
    buildSubtree(rootData) {
        const build = (data) => {
            const people = (this.peopleByHg.get(data.haplogroup) || []).slice()
                .sort((a, b) => (a.ancestor || a.surname || "").localeCompare(b.ancestor || b.surname || ""));
            const children = (this.childrenByHg.get(data.haplogroup) || [])
                .filter((c) => this.subtreeCounts.get(c.haplogroup) > 0)
                .map(build);
            const peopleCount = people.length + children.reduce((s, c) => s + c.peopleCount, 0);
            children.sort((a, b) =>
                (b.peopleCount - a.peopleCount) ||
                ((a.data.age ?? Infinity) - (b.data.age ?? Infinity)) ||
                a.hg.localeCompare(b.hg));
            return { data, hg: data.haplogroup, people, children, peopleCount };
        };
        return build(rootData);
    }

    layout(tree, rootData) {
        // 1. Ages, forced monotonic down the tree. A child dated older than its
        //    parent (overlapping estimates) or undated is placed one year below
        //    the parent so it still gets a minimum-height row.
        const parentData = rootData.parent ? this.nodeByHg.get(rootData.parent) : null;
        const rootFormed = parentData && parentData.age != null
            ? parentData.age
            : (rootData.age != null ? rootData.age : PRESENT) - 1;

        const labelYears = new Set([PRESENT]);
        if (parentData && parentData.age != null) labelYears.add(rootFormed);

        const assignAges = (node, floor) => {
            const age = node.data.age;
            node.ageUnknown = age === null || age === undefined;
            node.formed = floor;
            node.tmrca = node.ageUnknown ? floor + 1 : Math.max(age, floor + 1);
            node.clamped = !node.ageUnknown && node.tmrca !== age;
            if (!node.ageUnknown && !node.clamped) labelYears.add(node.tmrca);
            node.children.forEach((c) => assignAges(c, node.tmrca));
        };
        assignAges(tree, rootFormed);

        // 2. Columns: children first, then one column per person placed
        //    directly on the node.
        const assignCols = (node, start) => {
            let cursor = start;
            node.children.forEach((c) => { assignCols(c, cursor); cursor += c.cols; });
            node.samples = node.people.map((person) => ({ person, node, col: cursor++ }));
            node.col0 = start;
            node.cols = Math.max(1, cursor - start);
        };
        assignCols(tree, 0);

        // 3. Time → y. Linear in years, but every slice between consecutive
        //    boundaries gets a minimum height so short-lived blocks stay
        //    readable, and the sample area always fits a person card.
        const years = new Set([rootFormed, PRESENT]);
        const walk = (node) => { years.add(node.tmrca); node.children.forEach(walk); };
        walk(tree);
        const sorted = [...years].sort((a, b) => a - b);
        const span = Math.max(1, PRESENT - rootFormed);
        const ppy = Math.min(PX_PER_YEAR, MAX_LINEAR_H / span);
        const ys = [TOP_PAD];
        for (let i = 1; i < sorted.length; i++) {
            const linear = (sorted[i] - sorted[i - 1]) * ppy;
            const minGap = sorted[i] === PRESENT ? MIN_SAMPLE_H : MIN_GAP;
            ys.push(ys[i - 1] + Math.max(linear, minGap));
        }
        this.scale = { years: sorted, ys, labelYears };
        this.yearToY = (year) => {
            if (year <= sorted[0]) return ys[0];
            if (year >= sorted[sorted.length - 1]) return ys[ys.length - 1];
            let i = 1;
            while (i < sorted.length && sorted[i] < year) i++;
            const f = (year - sorted[i - 1]) / (sorted[i] - sorted[i - 1]);
            return ys[i - 1] + f * (ys[i] - ys[i - 1]);
        };
    }

    draw(tree) {
        const Y = this.yearToY;
        const yPresent = Y(PRESENT);
        const width = tree.cols * COL_W + INSET * 2 + 8;
        const height = yPresent + BOTTOM_PAD;

        this.svg.attr("width", width).attr("height", height);
        this.axisSvg.attr("width", AXIS_W).attr("height", height);

        // Axis and gridlines at every labelled boundary, dropping labels that
        // would overlap the previous one.
        const axis = this.axisSvg.append("g");
        axis.append("line").attr("class", "bt-axis__line")
            .attr("x1", AXIS_W - 1).attr("x2", AXIS_W - 1).attr("y1", TOP_PAD).attr("y2", yPresent);
        const grid = this.svg.append("g");
        let lastLabelY = -Infinity;
        for (const year of [...this.scale.labelYears].sort((a, b) => a - b)) {
            const y = Y(year);
            grid.append("line").attr("class", "bt-grid")
                .attr("x1", 0).attr("x2", width).attr("y1", y).attr("y2", y);
            if (y - lastLabelY < 13) continue;
            lastLabelY = y;
            axis.append("line").attr("class", "bt-axis__line")
                .attr("x1", AXIS_W - 6).attr("x2", AXIS_W - 1).attr("y1", y).attr("y2", y);
            axis.append("text").attr("class", "bt-axis__label")
                .attr("x", AXIS_W - 9).attr("y", y + 4).attr("text-anchor", "end")
                .text(year === PRESENT ? t("blockPresent") : fmtYear(year));
        }

        this.defs = this.svg.append("defs");
        this._clipSeq = 0;
        // Painting order matters. A TMRCA confidence bar deliberately runs past
        // its own block, so it would otherwise be drawn across a neighbouring
        // block's name or through a sample card. Bars therefore sit under the
        // sample cards, and every block label sits on top of everything.
        const blocks = this.svg.append("g");
        const bars = this.svg.append("g").attr("pointer-events", "none");
        const samples = this.svg.append("g");
        const labels = this.svg.append("g").attr("pointer-events", "none");

        const visit = (node) => {
            this.drawBlock(blocks, bars, labels, node, node === tree);
            node.samples.forEach((s) => this.drawSample(samples, s));
            node.children.forEach(visit);
        };
        visit(tree);

        // Replace the character-count estimate of each label's width with its
        // real rendered width. Done in one pass now that the whole diagram is
        // built, so it costs a single layout instead of one per block.
        this.svg.selectAll(".bt-block__label").each(function () {
            const s = this.__sticky;
            if (!s) return;
            let widest = 0;
            this.querySelectorAll("text").forEach((t) => {
                widest = Math.max(widest, t.getComputedTextLength());
            });
            if (widest) s.w = widest;
        });

        this._updateStickyLabels();
    }

    // Keep every block's name and SNP list visible while the block itself is
    // on screen. A block spanning many columns or millennia is far larger than
    // the viewport, so a label pinned to its top-left corner scrolls away and
    // leaves an anonymous band of colour. Each label slides within its own
    // block instead, never past the opposite edge.
    _updateStickyLabels() {
        const el = this.scroll.node();
        if (!el) return;
        // Content sits to the right of the sticky axis, so the content x range
        // not covered by the axis starts at scrollLeft and is that much narrower.
        const vl = el.scrollLeft;
        const vr = vl + Math.max(0, el.clientWidth - AXIS_W);
        const vt = el.scrollTop;
        const vb = vt + el.clientHeight;

        this.svg.selectAll(".bt-block__label").each(function () {
            const s = this.__sticky;
            if (!s) return;
            // Put the label in the part of the block that is actually on screen,
            // never past either edge of the block itself. A block too small for
            // its label keeps the label where it was drawn.
            const ix0 = Math.max(s.left, vl);
            const ix1 = Math.min(s.right, vr);
            const iy0 = Math.max(s.top, vt);

            // Work with the label's left edge so a slice too narrow for the
            // whole name shows its beginning ("R-YP1…") rather than its tail
            // ("P1144"), which would read as a different haplogroup.
            const natLeft = s.centered ? s.x - s.w / 2 : s.x;
            // Stay inside the block and inside the on-screen slice of it, which
            // can be cut off at either edge of the viewport.
            const lo = Math.max(ix0 + 6, s.left + 4);
            const hi = Math.min(ix1 - 6 - s.w, s.right - 4 - s.w);
            const left = hi >= lo
                ? Math.min(Math.max(natLeft, lo), hi)
                // Slice too narrow for the whole name: pin it to the leading
                // edge so its start reads, and let the clip cut the rest.
                : Math.min(Math.max(ix0 + 2, s.left + 4), Math.max(s.left + 4, s.right - 12));
            const tx = s.centered ? left + s.w / 2 : left;
            // Only the name line has to fit; whatever follows it is clipped.
            // Haplogroup names have no descenders, so the baseline can sit
            // within 3px of the block's lower edge without touching it.
            const ty = iy0 < vb ? between(iy0 + 15, s.top + 15, s.bottom - 3) : null;

            const dx = tx === null ? 0 : tx - s.x;
            const dy = ty === null ? 0 : ty - s.y;
            if (dx || dy) this.setAttribute("transform", `translate(${dx},${dy})`);
            else this.removeAttribute("transform");
        });
    }

    drawBlock(layer, bars, labelLayer, node, isRoot) {
        const Y = this.yearToY;
        const x = node.col0 * COL_W + INSET;
        const w = node.cols * COL_W - INSET * 2;
        const y0 = Y(node.formed);
        const y1 = Y(node.tmrca);
        const h = Math.max(1, y1 - y0);
        const color = eraColorFor(node.tmrca);

        const g = layer.append("g")
            .attr("class", `bt-block${isRoot ? " bt-block--root" : ""}`)
            .on("click", (event) => {
                event.stopPropagation();
                if (!isRoot) this.open(node.hg);
            })
            .on("mouseover", (event) => this.showTooltip(event, this.blockTooltip(node, isRoot)))
            .on("mouseout", () => this.hideTooltip());

        g.append("rect")
            .attr("x", x).attr("y", y0).attr("width", w).attr("height", h).attr("rx", 3)
            .style("fill", color).style("fill-opacity", 0.16).style("stroke", color)
            .style("stroke-dasharray", node.ageUnknown ? "4 3" : null);

        // Narrow blocks read best centered; wide ones (many columns) would put
        // the label off-screen, so anchor their text at the left edge instead.
        const wide = node.cols > 2;
        const tx = wide ? x + 10 : x + w / 2;
        const anchor = wide ? "start" : "middle";
        const maxChars = Math.floor((wide ? Math.min(w, COL_W * 2) - 16 : w - 8) / CHAR_W);

        // Labels go in their own group so they can be kept on screen while a
        // block far wider or taller than the viewport is scrolled through
        // (see _updateStickyLabels). Clipping to the block means a sliding
        // label can never spill into a neighbour: on a block too short for its
        // whole SNP list, the name slides and the surplus lines are cut off.
        // The clip lives on a wrapper that never moves: a transform on an
        // element drags its own clip-path along with it, so clipping and
        // sliding have to sit on two different elements.
        const clipId = `bt-clip-${++this._clipSeq}`;
        this.defs.append("clipPath").attr("id", clipId).append("rect")
            .attr("x", x).attr("y", y0).attr("width", w).attr("height", h);
        const labelG = labelLayer.append("g").attr("clip-path", `url(#${clipId})`)
            .append("g").attr("class", "bt-block__label");
        const title = truncate(node.hg, maxChars);
        let widestChars = title.length;
        labelG.append("text").attr("class", "bt-block__title")
            .attr("x", tx).attr("y", y0 + 15).attr("text-anchor", anchor)
            .text(title);

        // Equivalent SNPs, as many as fit; the defining SNP is already in the name.
        const defining = node.hg.includes("-") ? node.hg.split("-").slice(1).join("-") : node.hg;
        const variants = Array.isArray(node.data.variants)
            ? node.data.variants.filter((v) => v !== defining)
            : null;
        const linesAvail = Math.floor((h - 22) / LINE_H);
        if (variants && variants.length && linesAvail >= 1) {
            const fits = variants.length <= linesAvail;
            const shown = fits ? variants : variants.slice(0, Math.max(0, linesAvail - 1));
            const lines = shown.map((v) => truncate(v, maxChars));
            if (!fits) lines.push(`+${variants.length - shown.length}`);
            lines.forEach((line, i) => {
                widestChars = Math.max(widestChars, line.length);
                labelG.append("text").attr("class", "bt-block__variant")
                    .attr("x", tx).attr("y", y0 + 15 + LINE_H * (i + 1)).attr("text-anchor", anchor)
                    .text(line);
            });
        }

        labelG.node().__sticky = {
            centered: !wide,
            x: tx, y: y0 + 15,      // where the label sits when nothing is scrolled
            left: x, right: x + w, top: y0, bottom: y1,
            w: widestChars * CHAR_W,
        };

        // 68 % confidence interval of the TMRCA, as a thin bar on the left edge.
        const ci = node.data.age68;
        if (ci && !node.ageUnknown) {
            const top = Math.max(TOP_PAD, Y(ci[0]));
            const bottom = Math.min(Y(PRESENT), Y(ci[1]));
            const bx = x + 6;
            const bar = bars.append("g").attr("class", "bt-ci").style("stroke", color);
            bar.append("line").attr("x1", bx).attr("x2", bx).attr("y1", top).attr("y2", bottom);
            bar.append("line").attr("x1", bx - 3).attr("x2", bx + 3).attr("y1", top).attr("y2", top);
            bar.append("line").attr("x1", bx - 3).attr("x2", bx + 3).attr("y1", bottom).attr("y2", bottom);
            bar.append("circle").attr("cx", bx).attr("cy", y1).attr("r", 2.5).style("fill", color);
        }
    }

    drawSample(layer, sample) {
        const { person, node, col } = sample;
        const Y = this.yearToY;
        const x = col * COL_W + INSET;
        const w = COL_W - INSET * 2;
        const y0 = Y(node.tmrca);
        const y1 = Y(PRESENT);
        const h = y1 - y0;
        const prominent = isProminentPerson(person);
        const isMatch = this.matchSet.has(person);
        const maxChars = Math.floor((w - 12) / CHAR_W);

        const g = layer.append("g")
            .attr("class", `bt-sample${prominent ? " bt-sample--bigy" : ""}${isMatch ? " bt-sample--match" : ""}`)
            .on("mouseover", (event) => this.showTooltip(event, getPersonTooltip(person, "", "y", "tree")))
            .on("mouseout", () => this.hideTooltip());

        g.append("rect")
            .attr("x", x).attr("y", y0).attr("width", w).attr("height", h).attr("rx", 3)
            .style("stroke-dasharray", prominent ? null : "4 3");

        const code = person.country || "un";
        const href = getFlagDataUri(code) || `https://flagcdn.com/w40/${code}.png`;
        g.append("image").attr("href", href).attr("xlink:href", href)
            .attr("x", x + w / 2 - 12).attr("y", y0 + 10).attr("width", 24).attr("height", 16)
            .attr("preserveAspectRatio", "xMidYMid slice");

        let ty = y0 + 44;
        g.append("text").attr("class", "bt-sample__surname")
            .attr("x", x + w / 2).attr("y", ty).attr("text-anchor", "middle")
            .text(truncate(decodeHtmlEntities(person.surname || person.kit || ""), maxChars));
        ty += LINE_H + 2;

        const linesAvail = Math.max(0, Math.floor((y1 - 14 - ty) / LINE_H));
        const ancestorLines = wrap(decodeHtmlEntities(person.ancestor || ""), maxChars, Math.min(3, linesAvail));
        ancestorLines.forEach((line) => {
            g.append("text").attr("class", "bt-sample__line")
                .attr("x", x + w / 2).attr("y", ty).attr("text-anchor", "middle").text(line);
            ty += LINE_H;
        });
        const remaining = Math.max(0, Math.floor((y1 - 14 - ty) / LINE_H));
        wrap(decodeHtmlEntities(person.location || ""), maxChars + 2, Math.min(2, remaining)).forEach((line) => {
            g.append("text").attr("class", "bt-sample__sub")
                .attr("x", x + w / 2).attr("y", ty).attr("text-anchor", "middle").text(line);
            ty += LINE_H;
        });

        if (person.test) {
            g.append("text").attr("class", "bt-sample__sub")
                .attr("x", x + w / 2).attr("y", y1 - 8).attr("text-anchor", "middle")
                .text(truncate(person.test, maxChars));
        }
    }

    // ------------------------------------------------------------------
    // Export
    // ------------------------------------------------------------------

    // Standalone SVG of the current view: axis and content side by side,
    // class styling baked in. Returns null when nothing is drawn.
    exportSvg() {
        if (!this.isOpen) return null;
        const contentW = +this.svg.attr("width") || 0;
        const height = +this.svg.attr("height") || 0;
        if (!contentW || !height) return null;
        const width = AXIS_W + contentW;

        const out = document.createElementNS(SVG_NS, "svg");
        out.setAttribute("xmlns", SVG_NS);
        out.setAttribute("xmlns:xlink", XLINK_NS);
        out.setAttribute("width", width);
        out.setAttribute("height", height);
        out.setAttribute("viewBox", `0 0 ${width} ${height}`);

        const axisG = document.createElementNS(SVG_NS, "g");
        for (const child of this.axisSvg.node().childNodes) axisG.appendChild(child.cloneNode(true));
        const contentG = document.createElementNS(SVG_NS, "g");
        contentG.setAttribute("transform", `translate(${AXIS_W},0)`);
        for (const child of this.svg.node().childNodes) contentG.appendChild(child.cloneNode(true));
        out.appendChild(axisG);
        out.appendChild(contentG);

        // Labels may be scrolled away from their block's corner on screen; the
        // exported file has no viewport, so put them back where they belong.
        out.querySelectorAll(".bt-block__label").forEach((el) => el.removeAttribute("transform"));
        inlineExportStyles(out);
        return { svg: out, width, height, root: this.rootHg };
    }

    // ------------------------------------------------------------------
    // Tooltips
    // ------------------------------------------------------------------

    blockTooltip(node, isRoot) {
        const d = node.data;
        const note = this.getNote(node.hg);
        const lines = [];
        lines.push(`${t("snpLabel")}: <b>${esc(node.hg)}</b>${note ? ` <i>(${esc(decodeHtmlEntities(note))})</i>` : ""}`);
        if (node.ageUnknown) {
            lines.push(`${t("ageEstimate")}: <b>?</b>`);
        } else {
            lines.push(`${t("blockTmrca")}: <b>${esc(fmtYear(d.age))}</b>`);
            if (d.age68) lines.push(`${t("blockRange68")}: ${esc(fmtYear(d.age68[0]))} – ${esc(fmtYear(d.age68[1]))}`);
            if (d.age99) lines.push(`${t("blockRange99")}: ${esc(fmtYear(d.age99[0]))} – ${esc(fmtYear(d.age99[1]))}`);
        }
        if (!isRoot || this.scale.labelYears.has(node.formed)) {
            lines.push(`${t("blockFormed")}: <b>${esc(fmtYear(node.formed))}</b>`);
        }
        if (Array.isArray(d.variants)) {
            const shown = d.variants.slice(0, 30).map(esc).join(", ");
            const more = d.variants.length > 30 ? ` … +${d.variants.length - 30}` : "";
            lines.push(`${t("blockVariants")} (${d.variants.length}): ${shown}${more}`);
        } else {
            lines.push(`<i>${t("blockVariantsUnknown")}</i>`);
        }
        if (typeof d.placements === "number" && typeof d.modern === "number") {
            lines.push(t("blockFtdnaTesters", d.placements, d.modern));
        }
        lines.push(t("blockProjectMembers", node.peopleCount));
        if (!isRoot) lines.push(`<i>${t("blockClickHint")}</i>`);
        return lines.join("<br>");
    }

    showTooltip(event, html) {
        const tn = this.tooltip.node();
        if (tn._hideTimer) { clearTimeout(tn._hideTimer); tn._hideTimer = null; }
        this.tooltip.html(html).transition().duration(100).style("opacity", 1);

        const h = tn.offsetHeight;
        const w = tn.offsetWidth;
        let left = event.pageX + 15;
        if (window.innerWidth <= 600) {
            left = 10;
        } else if (left + w > window.innerWidth - 20) {
            left = Math.max(10, event.pageX - w - 15);
        }
        const top = event.pageY - h - 20 < 70 ? event.pageY + 25 : event.pageY - h - 20;
        this.tooltip.style("left", left + "px").style("top", top + "px");
    }

    hideTooltip(delay = 250) {
        const tn = this.tooltip.node();
        if (!tn) return;
        if (tn._hideTimer) clearTimeout(tn._hideTimer);
        if (delay === 0) {
            tn._hideTimer = null;
            this.tooltip.style("opacity", 0);
            return;
        }
        tn._hideTimer = setTimeout(() => {
            this.tooltip.transition().duration(200).style("opacity", 0);
        }, delay);
    }
}
