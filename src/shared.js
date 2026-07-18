import { json } from "d3-fetch";
import { select } from "d3-selection";
// Re-exported so other modules can `import { d3 } from "./shared.js"` if convenient,
// but they should generally import directly from "d3-..." submodules.
export const d3 = { json, select };

// English bundled as fallback; all other languages lazy-loaded on first use.
import enTranslations from "./i18n/en.json";

// Explicit loader map (avoids Vite warning about static + dynamic import of en.json).
// Adding a new language: drop the JSON in i18n/ and add an entry here + in languageConfig in main.js.
const langLoaders = {
    sl: () => import("./i18n/sl.json"),
    de: () => import("./i18n/de.json"),
    hr: () => import("./i18n/hr.json"),
    hu: () => import("./i18n/hu.json"),
    it: () => import("./i18n/it.json"),
};

export const translations = { en: enTranslations };

export async function loadTranslation(lang) {
    if (translations[lang]) return translations[lang];
    if (!langLoaders[lang]) return null;
    const mod = await langLoaders[lang]();
    translations[lang] = mod.default;
    return translations[lang];
}


export const ydnaGroupRoots = {
    "A0-T": "A-L1090", A1: "A-V168", A1b: "A-V221", B2: "B-M182", B2b: "B-M112", BT: "BT-M42", C: "C-M216", C1: "C-F3393", C2: "C-M217", CF: "CF-P143", CT: "CT-M168", D: "D-M174", D1: "D-M15", DE: "DE-M145", E: "E-M96", E1: "E-CTS9083", E1b1a: "E-M2", E1b1b: "E-M215", EV13: "E-V13",
    F: "F-M89", F1: "F-F15527", F2: "F-M427", G: "G-M201", G1: "G-M285", G2: "G-L89", G2a: "G-P15", GHIJK: "GHIJK-F1329", H: "H-L901", H1: "H-M2826", H2: "H-P96", HIJK: "HIJK-PF3494", I: "I-M170", I1: "I-M253", I2: "I-P215", IJ: "IJ-P124", IJK: "IJK-L15",
    J: "J-M304", J1: "J-M267", J2: "J-M172", K: "K-M9", K1: "K-M177", K2: "K-M526", K2a: "K-M2308", K2a1: "K-F549", K2b: "K-YSC0000186",
    L: "L-M20", L1: "L-M22", L1b: "L-M317", LT: "LT-L298", N: "N-M231", N1: "N-L735", N1a1: "N-L550", NO: "NO-M214", O: "O-M175", O1: "O-F265", O2: "O-M122", P: "P-P295", Q: "Q-M242",
    R: "R-M207", R1: "R-M173", R1a: "R-M420", R1b: "R-M343", R2: "R-M479", S1: "S-B255", T: "T-M184"
    // Temporarily disabled due to FTDNA 403: A: "A-M91", A00: "A-L1086", B: "B-M60", D2: "D-M55", F3: "F-M481", M: "M-P256", M1: "M-M4", M2: "M-M353", N1a: "N-M46", S: "S-B254", S2: "S-P378"
};

export const mtdnaGroupRoots = {
    A: "A", A2: "A2", B: "B", B2: "B2", B4: "B4", C: "C", C1: "C1", D: "D", D1: "D1", D4: "D4", E: "E", E1: "E1", E2: "E2", F: "F", F1: "F1", F2: "F2", G: "G", G1: "G1", G2: "G2", H: "H", H1: "H1", H10: "H10", H2: "H2", H3: "H3", H4: "H4", H5: "H5", H6: "H6", H7: "H7", HV: "HV", I: "I", I1: "I1", I2: "I2", I3: "I3", I4: "I4", J: "J", J1: "J1", J2: "J2", JT: "JT", K: "K", K1: "K1", K2: "K2", L: "L", L0: "L0", L1: "L1", L2: "L2", L3: "L3", M: "M", M1: "M1", N: "N", N1: "N1", N1a: "N1a", N1b: "N1b", O: "O", O1: "O1", O2: "O2", P: "P", P1: "P1", P2: "P2", Q: "Q", Q1: "Q1", Q2: "Q2", R: "R", R0: "R0", R2: "R2", S: "S", S1: "S1", S2: "S2", T: "T", T1: "T1", T2: "T2", U: "U", U1: "U1", U2: "U2", U3: "U3", U4: "U4", U5: "U5", U5a: "U5a", U5b: "U5b", U7: "U7", V: "V", V1: "V1", V13: "V13", V2: "V2", V3: "V3", V7: "V7", W: "W", W1: "W1", W3: "W3", W4: "W4", W5: "W5", X: "X", X1: "X1", X2: "X2", Y: "Y", Y1: "Y1", Y2: "Y2", Z: "Z", Z1: "Z1", Z2: "Z2"
    // Temporarily disabled due to FTDNA 403: R1: "R1"
};

// Configurable colors for each major haplogroup
export const ydnaHaploColors = {
    "A": "#4b5563",    // Dark Grey
    "B": "#78350f",    // Brown
    "C": "#eab308",    // Gold / Yellow
    "D": "#9333ea",    // Purple
    "E": "#4ade80",    // Light Green
    "F": "#2dd4bf",    // Teal
    "G": "#14b8a6",    // Teal / Turquoise
    "I": "#1d4ed8",    // Deep Blue
    "I1": "#3b82f6",   // Blue
    "I2": "#0369a1",   // Dark Blue
    "L": "#d946ef",    // Pink / Fuchsia
    "M": "#8b5cf6",    // Violet
    "N": "#15803d",    // Dark Green
    "O": "#84cc16",    // Lime Green
    "P": "#a855f7",    // Purple
    "Q": "#c2410c",    // Burnt Orange
    "R": "#be185d",    // Rose
    "R1a": "#ff0000",  // Bright Red
    "R1b": "#800000",  // Dark Red / Maroon
    "R2": "#d81b60",   // Dark Pink
    "S": "#fb923c",    // Orange
    "Y": "#fb7185",    // Light Rose
    "Z": "#22d3ee",    // Cyan

    "default": "#6b7280" // Gray fallback
};

export function getHaploColor(groupName) {
    if (!groupName) return ydnaHaploColors["default"];
    if (ydnaHaploColors[groupName]) return ydnaHaploColors[groupName];

    // Dynamically generate a shade based on the letter, subgroup number, and trailing suffix
    const match = groupName.match(/^([a-zA-Z]+)(\d*)(.*)/);
    if (match) {
        let baseLetter = match[1].toUpperCase();
        let num = match[2] ? parseInt(match[2], 10) : 0;
        const sub = match[3] || "";

        // Separate H5+ into an Orange scale, leaving H and H1-H4 as Red
        if (baseLetter === "H" && num >= 5) {
            baseLetter = "H_orange";
        }

        // Force a contrast shift for specific U groups
        if (groupName.toLowerCase().startsWith("u5b")) num += 2;
        if (groupName.toLowerCase().startsWith("u7")) num += 6;

        // Generate a distinct shift for any nested subgroups (e.g., H1a, H1b) based on their suffix
        let subOffset = 0;
        for (let i = 0; i < sub.length; i++) {
            subOffset += sub.charCodeAt(i) * (i + 1);
        }
        num += subOffset;

        const scales = {
            "H": ["#7f1d1d", "#991b1b", "#b91c1c", "#dc2626", "#ef4444", "#f87171", "#fca5a5"], // Reds
            "H_orange": ["#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74"], // Oranges
            "U": ["#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74"], // Oranges
            "J": ["#0c4a6e", "#075985", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"], // Sky Blues
            "T": ["#854d0e", "#a16207", "#ca8a04", "#eab308", "#facc15", "#fde047", "#fef08a"], // Yellows
            "K": ["#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7"], // Emeralds
            "V": ["#312e81", "#3730a3", "#4338ca", "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc"], // Indigos
            "HV": ["#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74"], // Oranges
            "W": ["#881337", "#9f1239", "#be123c", "#e11d48", "#f43f5e", "#fb7185", "#fda4af"], // Roses
            "X": ["#164e63", "#155e75", "#0e7490", "#0891b2", "#06b6d4", "#22d3ee", "#67e8f9"], // Cyans
            "L": ["#4a044e", "#701a75", "#86198f", "#a21caf", "#c026d3", "#d946ef", "#e879f9"], // Fuchsias
            "I": ["#1e3a8a", "#1e40af", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"], // Blues
            "N": ["#3f6212", "#4d7c0f", "#65a30d", "#84cc16", "#a3e635", "#bef264", "#d9f99d"], // Lime Greens
            "M": ["#4c1d95", "#5b21b6", "#6d28d9", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"], // Violets
            "C": ["#831843", "#9d174d", "#be185d", "#db2777", "#f472b6", "#fbcfe8", "#fce7f3"], // Pinks
            "D": ["#831843", "#9d174d", "#be185d", "#db2777", "#f472b6", "#fbcfe8", "#fce7f3"], // Pinks
            "A": ["#1f2937", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"], // Grays
            "B": ["#451a03", "#78350f", "#92400e", "#b45309", "#d97706", "#f59e0b", "#fbbf24"], // Browns
            "E": ["#052e16", "#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399"], // Light Greens
            "F": ["#042f2e", "#134e4a", "#115e59", "#0f766e", "#0d9488", "#14b8a6", "#2dd4bf"], // Teals
            "G": ["#164e63", "#155e75", "#0e7490", "#0891b2", "#06b6d4", "#22d3ee", "#67e8f9"], // Cyans
            "P": ["#3b0764", "#581c87", "#6b21a8", "#7e22ce", "#9333ea", "#a855f7", "#c084fc"], // Purples
            "Q": ["#78350f", "#92400e", "#b45309", "#d97706", "#f59e0b", "#fbbf24", "#fcd34d"], // Ambers
            "R": ["#4a044e", "#701a75", "#86198f", "#a21caf", "#c026d3", "#d946ef", "#e879f9"], // Fuchsias
            "S": ["#7c2d12", "#9a3412", "#c2410c", "#ea580c", "#f97316", "#fb923c", "#fdba74"], // Oranges
            "Y": ["#881337", "#9f1239", "#be123c", "#e11d48", "#f43f5e", "#fb7185", "#fda4af"], // Roses
            "Z": ["#064e3b", "#065f46", "#047857", "#059669", "#10b981", "#34d399", "#6ee7b7"]  // Emeralds
        };

        if (scales[baseLetter]) {
            return scales[baseLetter][num % scales[baseLetter].length];
        }
    }

    return ydnaHaploColors["default"];
}

export const eraColors = [
    { start: -Infinity, color: "#a0aec0", id: "eraStone" },
    { start: -3300, color: "#b7791f", id: "eraBronze" },
    { start: -1200, color: "#78716c", id: "eraIron" },
    { start: -500, color: "#c53030", id: "eraAntiquity" },
    { start: 500, color: "#2b6cb0", id: "eraMiddle" },
    { start: 1500, color: "#38a169", id: "eraModern" }
];

const initialParams = new URLSearchParams(window.location.search);

export const state = {
    currentLang: localStorage.getItem("preferredLang") || (navigator.language && navigator.language.toLowerCase().startsWith("sl") ? "sl" : "en"),
    showPassthrough: initialParams.get("snp") === "1",
    showLabels: initialParams.get("lbl") === "1",
    showAllMajorGroups: initialParams.get("linea") === "1",
    showOnlyLineages: initialParams.get("olin") === "1",
    searchQuery: initialParams.get("q") || "",
    startgroup: initialParams.get("startgroup") || null,
    ydnaSelectedGroups: new Set(),
    mtdnaSelectedGroups: new Set(),
    yzoom: initialParams.get("yzoom") || null,
    mzoom: initialParams.get("mzoom") || null,
    ydnaAllSelected: true,
    mtdnaAllSelected: true
};

export function t(key, ...args) {
    const dict = translations[state.currentLang] || translations.en;
    let str = dict[key] ?? key;
    args.forEach((val, i) => { str = str.replace(`{${i}}`, val); });
    str = str.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (m, name) => {
        if (name === key) return m;
        const v = dict[name];
        return typeof v === "string" ? v : m;
    });
    return str;
}

export function getActiveData() {
    const view = (window.location.hash || "#map").substring(1);
    if (view === "mtdna") {
        return { haplo: mtdnaHaploData, people: mtdnaPeopleData, roots: mtdnaGroupRoots };
    }
    return { haplo: ydnaHaploData, people: ydnaPeopleData, roots: ydnaGroupRoots };
}

export function getSelectedGroups() {
    const view = (window.location.hash || "#map").substring(1);
    return view === "mtdna" ? state.mtdnaSelectedGroups : state.ydnaSelectedGroups;
}

// Ungrouped (empty string) is deliberately stripped: it's off by default and not
// persisted to/restored from the URL.
const serializeGroups = (set) => Array.from(set).filter(g => g !== "").join(",");
const deserializeGroups = (str) => new Set(str ? str.split(",").filter(g => g !== "" && g !== "_") : []);

export function updateURLState() {
    const params = new URLSearchParams(window.location.search);

    if (state.ydnaAllSelected) {
        params.delete("ygroups");
    } else {
        params.set("ygroups", serializeGroups(state.ydnaSelectedGroups));
    }
    if (state.mtdnaAllSelected) {
        params.delete("mgroups");
    } else {
        params.set("mgroups", serializeGroups(state.mtdnaSelectedGroups));
    }

    params.delete("groups");
    params.delete("zoom"); // Clean up old zoom parameter

    if (state.yzoom) params.set("yzoom", state.yzoom);
    else params.delete("yzoom");

    if (state.mzoom) params.set("mzoom", state.mzoom);
    else params.delete("mzoom");

    if (state.startgroup) {
        params.set("startgroup", state.startgroup);
    } else {
        params.delete("startgroup");
    }

    if (state.showPassthrough) {
        params.set("snp", "1");
    } else {
        params.delete("snp");
    }
    if (state.showLabels) {
        params.set("lbl", "1");
    } else {
        params.delete("lbl");
    }
    if (state.showAllMajorGroups) {
        params.set("linea", "1");
    } else {
        params.delete("linea");
    }
    if (state.showOnlyLineages) {
        params.set("olin", "1");
    } else {
        params.delete("olin");
    }
    if (state.searchQuery) {
        params.set("q", state.searchQuery);
    } else {
        params.delete("q");
    }

    const newUrl = window.location.pathname + "?" + params.toString().replace(/%2C/g, ",") + (window.location.hash || "#map");
    window.history.replaceState(null, "", newUrl);
}

export function formatAge(age) {
    if (age === null || age === undefined) return "Unknown";
    const era = age < 0 ? t("bce") : t("ce");
    return `<b>${Math.abs(age).toLocaleString(state.currentLang)} ${era}</b>`;
}

// Single source of truth for the free-text search predicate. Used by the
// search counter (main.js), the map markers (map.js) and the tree filter (tree.js).
export function matchesSearchQuery(person, query) {
    if (!query) return true;
    const q = query.toLowerCase();
    return (person.surname && person.surname.toLowerCase().includes(q)) ||
        (person.ancestor && person.ancestor.toLowerCase().includes(q)) ||
        (person.kit && person.kit.toLowerCase().includes(q)) ||
        (person._ancestry && person._ancestry.includes(q)) ||
        (person.location && person.location.toLowerCase().includes(q));
}

// A person is "prominent" (bold label) when they have the most informative test
// for their lineage: Big Y for Y-DNA, full mtDNA sequence (Haplotype) for mtDNA.
// "Private" haplotype values don't count — the test exists but the data is withheld.
export function isProminentPerson(person) {
    if (!person) return false;
    if (person.haplotype && person.haplotype !== "Private") return true;
    if (person.test && person.test.includes("Big Y")) return true;
    return false;
}

const escHtml = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Renders the inner-text as a tooltip-link, with data-view + data-search attributes
// picked up by the delegated click handler in main.js. Caller controls the view.
function searchLink(view, value) {
    return `<a href="#${view}" class="tooltip-link" data-view="${view}" data-search="${escHtml(value)}">${escHtml(value)}</a>`;
}

export function getPersonTooltip(person, error = "", kind = null, source = null) {
    const majorGroup = person.majorGroup || person.group || "N/A";
    let haplo = person.originalHaplo ?? person.haplogroup ?? "";
    if (haplo === "-") haplo = "";

    // kind is "y" or "mt". Fallback: infer from the presence of a haplotype.
    const lineageView = kind === "y" ? "ydna" : kind === "mt" ? "mtdna" : (person.haplotype ? "mtdna" : "ydna");
    // Kit jumps to the other view: tree -> map, map -> tree
    const kitTargetView = source === "map" ? lineageView : "map";

    const kitCell = person.kit ? searchLink(kitTargetView, person.kit) : "N/A";
    const haploCell = haplo ? searchLink(lineageView, haplo) : "N/A";
    const locationCell = person.location ? searchLink("map", person.location) : "";

    let html = `${t("kit")}: <b>${kitCell}</b><br>`;
    if (person.test) html += `${t("testType")}: <b>${escHtml(person.test)}</b><br>`;
    html += `${t("lineage")}: <b>${escHtml(majorGroup)}</b><br>`;
    html += `${t("haplogroup")}: <b>${haploCell}</b>${error}<br>`;
    if (person.haplotype) html += `${t("haplotype")}: <b>${escHtml(person.haplotype)}</b><br>`;
    html += `${t("surname")}: <b>${escHtml(person.surname || "N/A")}</b><br>`;
    html += `${t("ancestor")}: <b>${escHtml(person.ancestor || "N/A")}</b><br>`;
    if (person.location) html += `${t("location")}: <b>${locationCell}</b>`;

    return html;
}

function warnOnDuplicateKits(people, label) {
    const seen = new Map();
    const dupes = [];
    const missing = [];
    for (const p of people) {
        if (!p.kit) {
            missing.push(p);
            continue;
        }
        if (seen.has(p.kit)) dupes.push(p.kit);
        else seen.set(p.kit, p);
    }
    if (dupes.length) console.warn(`[${label}] Duplicate kit numbers — d3 keying will collide:`, dupes);
    if (missing.length) console.warn(`[${label}] ${missing.length} records have no kit number; tree will fall back to surname-ancestor for keying`);
}

export let ydnaHaploData = null;
export let ydnaPeopleData = null;
export let mtdnaHaploData = null;
export let mtdnaPeopleData = null;
let dataPromise = null;

export function loadData() {
    if (!dataPromise) {
        // Data files keep stable names, so browsers/CDNs cache them across
        // deploys. __DATA_DATE__ changes whenever data/output changes, which
        // busts the cache exactly when the data is actually new.
        const v = encodeURIComponent(__DATA_DATE__);
        dataPromise = Promise.all([
            d3.json(`/data/output/slo-ydna-paths.json?v=${v}`),
            d3.json(`/data/output/slo-ydna.json?v=${v}`),
            d3.json(`/data/output/slo-mtdna-paths.json?v=${v}`).catch(() => []),
            d3.json(`/data/output/slo-mtdna.json?v=${v}`).catch(() => [])
        ]).then(([yHaplo, yPeople, mtHaplo, mtPeople]) => {
            ydnaHaploData = yHaplo;
            yPeople.forEach((p) => {
                if (!p.group && p.haplogroup) {
                    if (p.haplogroup.startsWith("D")) {
                        p.group = "D";
                    } else if (p.haplogroup.startsWith("R-YP")) {
                        p.group = "R1a";
                    } else {
                        p.group = p.haplogroup.split("-")[0];
                    }
                }
            });
            ydnaPeopleData = yPeople;

            mtdnaHaploData = mtHaplo;
            mtPeople.forEach((p) => {
                if (!p.group && p.haplogroup) {
                    let match = p.haplogroup.match(/^(HV|JT|[A-Z])[0-9]?/);
                    if (match) p.group = match[0];
                }

                // Autodetect group roots
                if (p.group && !mtdnaGroupRoots[p.group]) {
                    if (/[^a-zA-Z0-9]/.test(p.group)) {
                        let rootMatch = p.group.match(/^[A-Z][0-9]?[a-z]?/);
                        mtdnaGroupRoots[p.group] = rootMatch ? rootMatch[0] : p.group;
                    } else {
                        mtdnaGroupRoots[p.group] = p.group;
                    }
                }
            });
            mtdnaPeopleData = mtPeople;

            if (state.startgroup) {
                const getDescendantsAndSelf = (haploData, startNodeId) => {
                    const childrenMap = {};
                    haploData.forEach(d => {
                        if (d.parent) {
                            if (!childrenMap[d.parent]) childrenMap[d.parent] = [];
                            childrenMap[d.parent].push(d.haplogroup);
                        }
                    });
                    const descendants = new Set([startNodeId]);
                    const queue = [startNodeId];
                    while (queue.length > 0) {
                        const curr = queue.shift();
                        if (childrenMap[curr]) {
                            childrenMap[curr].forEach(child => {
                                descendants.add(child);
                                queue.push(child);
                            });
                        }
                    }
                    return descendants;
                };

                const filterTree = (haplo, people, rootsMap, startGroupRaw) => {
                    const startGroupAlias = rootsMap[startGroupRaw] || startGroupRaw;
                    const descendants = getDescendantsAndSelf(haplo, startGroupAlias);
                    const filteredHaplo = haplo.filter(h => descendants.has(h.haplogroup));
                    const startNodeIdx = filteredHaplo.findIndex(h => h.haplogroup === startGroupAlias);
                    if (startNodeIdx !== -1) {
                        filteredHaplo[startNodeIdx] = { ...filteredHaplo[startNodeIdx], parent: "" };
                    }
                    const filteredPeople = people.filter(p => {
                        let hg = p.haplogroup === "" ? (rootsMap[p.group] || p.group) : p.haplogroup;
                        let rootHg = rootsMap[p.group] || p.group;
                        return descendants.has(hg) || descendants.has(rootHg);
                    });
                    return { haplo: filteredHaplo, people: filteredPeople };
                };

                const yAlias = ydnaGroupRoots[state.startgroup] || state.startgroup;
                if (yHaplo.some(h => h.haplogroup === yAlias)) {
                    const filtered = filterTree(yHaplo, yPeople, ydnaGroupRoots, state.startgroup);
                    yHaplo = filtered.haplo;
                    yPeople = filtered.people;
                }
                const mtAlias = mtdnaGroupRoots[state.startgroup] || state.startgroup;
                if (mtHaplo.some(h => h.haplogroup === mtAlias)) {
                    const filtered = filterTree(mtHaplo, mtPeople, mtdnaGroupRoots, state.startgroup);
                    mtHaplo = filtered.haplo;
                    mtPeople = filtered.people;
                }
            }

            ydnaHaploData = yHaplo;
            ydnaPeopleData = yPeople;
            mtdnaHaploData = mtHaplo;
            mtdnaPeopleData = mtPeople;

            // Precompute each person's ancestry chain (own haplogroup + all upstream
            // SNPs) so a search for an upstream haplogroup matches downstream people.
            const buildAncestryStrings = (haploData, people) => {
                const parentMap = {};
                if (haploData) haploData.forEach(d => { parentMap[d.haplogroup] = d.parent; });
                people.forEach(p => {
                    const parts = [];
                    let curr = p.haplogroup;
                    let depth = 0;
                    while (curr && depth < 1000) {
                        parts.push(curr);
                        curr = parentMap[curr];
                        depth++;
                    }
                    p._ancestry = parts.join("").toLowerCase();
                });
            };
            buildAncestryStrings(yHaplo, yPeople);
            buildAncestryStrings(mtHaplo, mtPeople);

            warnOnDuplicateKits(yPeople, "Y-DNA");
            warnOnDuplicateKits(mtPeople, "mtDNA");

            // Ungrouped is intentionally not seeded — it's an opt-in filter.
            const yGroups = [...new Set(yPeople.map(p => p.group))].filter(Boolean);
            yGroups.forEach(k => state.ydnaSelectedGroups.add(k));

            const mtGroups = [...new Set(mtPeople.map(p => p.group))].filter(Boolean);
            mtGroups.forEach(k => state.mtdnaSelectedGroups.add(k));

            const urlParams = new URLSearchParams(window.location.search);
            const view = (window.location.hash || "#map").substring(1);

            if (urlParams.has("ygroups")) {
                state.ydnaSelectedGroups = deserializeGroups(urlParams.get("ygroups"));
                state.ydnaAllSelected = state.ydnaSelectedGroups.size === yGroups.length;
            } else if (urlParams.has("groups") && view !== "mtdna") {
                state.ydnaSelectedGroups = deserializeGroups(urlParams.get("groups"));
                state.ydnaAllSelected = state.ydnaSelectedGroups.size === yGroups.length;
            } else {
                state.ydnaAllSelected = true;
            }

            if (urlParams.has("mgroups")) {
                state.mtdnaSelectedGroups = deserializeGroups(urlParams.get("mgroups"));
                state.mtdnaAllSelected = state.mtdnaSelectedGroups.size === mtGroups.length;
            } else if (urlParams.has("groups") && view === "mtdna") {
                state.mtdnaSelectedGroups = deserializeGroups(urlParams.get("groups"));
                state.mtdnaAllSelected = state.mtdnaSelectedGroups.size === mtGroups.length;
            } else {
                state.mtdnaAllSelected = true;
            }
        });
    }
    return dataPromise;
}

// Sort groups using natural ordering: split into letter/number runs, compare
// runs as numbers when both sides are numeric, else lexically.
function naturalSortGroups(groups) {
    const re = /([A-Za-z]+)|([0-9]+)/g;
    return groups.slice().sort((a, b) => {
        const aParts = a.match(re) || [];
        const bParts = b.match(re) || [];
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            if (!aParts[i]) return -1;
            if (!bParts[i]) return 1;
            const aIsNum = !isNaN(aParts[i]);
            const bIsNum = !isNaN(bParts[i]);
            if (aIsNum && bIsNum) {
                const diff = parseInt(aParts[i], 10) - parseInt(bParts[i], 10);
                if (diff !== 0) return diff;
            } else if (aParts[i] !== bParts[i]) {
                return aParts[i] > bParts[i] ? 1 : -1;
            }
        }
        return 0;
    });
}

// Per-people-reference cache for the (expensive) ancestry walk + natural sort.
// People arrays only change identity when loadData runs again, so this stays valid
// across language switches, filter toggles, etc.
const orderedGroupsCache = new WeakMap();
function buildOrderedGroups(people, haploData, rootsMap) {
    const cached = orderedGroupsCache.get(people);
    if (cached) return cached;

    const groups = [...new Set(people.map((p) => p.group))].filter(Boolean);

    const parentMap = {};
    if (haploData) haploData.forEach(d => { parentMap[d.haplogroup] = d.parent; });

    const getAncestors = (hg) => {
        const ancestors = new Set();
        let curr = parentMap[hg];
        let maxDepth = 0;
        while (curr && maxDepth < 1000) {
            ancestors.add(curr);
            curr = parentMap[curr];
            maxDepth++;
        }
        return ancestors;
    };

    const groupHgs = {};
    groups.forEach(g => groupHgs[g] = rootsMap[g] || g);

    const groupAncestors = {};
    groups.forEach(g => groupAncestors[g] = getAncestors(groupHgs[g]));

    const groupHierarchy = {};
    groups.forEach(g => {
        let parent = null;
        let maxDepth = -1;
        groups.forEach(otherG => {
            if (g !== otherG && groupAncestors[g].has(groupHgs[otherG])) {
                const depth = groupAncestors[otherG].size;
                if (depth > maxDepth) {
                    maxDepth = depth;
                    parent = otherG;
                }
            }
        });
        groupHierarchy[g] = parent;
    });

    const sortedGroups = naturalSortGroups(groups);
    const childrenMap = {};
    sortedGroups.forEach(g => childrenMap[g] = []);

    const rootGroups = [];
    sortedGroups.forEach(g => {
        const p = groupHierarchy[g];
        if (p && childrenMap[p]) childrenMap[p].push(g);
        else rootGroups.push(g);
    });

    const orderedGroups = [];
    const groupDepths = {};
    const traverse = (node, depth) => {
        orderedGroups.push(node);
        groupDepths[node] = depth;
        if (childrenMap[node]) childrenMap[node].forEach(child => traverse(child, depth + 1));
    };
    rootGroups.forEach(root => traverse(root, 0));

    const result = { groups: sortedGroups, orderedGroups, groupDepths };
    orderedGroupsCache.set(people, result);
    return result;
}

export function initFilters() {
    if (!ydnaPeopleData || !mtdnaPeopleData) return;

    const buildList = (people, haploData, rootsMap, selectedGroups, listId, toggleId, isMtDna) => {
        const { groups, orderedGroups: cachedOrdered, groupDepths } = buildOrderedGroups(people, haploData, rootsMap);

        const hasUngrouped = people.some(p => !p.group);
        const currentView = (window.location.hash || "#map").substring(1);
        const orderedGroups = hasUngrouped && currentView === "map"
            ? [...cachedOrdered, ""]
            : cachedOrdered;

        const counterId = isMtDna ? "lineage-count-mtdna" : "lineage-count-ydna";
        const listedPeople = people.filter(p => p.group === "" ? (hasUngrouped && currentView === "map") : groups.includes(p.group));
        const updateCounter = () => {
            const el = document.getElementById(counterId);
            if (el) {
                const selected = listedPeople.filter(p => selectedGroups.has(p.group)).length;
                el.innerText = t("selectionCount", selected, listedPeople.length);
            }
        };

        const listContainer = d3.select(listId);
        listContainer.html("");

        const prefix = isMtDna ? "m" : "y";
        // "Select all" / "all selected" operate on real lineages — Ungrouped is
        // an independent opt-in toggle.
        const selectableGroups = orderedGroups.filter(g => g !== "");
        orderedGroups.forEach((groupName) => {
            const isUngrouped = groupName === "";
            const count = people.filter((p) => isUngrouped ? !p.group : p.group === groupName).length;
            const isChecked = selectedGroups.has(groupName);
            const color = isUngrouped ? ydnaHaploColors["default"] : getHaploColor(groupName);
            const shapeStyle = isMtDna ? "border-radius: 50%;" : "border-radius: 0%;";
            const chkId = `chk-${prefix}-${isUngrouped ? "_ungrouped" : groupName}`;
            const label = isUngrouped ? t("ungrouped") : `${t("lineage")} ${groupName}`;

            let indentStyle = null;
            const depth = groupDepths[groupName];
            if (depth > 0) {
                indentStyle = `margin-left: ${depth * 12}px;`;
            }

            listContainer.append("div").attr("class", "group-item")
                .attr("style", indentStyle)
                .html(`<input type="checkbox" id="${chkId}" ${isChecked ? "checked" : ""}><span style="width: 12px; height: 12px; ${shapeStyle} background: ${color}; margin-right: 6px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block;"></span><label for="${chkId}">${label} (${count})</label>`)
                .on("change", function () {
                    const cb = this.querySelector("input");
                    if (cb.checked) {
                        selectedGroups.add(groupName);
                    } else {
                        selectedGroups.delete(groupName);
                    }
                    if (isMtDna) state.mzoom = isUngrouped ? null : groupName;
                    else state.yzoom = isUngrouped ? null : groupName;
                    const allSel = selectableGroups.every(g => selectedGroups.has(g));
                    if (isMtDna) state.mtdnaAllSelected = allSel;
                    else state.ydnaAllSelected = allSel;
                    updateCounter();
                    updateURLState();
                    window.dispatchEvent(new CustomEvent("filterChanged"));
                });
        });

        d3.select(toggleId).on("click", function () {
            let newState;
            const target = isMtDna ? state.mtdnaSelectedGroups : state.ydnaSelectedGroups;
            if (isMtDna) {
                state.mzoom = null;
                state.mtdnaAllSelected = !state.mtdnaAllSelected;
                newState = state.mtdnaAllSelected;
            } else {
                state.yzoom = null;
                state.ydnaAllSelected = !state.ydnaAllSelected;
                newState = state.ydnaAllSelected;
            }
            // Toggle only the grouped lineages — leave the Ungrouped state alone.
            if (newState) selectableGroups.forEach(k => target.add(k));
            else selectableGroups.forEach(k => target.delete(k));

            this.innerText = t(newState ? "deselectAll" : "selectAll");
            selectableGroups.forEach((groupName) => {
                const chkId = `chk-${prefix}-${groupName}`;
                const chk = document.getElementById(chkId);
                if (chk) chk.checked = newState;
            });
            updateCounter();
            updateURLState();
            window.dispatchEvent(new CustomEvent("filterChanged"));
        });

        const btnEl = document.getElementById(toggleId.substring(1));
        if (btnEl) {
            const allSel = isMtDna ? state.mtdnaAllSelected : state.ydnaAllSelected;
            btnEl.innerText = t(allSel ? "deselectAll" : "selectAll");
        }

        updateCounter();
    };

    buildList(ydnaPeopleData, ydnaHaploData, ydnaGroupRoots, state.ydnaSelectedGroups, "#group-list-ydna", "#toggle-all-ydna", false);
    buildList(mtdnaPeopleData, mtdnaHaploData, mtdnaGroupRoots, state.mtdnaSelectedGroups, "#group-list-mtdna", "#toggle-all-mtdna", true);

    const eraListContainer = d3.select("#era-list");
    if (!eraListContainer.empty() && eraListContainer.html() === "") {
        eraColors.forEach((era) => {
            eraListContainer.append("div").attr("class", "legend-item")
                .html(`<div class="legend-color" style="background:${era.color};"></div><span data-i18n="${era.id}">${t(era.id)}</span>`);
        });
    }
}