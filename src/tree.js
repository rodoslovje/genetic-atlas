import { state, translations, formatAge, getPersonTooltip, getHaploColor, eraColors, getSelectedGroups } from "./shared.js";

export class TreeVisualizer {
    constructor(containerSelector, isSquare = false) {
        this.containerSelector = containerSelector;
        this.isSquare = isSquare;
        this.svg = d3.select(containerSelector).append("svg").attr("width", "100%").attr("height", "100%");
        this.g = this.svg.append("g");
        this.zoom = d3.zoom().scaleExtent([0.05, 5]).on("zoom", (e) => this.g.attr("transform", e.transform));
        this.svg.call(this.zoom);
        this.tooltip = d3.select("body").select(".tooltip");
        if (this.tooltip.empty()) {
            this.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);
        }
        this.root = null;
    }

    render(haploData, peopleData, groupRootsMap) {
        if (!haploData || !peopleData) return;

        this.peopleData = peopleData;

        const allRoots = new Set(Object.values(groupRootsMap));
        peopleData.forEach(p => {
            if (p.group) allRoots.add(groupRootsMap[p.group] || p.group);
        });

        const buildHierarchy = (nodes, leaves) => {
            const dataMap = nodes.reduce((m, d) => ((m[d.haplogroup] = { ...d, id: d.haplogroup, children: [] }), m), {});

            let rootNode = nodes.find((d) => !d.parent || d.parent === "");
            if (!rootNode && nodes.length > 0) rootNode = nodes[0];
            if (!rootNode) rootNode = { haplogroup: "root", parent: "" };

            if (!dataMap[rootNode.haplogroup]) {
                dataMap[rootNode.haplogroup] = { ...rootNode, id: rootNode.haplogroup, children: [] };
            }

            leaves.forEach((p) => {
                let hg = p.haplogroup === "" ? (groupRootsMap[p.group] || p.group) : p.haplogroup;
                if (hg && !dataMap[hg]) {
                    let parentHg = groupRootsMap[p.group] || p.group || rootNode.haplogroup;
                    if (parentHg === hg) parentHg = rootNode.haplogroup; // Prevent self-referencing
                    dataMap[hg] = {
                        haplogroup: hg, parent: parentHg, age: null,
                        note: translations[state.currentLang].notePathMissing, id: hg, children: [], isAutoPlaced: true
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
                        id: `${p.surname} (${p.kit})`, kit: p.kit, surname: p.surname, country: p.country, location: p.location,
                        ancestor: p.ancestor, test: p.test, majorGroup: p.group, isPerson: true,
                        originalHaplo: p.haplogroup, isAutoPlaced: !!dataMap[hg].isAutoPlaced,
                        isSearchMatch: p.isSearchMatch
                    });
                }
            });
            return dataMap[rootNode.haplogroup];
        };

        const pruneTree = (node) => {
            const isGroupRoot = allRoots.has(node.haplogroup);

            if (!node.children || node.children.length === 0) {
                return node.isPerson || isGroupRoot ? node : null;
            }

            node.children = node.children.map(pruneTree).filter((n) => n !== null);

            if (node.children.length === 0) {
                return isGroupRoot ? node : null;
            }

            if (state.showPassthrough) return node;
            const hasNote = node.note && node.note.trim() !== "" && node.note !== translations[state.currentLang].notePathMissing;
            if (
                node.parent === "" || node.isPerson || isGroupRoot ||
                node.isAutoPlaced || hasNote || node.children.some((c) => c.isPerson) || node.children.length > 1
            ) {
                return node;
            }
            return node.children.length === 1 ? node.children[0] : node;
        };

        const selectedGroups = getSelectedGroups();
        let filteredPeople = peopleData.filter(p => selectedGroups.has(p.group));

        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filteredPeople = filteredPeople.filter((p) => {
                const isMatch = (p.surname && p.surname.toLowerCase().includes(query)) ||
                (p.ancestor && p.ancestor.toLowerCase().includes(query)) ||
                (p.kit && p.kit.toLowerCase().includes(query)) ||
                    (p.haplogroup && p.haplogroup.toLowerCase().includes(query));
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
            const nameA = a.data.isPerson ? a.data.surname : a.data.haplogroup;
            const nameB = b.data.isPerson ? b.data.surname : b.data.haplogroup;
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
        if (state.searchQuery) {
            zoomTargetNode = allNodes.find((d) => d.data.isPerson);
        }

        let currentZoomGroup = this.isSquare ? state.yzoom : state.mzoom;

        if (!zoomTargetNode) {
            if (currentZoomGroup) {
                const hg = groupRootsMap[currentZoomGroup] || currentZoomGroup;
                zoomTargetNode = allNodes.find((d) => d.data.haplogroup === hg);
            }
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

            if (!state.searchQuery && currentZoomGroup) {
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

        this.update(this.root, allRoots, groupRootsMap);

        if (zoomTargetNode) {
            this.zoomToNode(zoomTargetNode, 750);
        } else {
            this.zoomToNode(this.root, 750);
        }
    }

    resetZoom() {
        if (this.root) {
            this.zoomToNode(this.root, 750);
        }
    }

    zoomToNode(d, duration = 750) {
        const scale = 0.75;
        const tx = 30;
        let ty;
        if (!d.parent) {
            ty = 30 - d.x * scale;
        } else {
            ty = (window.innerHeight - 60) / 2 - d.x * scale;
        }

        if (duration === 0) {
            this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        } else {
            this.svg.transition().duration(duration).call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
        }
    }

    update(source, allRoots, groupRootsMap) {
        const nodes = this.root.descendants();
        const links = this.root.links();
        const isSquare = this.isSquare;
        const peopleData = this.peopleData;

        let index = -1;
        this.root.eachBefore((n) => {
            n.x = ++index * 45;
            n.y = n.depth * 50;
        });

        const node = this.g.selectAll(".node").data(nodes, (d) => d.data.id);

        const getNodeClass = (d) => {
            let cls = "node";
            if (d.data.isPerson) cls += " node--person";
            if (d.data.isAutoPlaced) cls += " node--autoplaced";
            if (d.data.isSearchMatch) cls += " node--search-match";
            const hasNote = d.data.note && d.data.note.trim() !== "" && d.data.note !== translations[state.currentLang].notePathMissing;
            if (hasNote || allRoots.has(d.data.haplogroup) || (d.data.isPerson && d.data.test && d.data.test.includes("Big Y"))) {
                cls += " node--prominent";
            }
            return cls;
        };

        const nodeEnter = node.enter().append("g")
            .attr("class", getNodeClass)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .style("opacity", 0)
            .style("cursor", d => d.data.isPerson ? "default" : "pointer")
            .on("click", (event, d) => {
                if (d.data.isPerson) return;
                event.stopPropagation();

                const getGroupKey = (hg) => Object.keys(groupRootsMap).find(k => groupRootsMap[k] === hg || k === hg);
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
                this.tooltip.transition().duration(100).style("opacity", 1);
                const error = d.data.isAutoPlaced ? `<br><span class="error-tag">⚠ ${translations[state.currentLang].missingPath}</span>` : "";
                if (d.data.isPerson) {
                    this.tooltip.html(getPersonTooltip(d.data, error));
                } else {
                    let notePart = d.data.note && d.data.note.trim() !== "" && d.data.note !== translations[state.currentLang].notePathMissing ? ` (${d.data.note})` : "";
                    if (!notePart) {
                        const rootGroupKey = Object.keys(groupRootsMap).find((k) => groupRootsMap[k] === d.data.haplogroup || k === d.data.haplogroup);
                        if (rootGroupKey) notePart = ` (${rootGroupKey})`;
                    }
                    this.tooltip.html(`${translations[state.currentLang].snpLabel}: <b>${d.data.haplogroup}${notePart}</b>${error}<br>${translations[state.currentLang].ageEstimate}: ${formatAge(d.data.age)}`);
                }
                this.tooltip.style("left", event.pageX + 15 + "px").style("top", event.pageY - 20 + "px");
            })
            .on("mousemove", (event) => this.tooltip.style("left", event.pageX + 15 + "px").style("top", event.pageY - 20 + "px"))
            .on("mouseout", () => this.tooltip.transition().duration(300).style("opacity", 0));

        nodeEnter.each(function (d) {
            const el = d3.select(this);
            if (d.data.isPerson) {
                const code = d.data.country || "un";
                el.append("image").attr("xlink:href", `https://flagcdn.com/w40/${code}.png`).attr("x", -12).attr("y", -8).attr("width", 24).attr("height", 16);
            } else {
                const radius = d3.select(this.parentNode).classed("node--prominent") ? 10.5 : 6.5;
                const getGroupKey = (hg) => Object.keys(groupRootsMap).find(k => groupRootsMap[k] === hg || k === hg);
                const groupKey = getGroupKey(d.data.haplogroup);
                const color = d.data.isAutoPlaced ? "#e53e3e" : groupKey ? getHaploColor(groupKey) : "#cbd5e0";

                const isDeselectedRoot = groupKey && !getSelectedGroups().has(groupKey);
                const hasHiddenChildren = d._children && d._children.length > 0;
                let hasPeople = false;
                if (isDeselectedRoot && peopleData) {
                    hasPeople = peopleData.some(p => p.group === groupKey);
                }
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
            .style("text-anchor", "start")
            .each(function (d) {
                const el = d3.select(this);
                if (d.data.isPerson) {
                    el.append("tspan").text(d.data.ancestor || d.data.surname);
                    if (d.data.location) {
                        el.append("tspan")
                            .attr("x", 18)
                            .attr("dy", "1.2em")
                            .style("font-size", "10px")
                            .style("fill", "#718096")
                            .text(d.data.location);
                    }
                } else {
                    let notePart = d.data.note && d.data.note.trim() !== "" && d.data.note !== translations[state.currentLang].notePathMissing ? ` (${d.data.note})` : "";
                    if (!notePart) {
                        const rootGroupKey = Object.keys(groupRootsMap).find((k) => groupRootsMap[k] === d.data.haplogroup || k === d.data.haplogroup);
                        if (rootGroupKey) notePart = ` (${rootGroupKey})`;
                    }
                    el.text(`${d.data.haplogroup}${notePart}`);
                }
            });

        const mergedNode = node.merge(nodeEnter);

        mergedNode
            .attr("class", getNodeClass)
            .transition().duration(600)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .style("opacity", 1);

        mergedNode.select(".shape").transition().duration(600)
            .style("fill", d => {
                const getGroupKey = (hg) => Object.keys(groupRootsMap).find(k => groupRootsMap[k] === hg || k === hg);
                const groupKey = getGroupKey(d.data.haplogroup);
                const color = d.data.isAutoPlaced ? "#e53e3e" : groupKey ? getHaploColor(groupKey) : "#cbd5e0";

                const isDeselectedRoot = groupKey && !getSelectedGroups().has(groupKey);
                const hasHiddenChildren = d._children && d._children.length > 0;
                let hasPeople = false;
                if (isDeselectedRoot && peopleData) {
                    hasPeople = peopleData.some(p => p.group === groupKey);
                }
                const isSolid = !hasHiddenChildren && !(isDeselectedRoot && hasPeople);
                return isSolid ? color : "#ffffff";
            })
            .style("stroke", d => {
                const getGroupKey = (hg) => Object.keys(groupRootsMap).find(k => groupRootsMap[k] === hg || k === hg);
                const groupKey = getGroupKey(d.data.haplogroup);
                return d.data.isAutoPlaced ? "#9b2c2c" : groupKey ? getHaploColor(groupKey) : "#cbd5e0";
            });

        node.exit().transition().duration(600)
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

        const linkEnter = link.enter().insert("path", "g").attr("class", "link")
            .style("stroke", getLinkColor)
            .style("stroke-width", "2.5px")
            .style("opacity", 0)
            .attr("d", (d) => `M${d.source.y},${d.source.x} V${d.target.x - 12} Q${d.source.y},${d.target.x} ${d.source.y + 12},${d.target.x} H${d.target.y}`);

        linkEnter.merge(link).transition().duration(600)
            .style("stroke", getLinkColor)
            .style("opacity", 0.8)
            .attr("d", (d) => `M${d.source.y},${d.source.x} V${d.target.x - 12} Q${d.source.y},${d.target.x} ${d.source.y + 12},${d.target.x} H${d.target.y}`);

        link.exit().transition().duration(600)
            .style("opacity", 0)
            .remove();

        nodes.forEach((d) => { d.x0 = d.x; d.y0 = d.y; });
    }
}