import { state, translations, formatAge, getPersonTooltip, getHaploColor, eraColors, getSelectedGroups } from "./shared.js";

export class TreeVisualizer {
    constructor(containerSelector) {
        this.containerSelector = containerSelector;
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
                        originalHaplo: p.haplogroup, isAutoPlaced: !!dataMap[hg].isAutoPlaced
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
            filteredPeople = filteredPeople.filter((p) =>
                (p.surname && p.surname.toLowerCase().includes(query)) ||
                (p.ancestor && p.ancestor.toLowerCase().includes(query)) ||
                (p.kit && p.kit.toLowerCase().includes(query)) ||
                (p.haplogroup && p.haplogroup.toLowerCase().includes(query))
            );
        }

        const processedData = pruneTree(buildHierarchy(haploData, filteredPeople));

        if (!processedData) {
            this.g.selectAll(".node").remove();
            this.g.selectAll(".link").remove();
            this.root = null;
            return;
        }

        const newRoot = d3.hierarchy(processedData);

        if (this.root) {
            const oldNodes = new Map();
            this.root.each(d => oldNodes.set(d.data.id, d));
            newRoot.each(d => {
                const old = oldNodes.get(d.data.id);
                if (old && old._children) {
                    d._children = d.children;
                    d.children = null;
                }
            });
        }

        const groups = [...new Set(peopleData.map((p) => p.group))].filter((g) => g).sort();
        groups.forEach((groupName) => {
            const isChecked = selectedGroups.has(groupName);
            const targetRoot = groupRootsMap[groupName] || groupName;
            const target = newRoot.descendants().find((d) => d.data.haplogroup === targetRoot);

            if (target) {
                if (!isChecked && target.children) {
                    target._children = target.children;
                    target.children = null;
                } else if (isChecked && target._children) {
                    target.children = target._children;
                    target._children = null;
                }
            }

            if (!isChecked) {
                const visiblePeople = newRoot.descendants().filter((d) => d.data.isPerson && d.data.majorGroup === groupName);
                visiblePeople.forEach((personNode) => {
                    const parent = personNode.parent;
                    if (parent && parent.children) {
                        parent.children = parent.children.filter((c) => c !== personNode);
                        if (!parent._hiddenChildren) parent._hiddenChildren = [];
                        parent._hiddenChildren.push(personNode);
                    }
                });
            }
        });

        this.root = newRoot;

        const findPersonRecursively = (node) => {
            if (node.data.isPerson) return node;
            const kids = node.children || node._children;
            if (kids) {
                for (let c of kids) {
                    const found = findPersonRecursively(c);
                    if (found) return found;
                }
            }
            return null;
        };

        let zoomTargetNode = null;
        if (state.searchQuery) {
            zoomTargetNode = findPersonRecursively(this.root);
            if (zoomTargetNode) {
                let curr = zoomTargetNode.parent;
                while (curr) {
                    if (curr._children) {
                        curr.children = curr._children;
                        curr._children = null;
                    }
                    curr = curr.parent;
                }
            }
        }

        if (!zoomTargetNode) {
            let zoomTargetGroup = state.lastZoomedGroup;
            if (zoomTargetGroup && selectedGroups.has(zoomTargetGroup)) {
                const hg = groupRootsMap[zoomTargetGroup] || zoomTargetGroup;
                const findHg = (n, targetHg) => {
                    if (n.data.haplogroup === targetHg) return n;
                    const kids = n.children || n._children;
                    if (kids) {
                        for (let c of kids) {
                            const f = findHg(c, targetHg);
                            if (f) return f;
                        }
                    }
                    return null;
                };
                zoomTargetNode = findHg(this.root, hg);
            }
        }

        this.update(this.root, allRoots, groupRootsMap);

        if (zoomTargetNode) {
            this.zoomToNode(zoomTargetNode, 750);
        } else {
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

        let index = -1;
        this.root.eachBefore((n) => {
            n.x = ++index * 45;
            n.y = n.depth * 50;
        });

        const node = this.g.selectAll(".node").data(nodes, (d) => d.data.id);

        const nodeEnter = node.enter().append("g")
            .attr("class", (d) => {
                let cls = "node";
                if (d.data.isPerson) cls += " node--person";
                if (d.data.isAutoPlaced) cls += " node--autoplaced";
                const hasNote = d.data.note && d.data.note.trim() !== "" && d.data.note !== translations[state.currentLang].notePathMissing;
                if (hasNote || allRoots.has(d.data.haplogroup) || (d.data.isPerson && d.data.test && d.data.test.includes("Big Y"))) {
                    cls += " node--prominent";
                }
                return cls;
            })
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .style("opacity", 0)
            .style("cursor", d => d.data.isPerson ? "default" : "pointer")
            .on("click", (event, d) => {
                if (d.data.isPerson) return;
                event.stopPropagation();
                if (d.children) { d._children = d.children; d.children = null; }
                else if (d._children) { d.children = d._children; d._children = null; }
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

                el.append("circle").attr("r", radius).style("fill", color).style("stroke", d3.rgb(color).darker(1.2));
            }
        });

        nodeEnter.append("text").attr("dy", (d) => (d.data.isPerson ? ".35em" : "-0.4em")).attr("x", (d) => (d.data.isPerson ? 18 : 16)).style("text-anchor", "start").text((d) => {
            if (d.data.isPerson) return d.data.ancestor || d.data.surname;
            let notePart = d.data.note && d.data.note.trim() !== "" && d.data.note !== translations[state.currentLang].notePathMissing ? ` (${d.data.note})` : "";
            if (!notePart) {
                const rootGroupKey = Object.keys(groupRootsMap).find((k) => groupRootsMap[k] === d.data.haplogroup || k === d.data.haplogroup);
                if (rootGroupKey) notePart = ` (${rootGroupKey})`;
            }
            return `${d.data.haplogroup}${notePart}`;
        });

        node.merge(nodeEnter).transition().duration(600)
            .attr("transform", (d) => `translate(${d.y},${d.x})`)
            .style("opacity", 1);

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