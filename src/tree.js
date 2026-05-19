import { select } from "d3-selection";
import "d3-transition"; // augments selection with .transition()
import { zoom, zoomTransform, zoomIdentity } from "d3-zoom";
import { drag } from "d3-drag";
import { hierarchy } from "d3-hierarchy";
const d3 = { select, zoom, zoomTransform, zoomIdentity, drag, hierarchy };
import { state, t, formatAge, getPersonTooltip, getHaploColor, eraColors, getSelectedGroups, translations, isProminentPerson, matchesSearchQuery } from "./shared.js";

const NODE_ROW_HEIGHT = 45;
const NODE_DEPTH_WIDTH = 50;
const TRANSITION_DURATION = 600;
const ZOOM_DURATION = 750;
const ZOOM_SCALE = 0.75;
const ZOOM_TX = 30;

function decodeHtmlEntities(text) {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text || "";
    return textArea.value;
}

export class TreeVisualizer {
    constructor(containerSelector, isSquare = false) {
        this.containerSelector = containerSelector;
        this.isSquare = isSquare;
        const container = d3.select(containerSelector);
        this.svg = container.append("svg").attr("width", "100%").attr("height", "100%");
        this.g = this.svg.append("g");
        this.minimap = container.append("div").attr("class", "tree-minimap");
        this.minimapSvg = this.minimap.append("svg");

        const goToPoint = (event) => {
            if (!this._minimapTreeBounds) return;
            const src = event.sourceEvent || event;
            const mmRect = this.minimapSvg.node().getBoundingClientRect();
            const { treeW, treeH } = this._minimapTreeBounds;
            const sx = mmRect.width / treeW;
            const sy = mmRect.height / treeH;
            const mmScale = Math.min(sx, sy);
            const offX = (mmRect.width - treeW * mmScale) / 2;
            const offY = (mmRect.height - treeH * mmScale) / 2;
            const treeX = (src.clientX - mmRect.left - offX) / mmScale;
            const treeY = (src.clientY - mmRect.top - offY) / mmScale;

            const svgNode = this.svg.node();
            const cw = svgNode.clientWidth;
            const ch = svgNode.clientHeight;
            const t = d3.zoomTransform(svgNode);
            const newTx = cw / 2 - t.k * treeX;
            const newTy = ch / 2 - t.k * treeY;
            this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(newTx, newTy).scale(t.k));
        };

        this.minimapSvg.call(d3.drag().on("start", goToPoint).on("drag", goToPoint));
        this.zoom = d3.zoom()
            .scaleExtent([0.05, 5])
            .constrain((transform, extent, translateExtent) => {
                const dx0 = transform.invertX(extent[0][0]) - translateExtent[0][0];
                const dx1 = transform.invertX(extent[1][0]) - translateExtent[1][0];
                const dy0 = transform.invertY(extent[0][1]) - translateExtent[0][1];
                const dy1 = transform.invertY(extent[1][1]) - translateExtent[1][1];
                return transform.translate(
                    dx1 > dx0 ? dx0 : Math.min(0, dx0) || Math.max(0, dx1),
                    dy1 > dy0 ? dy0 : Math.min(0, dy0) || Math.max(0, dy1)
                );
            })
            .on("zoom", (e) => {
                this.g.attr("transform", e.transform);
                this._updateMinimapViewport();
                if (this.tooltip) this.tooltip.style("opacity", 0);
            });
        this.svg.call(this.zoom);
        this.tooltip = d3.select("body").select(".tooltip");
        if (this.tooltip.empty()) {
            this.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
        }
        // Allow mouse to enter the tooltip without it disappearing (so links inside are clickable)
        const tooltipNode = this.tooltip.node();
        this.tooltip
            .on("mouseenter.keep", () => {
                if (tooltipNode._hideTimer) { clearTimeout(tooltipNode._hideTimer); tooltipNode._hideTimer = null; }
            })
            .on("mouseleave.keep", () => {
                this.tooltip.transition().duration(200).style("opacity", 0);
            });
        this.svg.on("click", () => {
            this.tooltip.transition().duration(300).style("opacity", 0);
        });
        this.root = null;
    }

    getNodeClass(d, allRoots) {
        let cls = "node";
        if (d.data.isPerson) cls += " node--person";
        if (d.data.isAutoPlaced) cls += " node--autoplaced";
        if (d.data.isSearchMatch) cls += " node--search-match";
        const hasNote = d.data.note && d.data.note.trim() !== "" && d.data.note !== t("notePathMissing");
        if (hasNote || allRoots.has(d.data.haplogroup) || (d.data.isPerson && isProminentPerson(d.data))) {
            cls += " node--prominent";
        }
        return cls;
    }

    render(haploData, peopleData, groupRootsMap) {
        if (!haploData || !peopleData) return;

        this.peopleData = peopleData;

        const allRoots = new Set();
        if (state.showAllMajorGroups) {
            Object.values(groupRootsMap).forEach(hg => allRoots.add(hg));
        }
        peopleData.forEach(p => {
            if (p.group) allRoots.add(groupRootsMap[p.group] || p.group);
        });

        // Reverse-lookup hg -> group-key (value match only, used during hierarchy build)
        const groupKeyByValue = new Map();
        for (const [k, v] of Object.entries(groupRootsMap)) {
            if (!groupKeyByValue.has(v)) groupKeyByValue.set(v, k);
        }
        const langDict = translations[state.currentLang] || translations.en;
        const notesDict = this.isSquare ? langDict.ydnaNotes : langDict.mtdnaNotes;

        const getCustomNote = (hg, defaultNote) => {
            const groupKey = groupKeyByValue.get(hg);
            const customNote = notesDict
                ? (notesDict[hg] || (groupKey && notesDict[groupKey]) || null)
                : null;
            return customNote || defaultNote;
        };

        const buildHierarchy = (nodes, leaves) => {
            const dataMap = nodes.reduce((m, d) => {
                m[d.haplogroup] = { ...d, note: getCustomNote(d.haplogroup, d.note), id: d.haplogroup, children: [] };
                return m;
            }, {});

            let rootNode = nodes.find((d) => !d.parent || d.parent === "");
            if (!rootNode && nodes.length > 0) rootNode = nodes[0];
            if (!rootNode) rootNode = { haplogroup: "root", parent: "" };

            if (!dataMap[rootNode.haplogroup]) {
                dataMap[rootNode.haplogroup] = { ...rootNode, note: getCustomNote(rootNode.haplogroup, rootNode.note), id: rootNode.haplogroup, children: [] };
            }

            leaves.forEach((p) => {
                let hg = p.haplogroup === "" ? (groupRootsMap[p.group] || p.group) : p.haplogroup;
                if (hg && !dataMap[hg]) {
                    let parentHg = groupRootsMap[p.group] || p.group || rootNode.haplogroup;
                    if (parentHg === hg) parentHg = rootNode.haplogroup; // Prevent self-referencing
                    dataMap[hg] = {
                        haplogroup: hg, parent: parentHg, age: null,
                        note: getCustomNote(hg, t("notePathMissing")), id: hg, children: [], isAutoPlaced: true
                    };
                }
            });

            Object.values(dataMap).forEach((d) => {
                if (d.haplogroup === rootNode.haplogroup) return;
                if (d.parent && dataMap[d.parent] && d.haplogroup !== d.parent) {
                    dataMap[d.parent].children.push(d);
                } else {
                    dataMap[rootNode.haplogroup].children.push(d); // Attach orphans directly to root
                }
            });

            leaves.forEach((p) => {
                let hg = p.haplogroup === "" ? (groupRootsMap[p.group] || p.group) : p.haplogroup;

                if (hg && dataMap[hg]) {
                    dataMap[hg].children.push({
                        id: p.kit || `${p.surname}-${p.ancestor || ""}`,
                        kit: p.kit, surname: p.surname, country: p.country, location: p.location,
                        ancestor: p.ancestor, test: p.test, haplotype: p.haplotype, majorGroup: p.group, isPerson: true,
                        originalHaplo: p.haplogroup, isAutoPlaced: !!dataMap[hg].isAutoPlaced,
                        isSearchMatch: p.isSearchMatch
                    });
                }
            });
            return dataMap[rootNode.haplogroup];
        };

        const pruneTree = (node) => {
            const isGroupRoot = allRoots.has(node.haplogroup);
            const hasNote = node.note && node.note.trim() !== "" && node.note !== t("notePathMissing");

            const isMtDnaExplicitNote = !this.isSquare && hasNote && !["L'AA'AB", "L'AA", "L"].includes(node.haplogroup);
            let keepIfEmpty = isGroupRoot || (state.showAllMajorGroups && isMtDnaExplicitNote);
            if (state.showOnlyLineages) keepIfEmpty = false;

            if (!node.children || node.children.length === 0) {
                return node.isPerson || keepIfEmpty ? node : null;
            }

            node.children = node.children.map(pruneTree).filter((n) => n !== null);

            if (node.children.length === 0) {
                return keepIfEmpty ? node : null;
            }

            if (state.showPassthrough) return node;
            if (
                node.parent === "" || node.isPerson || (!state.showOnlyLineages && isGroupRoot) ||
                node.isAutoPlaced || hasNote || node.children.some((c) => c.isPerson) || node.children.length > 1
            ) {
                return node;
            }
            return node.children.length === 1 ? node.children[0] : node;
        };

        const selectedGroups = getSelectedGroups();
        let filteredPeople = peopleData.filter(p => selectedGroups.has(p.group));

        if (state.searchQuery) {
            filteredPeople = filteredPeople.filter(p => {
                const isMatch = matchesSearchQuery(p, state.searchQuery);
                if (isMatch) p.isSearchMatch = true;
                return isMatch;
            });
        } else {
            filteredPeople.forEach(p => p.isSearchMatch = false);
        }

        const processedData = pruneTree(buildHierarchy(haploData, filteredPeople));

        if (!processedData) {
            this.g.selectAll(".node").remove();
            this.g.selectAll(".link").remove();
            this.root = null;
            return;
        }

        const newRoot = d3.hierarchy(processedData);

        newRoot.sort((a, b) => {
            const nameA = a.data.isPerson ? (a.data.ancestor || a.data.surname) : a.data.haplogroup;
            const nameB = b.data.isPerson ? (b.data.ancestor || b.data.surname) : b.data.haplogroup;
            return (nameA || "").localeCompare(nameB || "");
        });

        const findAllDescendants = (node, arr = []) => {
            arr.push(node);
            const kids = node.children || node._children;
            if (kids) kids.forEach(c => findAllDescendants(c, arr));
            return arr;
        };
        const allNodes = findAllDescendants(newRoot);

        if (this.root) {
            const oldNodes = new Map();
            findAllDescendants(this.root).forEach(d => oldNodes.set(d.data.id, d));
            allNodes.forEach(d => {
                const old = oldNodes.get(d.data.id);
                if (old && old._children) {
                    d._children = d.children;
                    d.children = null;
                }
            });
        }

        this.root = newRoot;

        let zoomTargetNode = null;
        let currentZoomGroup = this.isSquare ? state.yzoom : state.mzoom;

        if (state.searchQuery) {
            zoomTargetNode = allNodes.find((d) => d.data.isSearchMatch);

            const markMatches = (node) => {
                let hasMatch = !!node.data.isSearchMatch;

                if (state.showAllMajorGroups) {
                    const isGroupRoot = allRoots.has(node.data.haplogroup);
                    const hasNote = node.data.note && node.data.note.trim() !== "" && node.data.note !== t("notePathMissing");
                    const isMtDnaExplicitNote = !this.isSquare && hasNote && !["L'AA'AB", "L'AA", "L"].includes(node.data.haplogroup);
                    if (isGroupRoot || isMtDnaExplicitNote) {
                        hasMatch = true;
                    }
                }

                const kids = node.children || node._children;
                if (kids) {
                    kids.forEach(c => {
                        if (markMatches(c)) hasMatch = true;
                    });
                }
                node.hasMatch = hasMatch;
                return hasMatch;
            };
            markMatches(newRoot);

            allNodes.forEach(d => {
                if (d.hasMatch) {
                    if (d._children) {
                        d.children = d._children;
                        d._children = null;
                    }
                } else {
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    }
                }
            });
        } else {
            if (currentZoomGroup) {
                const hg = groupRootsMap[currentZoomGroup] || currentZoomGroup;
                zoomTargetNode = allNodes.find((d) => d.data.haplogroup === hg);
            }

            // Expand ancestors of the target node to ensure it is visible for zooming
            if (zoomTargetNode) {
                let curr = zoomTargetNode.parent;
                while (curr) {
                    if (curr._children) {
                        curr.children = curr._children;
                        curr._children = null;
                    }
                    curr = curr.parent;
                }

                if (currentZoomGroup) {
                    const hg = groupRootsMap[currentZoomGroup] || currentZoomGroup;
                    if (zoomTargetNode.data.haplogroup === hg) {
                        if (selectedGroups.has(currentZoomGroup)) {
                            if (zoomTargetNode._children) {
                                zoomTargetNode.children = zoomTargetNode._children;
                                zoomTargetNode._children = null;
                            }
                        } else {
                            if (zoomTargetNode.children) {
                                zoomTargetNode._children = zoomTargetNode.children;
                                zoomTargetNode.children = null;
                            }
                        }
                    }
                }
            }

            // Ensure all selected groups remain visible and expanded, preventing nested hides
            const nodeByHg = new Map();
            allNodes.forEach(d => nodeByHg.set(d.data.haplogroup, d));

            const groups = [...new Set(peopleData.map((p) => p.group))].filter(Boolean);
            groups.forEach((groupName) => {
                if (selectedGroups.has(groupName)) {
                    const targetRoot = groupRootsMap[groupName] || groupName;
                    const target = nodeByHg.get(targetRoot);
                    if (target) {
                        let curr = target;
                        while (curr) {
                            if (curr._children) {
                                curr.children = curr._children;
                                curr._children = null;
                            }
                            curr = curr.parent;
                        }
                    }
                }
            });
        }

        this.update(this.root, allRoots, groupRootsMap);

        this.zoomToNode(zoomTargetNode || this.root, ZOOM_DURATION);
    }

    resetZoom() {
        if (this.root) {
            this.zoomToNode(this.root, ZOOM_DURATION);
        }
    }

    zoomToNode(d, duration = ZOOM_DURATION) {
        let ty;
        if (!d.parent) {
            ty = ZOOM_TX - d.x * ZOOM_SCALE;
        } else {
            ty = (window.innerHeight - ZOOM_TX * 2) / 2 - d.x * ZOOM_SCALE;
        }

        if (duration === 0) {
            this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(ZOOM_TX, ty).scale(ZOOM_SCALE));
        } else {
            this.svg.transition().duration(duration).call(this.zoom.transform, d3.zoomIdentity.translate(ZOOM_TX, ty).scale(ZOOM_SCALE));
        }
    }

    update(_source, allRoots, groupRootsMap) {
        // Interrupt any in-flight transitions so a fast follow-up render doesn't
        // stack animations on top of partially-completed ones (causes ghost nodes).
        this.g.selectAll(".node, .link").interrupt();

        const nodes = this.root.descendants();
        const links = this.root.links();
        const isSquare = this.isSquare;
        const peopleData = this.peopleData;

        // Reverse-lookup: prefer value-match (e.g. "R-M420" -> "R1a"), fall back to key-match
        const groupKeyByHg = new Map();
        for (const [k, v] of Object.entries(groupRootsMap)) {
            if (!groupKeyByHg.has(v)) groupKeyByHg.set(v, k);
        }
        for (const k of Object.keys(groupRootsMap)) {
            if (!groupKeyByHg.has(k)) groupKeyByHg.set(k, k);
        }
        const getGroupKey = (hg) => groupKeyByHg.get(hg);

        const selectedGroups = getSelectedGroups();
        const groupsWithPeople = new Set();
        if (peopleData) {
            for (const p of peopleData) {
                if (p.group) groupsWithPeople.add(p.group);
            }
        }

        const getNodeClass = (d) => this.getNodeClass(d, allRoots);

        // Suffix shown after a haplogroup name in the tree label and tooltip.
        // Combines the group key (e.g. "R1a" for "R-M420") and the descriptive
        // note in a lineage-appropriate format:
        //   Y-DNA with both:  " - GroupKey (Note)"     → "G-P15 - G2a (Gorazd Kmetovalec)"
        //   mtDNA with both:  " (Note - GroupKey)"
        //   Either, note only: " (Note)"
        //   Either, key only:  Y " - GroupKey", mt " (GroupKey)"
        const formatNoteSuffix = (data) => {
            const hasNote = data.note && data.note.trim() !== "" && data.note !== t("notePathMissing");
            const groupKey = getGroupKey(data.haplogroup);
            const hasGroupKey = groupKey && groupKey !== data.haplogroup;

            if (hasNote && hasGroupKey) {
                return isSquare ? ` - ${groupKey} (${data.note})` : ` (${data.note} - ${groupKey})`;
            }
            if (hasNote) return ` (${data.note})`;
            if (hasGroupKey) return isSquare ? ` - ${groupKey}` : ` (${groupKey})`;
            return "";
        };

        let index = -1;
        this.root.eachBefore((n) => {
            n.x = ++index * NODE_ROW_HEIGHT;
            if (!n.parent) {
                n.column = 0;
            } else {
                const parentBranches = n.parent.children && n.parent.children.length > 1;
                n.column = parentBranches ? n.parent.column + 1 : n.parent.column;
            }
            n.y = n.column * NODE_DEPTH_WIDTH;
        });

        const node = this.g.selectAll(".node").data(nodes, (d) => d.data.id);

        const nodeEnter = node.enter().append("g")
            .attr("class", getNodeClass)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .style("opacity", 0)
            .style("cursor", d => d.data.isPerson ? "default" : "pointer")
            .on("click", (event, d) => {
                event.stopPropagation();
                if (d.data.isPerson) return;

                const groupKey = getGroupKey(d.data.haplogroup);

                if (groupKey) {
                    const selectedGroups = getSelectedGroups();
                    if (!selectedGroups.has(groupKey)) {
                        const chkId = this.isSquare ? `chk-y-${groupKey}` : `chk-m-${groupKey}`;
                        const chk = document.getElementById(chkId);
                        if (chk) {
                            chk.checked = true;
                            chk.dispatchEvent(new Event("change", { bubbles: true }));
                            return;
                        }
                    }
                }

                if (d.children && d.children.length > 0) { d._children = d.children; d.children = null; }
                else if (d._children && d._children.length > 0) { d.children = d._children; d._children = null; }
                else return;
                this.update(d, allRoots, groupRootsMap);
            })
            .on("mouseover", (event, d) => {
                const tn = this.tooltip.node();
                if (tn._hideTimer) { clearTimeout(tn._hideTimer); tn._hideTimer = null; }
                this.tooltip.transition().duration(100).style("opacity", 1);
                const error = d.data.isAutoPlaced ? `<br><span class="error-tag">⚠ ${t("missingPath")}</span>` : "";
                if (d.data.isPerson) {
                    this.tooltip.html(getPersonTooltip(d.data, error, this.isSquare ? "y" : "mt", "tree"));
                } else {
                    const notePart = formatNoteSuffix(d.data);
                    this.tooltip.html(`${t("snpLabel")}: <b>${d.data.haplogroup}${notePart}</b>${error}<br>${t("ageEstimate")}: ${formatAge(d.data.age)}`);
                }

                let left = event.pageX + 15;
                const h = this.tooltip.node().offsetHeight;
                const w = this.tooltip.node().offsetWidth;

                if (window.innerWidth <= 600) {
                    left = 10;
                } else if (left + w > window.innerWidth - 20) {
                    left = Math.max(10, event.pageX - w - 15);
                }

                let top;
                if (event.pageY - h - 20 < 70) {
                    top = event.pageY + 25;
                } else {
                    top = event.pageY - h - 20;
                }
                this.tooltip.style("left", left + "px").style("top", top + "px");
            })
            .on("mouseout", () => {
                const tn = this.tooltip.node();
                tn._hideTimer = setTimeout(() => {
                    this.tooltip.transition().duration(200).style("opacity", 0);
                }, 250);
            });

        nodeEnter.each(function (d) {
            const el = d3.select(this);
            if (d.data.isPerson) {
                const code = d.data.country || "un";
                el.append("image").attr("xlink:href", `https://flagcdn.com/w40/${code}.png`).attr("x", -12).attr("y", -8).attr("width", 24).attr("height", 16);
            } else {
                const radius = d3.select(this.parentNode).classed("node--prominent") ? 10.5 : 6.5;
                const groupKey = getGroupKey(d.data.haplogroup);
                const color = d.data.isAutoPlaced ? "#e53e3e" : groupKey ? getHaploColor(groupKey) : "#cbd5e0";

                const isDeselectedRoot = groupKey && !selectedGroups.has(groupKey);
                const hasHiddenChildren = d._children && d._children.length > 0;
                const hasPeople = isDeselectedRoot && groupsWithPeople.has(groupKey);
                const isSolid = !hasHiddenChildren && !(isDeselectedRoot && hasPeople);
                const fill = isSolid ? color : "#ffffff";
                const stroke = d.data.isAutoPlaced ? "#9b2c2c" : color;

                if (isSquare) {
                    const size = radius * 1.8;
                    el.append("rect")
                        .attr("class", "halo")
                        .attr("x", -size / 2)
                        .attr("y", -size / 2)
                        .attr("width", size)
                        .attr("height", size)
                        .attr("rx", 1.5)
                        .style("fill", "none")
                        .style("stroke", "#ffffff")
                        .style("stroke-width", "5.5px");
                    el.append("rect")
                        .attr("class", "shape")
                        .attr("x", -size / 2)
                        .attr("y", -size / 2)
                        .attr("width", size)
                        .attr("height", size)
                        .attr("rx", 1.5)
                        .style("fill", fill)
                        .style("stroke", stroke);
                } else {
                    el.append("circle").attr("class", "halo").attr("r", radius).style("fill", "none").style("stroke", "#ffffff").style("stroke-width", "5.5px");
                    el.append("circle").attr("class", "shape").attr("r", radius).style("fill", fill).style("stroke", stroke);
                }
            }
        });

        nodeEnter.append("text")
            .attr("dy", (d) => {
                if (d.data.isPerson) return d.data.location ? "-0.15em" : ".35em";
                return ".35em";
            })
            .attr("x", (d) => (d.data.isPerson ? 18 : 16))
            .style("text-anchor", "start");

        const mergedNode = node.merge(nodeEnter);

        mergedNode.select("text")
            .text("")
            .each(function (d) {
                const el = d3.select(this);
                if (d.data.isPerson) {
                    el.append("tspan").text(decodeHtmlEntities(d.data.ancestor || d.data.surname));
                    if (d.data.location) {
                        el.append("tspan")
                            .attr("x", 18)
                            .attr("dy", "1.2em")
                            .style("font-size", "10px")
                            .style("fill", "#718096")
                            .text(decodeHtmlEntities(d.data.location));
                    }
                } else {
                    const notePart = formatNoteSuffix(d.data);
                    let agePart = "";
                    if (d.data.age !== null && d.data.age !== undefined) {
                        const yearsAgo = Math.round((new Date().getFullYear() - d.data.age) / 100) * 100;
                        agePart = ` ${t("yearsAgo", yearsAgo.toLocaleString(state.currentLang))}`;
                    }
                    el.text(`${d.data.haplogroup}${decodeHtmlEntities(notePart)}${agePart}`);
                }
            });

        mergedNode
            .attr("class", getNodeClass)
            .transition().duration(TRANSITION_DURATION)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .style("opacity", 1);

        mergedNode.select(".shape").transition().duration(TRANSITION_DURATION)
            .style("fill", d => {
                const groupKey = getGroupKey(d.data.haplogroup);
                const color = d.data.isAutoPlaced ? "#e53e3e" : groupKey ? getHaploColor(groupKey) : "#cbd5e0";

                const isDeselectedRoot = groupKey && !selectedGroups.has(groupKey);
                const hasHiddenChildren = d._children && d._children.length > 0;
                const hasPeople = isDeselectedRoot && groupsWithPeople.has(groupKey);
                const isSolid = !hasHiddenChildren && !(isDeselectedRoot && hasPeople);
                return isSolid ? color : "#ffffff";
            })
            .style("stroke", d => {
                const groupKey = getGroupKey(d.data.haplogroup);
                return d.data.isAutoPlaced ? "#9b2c2c" : groupKey ? getHaploColor(groupKey) : "#cbd5e0";
            });

        node.exit().transition().duration(TRANSITION_DURATION)
            .style("opacity", 0)
            .remove();

        const link = this.g.selectAll(".link").data(links, (d) => d.target.data.id);

        const getLinkColor = (d) => {
            if (d.target.data.isPerson) return eraColors[eraColors.length - 1].color;
            let age = d.target.data.age;
            if (age === null || age === undefined) age = d.source.data.age;
            if (age === null || age === undefined) return "#cbd5e0";

            let color = eraColors[0].color;
            for (let i = 0; i < eraColors.length; i++) {
                if (eraColors[i].start < age) color = eraColors[i].color;
            }
            return color;
        };

        const getLinkPath = (d) => {
            if (d.source.y === d.target.y) {
                return `M${d.source.y},${d.source.x} V${d.target.x}`;
            }
            return `M${d.source.y},${d.source.x} V${d.target.x - 12} Q${d.source.y},${d.target.x} ${d.source.y + 12},${d.target.x} H${d.target.y}`;
        };

        const linkEnter = link.enter().insert("path", "g").attr("class", "link")
            .style("stroke", getLinkColor)
            .style("stroke-width", "2.5px")
            .style("opacity", 0)
            .attr("d", getLinkPath);

        linkEnter.merge(link).transition().duration(TRANSITION_DURATION)
            .style("stroke", getLinkColor)
            .style("opacity", 0.8)
            .attr("d", getLinkPath);

        link.exit().transition().duration(TRANSITION_DURATION)
            .style("opacity", 0)
            .remove();

        nodes.forEach((d) => { d.x0 = d.x; d.y0 = d.y; });

        // Limit zoom out to boundaries of the tree
        const svgNode = this.svg.node();
        const cw = svgNode.clientWidth || window.innerWidth || 800;
        const ch = svgNode.clientHeight || window.innerHeight || 600;

        let maxX = 0;
        let maxY = 0;
        nodes.forEach((n) => {
            if (n.x > maxX) maxX = n.x;
            if (n.y > maxY) maxY = n.y;
        });

        const treeW = maxY + 400; // Account for labels (d.y is horizontal)
        const treeH = maxX + NODE_ROW_HEIGHT + 100; // d.x is vertical

        const minScale = Math.min(cw / treeW, ch / treeH);
        const zoomOutLimit = Math.max(0.01, Math.min(ZOOM_SCALE, minScale * 0.8));

        this.zoom.scaleExtent([zoomOutLimit, 5]);

        const padding = 50;

        this.zoom.translateExtent([
            [-padding, -padding],
            [treeW + padding, treeH + padding]
        ]);

        this._renderMinimap(nodes, links, treeW, treeH, getGroupKey);
    }

    _renderMinimap(nodes, links, treeW, treeH, getGroupKey) {
        const mmNode = this.minimap.node();
        const contentH = mmNode.clientHeight - 8; // 4px padding top+bottom
        let scale = 1;
        if (contentH > 0 && treeH > 0) {
            let contentW = contentH * (treeW / treeH);
            if (contentW > 150) contentW = 150;
            this.minimap.style("width", `${contentW + 10}px`); // padding + border
            scale = Math.min(contentW / treeW, contentH / treeH);
        }

        const mm = this.minimapSvg;
        mm.selectAll("*").remove();
        mm.attr("viewBox", `0 0 ${treeW} ${treeH}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        mm.selectAll("line.mm-link").data(links).enter().append("line")
            .attr("x1", d => d.source.y).attr("y1", d => d.source.x)
            .attr("x2", d => d.target.y).attr("y2", d => d.target.x)
            .attr("stroke", "#cbd5e0")
            .attr("stroke-width", 1)
            .attr("vector-effect", "non-scaling-stroke");

        mm.append("rect")
            .attr("x", 0).attr("y", 0)
            .attr("width", treeW).attr("height", treeH)
            .attr("fill", "none")
            .attr("stroke", "#94a3b8")
            .attr("stroke-width", 1)
            .attr("vector-effect", "non-scaling-stroke");

        const dotR = 3.5 / scale;
        const majorNodes = nodes.filter(d => !d.data.isPerson && getGroupKey(d.data.haplogroup));
        mm.selectAll("circle.mm-node").data(majorNodes).enter().append("circle")
            .attr("cx", d => d.y).attr("cy", d => d.x)
            .attr("r", dotR)
            .attr("fill", d => getHaploColor(getGroupKey(d.data.haplogroup)));

        mm.append("rect").attr("class", "minimap-viewport")
            .attr("fill", "rgba(49, 130, 206, 0.18)")
            .attr("stroke", "#3182ce")
            .attr("stroke-width", 1.5)
            .attr("vector-effect", "non-scaling-stroke")
            .attr("pointer-events", "none");

        this._minimapTreeBounds = { treeW, treeH };
        this._updateMinimapViewport();
    }

    _updateMinimapViewport() {
        if (!this._minimapTreeBounds || !this.minimapSvg) return;
        const svgNode = this.svg.node();
        if (!svgNode) return;
        const cw = svgNode.clientWidth;
        const ch = svgNode.clientHeight;
        if (!cw || !ch) return;
        const { treeW, treeH } = this._minimapTreeBounds;
        const t = d3.zoomTransform(svgNode);
        const left = Math.max(0, -t.x / t.k);
        const top = Math.max(0, -t.y / t.k);
        const right = Math.min(treeW, (cw - t.x) / t.k);
        const bottom = Math.min(treeH, (ch - t.y) / t.k);
        const width = Math.max(0, right - left);
        const height = Math.max(0, bottom - top);

        this.minimapSvg.select(".minimap-viewport")
            .attr("x", left).attr("y", top)
            .attr("width", width).attr("height", height);
    }
}
