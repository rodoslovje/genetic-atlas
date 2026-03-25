export const translations = {
    en: {
        brand: "Slovenian Genetic Heritage", map: "Map", ydna: "Paternal Tree (Y-DNA)", mtdna: "Maternal Tree (mtDNA)",
        comingSoon: "View (Coming Soon)", navTitle: "Navigation", langTitle: "Language",
        filterTitleYdna: "Lineage (Y-DNA)", filterTitleMtdna: "Lineage (mtDNA)", selectAll: "Select All", deselectAll: "Deselect All",
        showPassthrough: "Show all SNPs", eraTitle: "Eras", eraStone: "Stone Age",
        eraBronze: "Bronze Age", eraIron: "Iron Age", eraAntiquity: "Antiquity",
        eraMiddle: "Middle Age", eraModern: "Modern Age", kit: "Kit", surname: "Surname",
        testType: "Test", ancestor: "Ancestor", lineage: "Lineage", newestSnp: "Newest SNP",
        ageEstimate: "Age Estimate", missingPath: "Missing data", notePathMissing: "Path missing in JSON",
        bce: "BCE", ce: "CE", snpLabel: "SNP", haplogroup: "Haplogroup", haplotype: "Haplotype", location: "Location",
        infoDataFtdna: "Slovenian Origin project on FamilyTreeDNA", infoSloDnaPool: "Slovenian DNA Pool",
        infoSloGenSoc: "Slovenian Genealogical Society", searchTitle: "Search", searchPlaceholder: "Surname, haplogroup, kit...",
        exportTree: "Export Tree as SVG", exportMap: "Export Map as PNG", infoButton: "Additional Information", exporting: "Exporting...",
        searchMatches: "Found: {0}", resetView: "Reset View",
        attributionHtml: "Source: <a href='https://www.familytreedna.com' target='_blank' rel='noopener noreferrer'>FamilyTreeDNA</a> and <a href='https://www.familytreedna.com/groups/slovenianorigin/about' target='_blank' rel='noopener noreferrer'>Slovenian Origin</a> project."
    },
    sl: {
        brand: "Slovenska genetska dediščina", map: "Zemljevid", ydna: "Očetovsko drevo (Y-DNK)", mtdna: "Materinsko drevo (mtDNK)",
        comingSoon: "Pogled (Kmalu)", navTitle: "Navigacija", langTitle: "Jezik",
        filterTitleYdna: "Rod (Y-DNK)", filterTitleMtdna: "Rod (mtDNK)", selectAll: "Izberi vse", deselectAll: "Počisti vse",
        showPassthrough: "Prikaži vse SNP", eraTitle: "Obdobja", eraStone: "Kamena doba",
        eraBronze: "Bronasta doba", eraIron: "Železna doba", eraAntiquity: "Antika",
        eraMiddle: "Srednji vek", eraModern: "Novi vek", kit: "Komplet", surname: "Priimek",
        testType: "Test", ancestor: "Prednik", lineage: "Rod", newestSnp: "Najnovejši SNP",
        ageEstimate: "Ocena starosti", missingPath: "Pomanjkljivi podatki", notePathMissing: "V JSON manjka pot",
        bce: "pr. n. št.", ce: "n. št.", snpLabel: "SNP", haplogroup: "Haploskupina", haplotype: "Haplotip", location: "Lokacija",
        infoDataFtdna: "Projekt Slovensko poreklo na FamilyTreeDNA", infoSloDnaPool: "Slovenski DNK sklad",
        infoSloGenSoc: "Slovensko rodoslovno društvo", searchTitle: "Iskanje", searchPlaceholder: "Priimek, haploskupina, kit...",
        exportTree: "Izvozi drevo kot SVG", exportMap: "Izvozi zemljevid kot PNG", infoButton: "Dodatne informacije", exporting: "Izvažanje...",
        searchMatches: "Najdeno: {0}", resetView: "Ponastavi pogled",
        attributionHtml: "Vir: <a href='https://www.familytreedna.com' target='_blank' rel='noopener noreferrer'>FamilyTreeDNA</a> in projekt <a href='https://www.familytreedna.com/groups/slovenianorigin/about' target='_blank' rel='noopener noreferrer'>Slovensko poreklo</a>."
    }
};

export const ydnaGroupRoots = {
    A: "A-M91", B: "B-M60", C: "C-M130", D: "D-M174", E: "E-M96",
    G: "G-M201", H: "H-L901", I: "I-M170", I1: "I-M253", I2: "I-P215",
    J: "J-M304", L: "L-M20", N: "N-M231", O: "O-M175", Q: "Q-M242",
    R1a: "R-M420", R1b: "R-M343", R2: "R-M479", T: "T-M184"
};

export const mtdnaGroupRoots = {
    A: "A", B: "B", C: "C", D: "D", E: "E", F: "F", G: "G", H: "H", I: "I", J: "J", K: "K",
    L0: "L0", L1: "L1", L2: "L2", L3: "L3", L4: "L4", L5: "L5", L6: "L6", M: "M", N: "N",
    P: "P", Q: "Q", R: "R", S: "S", T: "T", U: "U", V: "V", W: "W", X: "X", Y: "Y", Z: "Z",
    H1: "H1", H2: "H2", H3: "H3", H4: "H4", H5: "H5", H6: "H6", H7: "H7", H10: "H10", H11: "H11",
    H15: "H15", H26: "H26", H27: "H27", H30: "H30", H33: "H33", H35: "H35", H40: "H40", H47: "H47", H65: "H65", H73: "H73", H85: "H85", "H-T152C!": "H",
    T1: "T1", T2: "T2", J1: "J1", J2: "J2", K1: "K1", K2: "K2", W1: "W1", W5: "W5", X2: "X2",
    HV: "HV", V7: "V7", V13: "V13", U1: "U1", U2: "U2", U3: "U3", U4: "U4", U5a: "U5a", U5b: "U5b", U7: "U7", N1: "N1"
};

// Configurable colors for each major haplogroup
export const haploColors = {
    // --- Shared & Y-DNA ---
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

    // --- mtDNA Specific Families ---
    // H Family (Reds)
    "H": "#ef4444", "H1": "#dc2626", "H2": "#b91c1c", "H3": "#991b1b",
    "H4": "#7f1d1d", "H5": "#f87171", "H6": "#fca5a5", "H7": "#fecaca",
    "H10": "#450a0a", "H11": "#9f1239",
    // U Family (Oranges/Ambers)
    "U": "#f59e0b", "U1": "#d97706", "U2": "#b45309", "U3": "#92400e",
    "U4": "#78350f", "U5a": "#fbbf24", "U5b": "#fcd34d", "U7": "#fef3c7",
    // J Family (Light Blues)
    "J": "#0ea5e9", "J1": "#0284c7", "J2": "#0369a1",
    // T Family (Tans/Yellows)
    "T": "#d97706", "T1": "#ca8a04", "T2": "#a16207",
    // K Family (Emerald/Greens)
    "K": "#10b981", "K1": "#059669", "K2": "#047857",
    // V & HV Family (Indigos/Purples)
    "HV": "#6366f1", "V": "#4f46e5", "V7": "#4338ca", "V13": "#3730a3",
    // W Family (Rose/Pinks)
    "W": "#f43f5e", "W1": "#e11d48", "W5": "#be123c",
    // X Family (Cyans)
    "X": "#06b6d4", "X2": "#0891b2",
    // L Family (Fuchsia/Pink)
    "L0": "#c026d3", "L1": "#a21caf", "L2": "#86198f", "L3": "#701a75",
    "L4": "#e879f9", "L5": "#f0abfc", "L6": "#fdf4ff",

    "default": "#6b7280" // Gray fallback
};

export function getHaploColor(groupName) {
    if (!groupName) return haploColors["default"];
    if (haploColors[groupName]) return haploColors[groupName];

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

    return haploColors["default"];
}

export const eraColors = [
    { start: -Infinity, color: "#a0aec0", id: "eraStone" },
    { start: -3300, color: "#b7791f", id: "eraBronze" },
    { start: -1200, color: "#78716c", id: "eraIron" },
    { start: -500, color: "#c53030", id: "eraAntiquity" },
    { start: 500, color: "#2b6cb0", id: "eraMiddle" },
    { start: 1500, color: "#38a169", id: "eraModern" }
];

export const state = {
    currentLang: localStorage.getItem("preferredLang") || (navigator.language && navigator.language.toLowerCase().startsWith("sl") ? "sl" : "en"),
    showPassthrough: new URLSearchParams(window.location.search).get("showAllSNP") === "true",
    searchQuery: new URLSearchParams(window.location.search).get("q") || "",
    ydnaSelectedGroups: new Set(),
    mtdnaSelectedGroups: new Set(),
    lastZoomedGroup: new URLSearchParams(window.location.search).get("zoom") || null,
    ydnaAllSelected: true,
    mtdnaAllSelected: true
};

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

export function updateURLState() {
    const params = new URLSearchParams(window.location.search);
    params.set("ygroups", Array.from(state.ydnaSelectedGroups).join(","));
    params.set("mgroups", Array.from(state.mtdnaSelectedGroups).join(","));
    params.delete("groups");
    if (state.lastZoomedGroup) params.set("zoom", state.lastZoomedGroup);
    if (state.showPassthrough) {
        params.set("showAllSNP", "true");
    } else {
        params.delete("showAllSNP");
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
    const era = age < 0 ? translations[state.currentLang].bce : translations[state.currentLang].ce;
    return `<b>${Math.abs(age).toLocaleString()} ${era}</b>`;
}

export function getPersonTooltip(person, error = "") {
    const lang = translations[state.currentLang];
    const majorGroup = person.majorGroup || person.group || "N/A";
    let haplo = person.originalHaplo ?? person.haplogroup ?? "";
    if (haplo === "-") haplo = "";

    let html = `${lang.kit}: <b>${person.kit || "N/A"}</b><br>`;
    if (person.test) html += `${lang.testType}: <b>${person.test}</b><br>`;
    html += `${lang.lineage}: <b>${majorGroup}</b><br>`;
    html += `${lang.haplogroup}: <b>${haplo || "N/A"}</b>${error}<br>`;
    if (person.haplotype) html += `${lang.haplotype}: <b>${person.haplotype}</b><br>`;
    html += `${lang.surname}: <b>${person.surname || "N/A"}</b><br>`;
    html += `${lang.ancestor}: <b>${person.ancestor || "N/A"}</b><br>`;
    if (person.location) html += `${lang.location}: <b>${person.location}</b>`;

    return html;
}

export let ydnaHaploData = null;
export let ydnaPeopleData = null;
export let mtdnaHaploData = null;
export let mtdnaPeopleData = null;
let dataPromise = null;

export function loadData() {
    if (!dataPromise) {
        dataPromise = Promise.all([
            d3.json("/data/slo-ydna-paths.json"),
            d3.json("/data/slo-ydna.json"),
            d3.json("/data/slo-mtdna-paths.json").catch(() => []),
            d3.json("/data/slo-mtdna.json").catch(() => [])
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
                    let match = p.haplogroup.match(/^[A-Z][0-9]?/);
                    if (match) p.group = match[0];
                }
            });
            mtdnaPeopleData = mtPeople;

            Object.keys(ydnaGroupRoots).forEach(k => state.ydnaSelectedGroups.add(k));
            const mtGroups = [...new Set(mtPeople.map(p => p.group))].filter(Boolean);
            mtGroups.forEach(k => state.mtdnaSelectedGroups.add(k));

            const urlParams = new URLSearchParams(window.location.search);
            const view = (window.location.hash || "#map").substring(1);

            if (urlParams.has("ygroups")) {
                const groupsParam = urlParams.get("ygroups");
                state.ydnaSelectedGroups = new Set(groupsParam ? groupsParam.split(",") : []);
            } else if (urlParams.has("groups") && view !== "mtdna") {
                const groupsParam = urlParams.get("groups");
                state.ydnaSelectedGroups = new Set(groupsParam ? groupsParam.split(",") : []);
            }

            if (urlParams.has("mgroups")) {
                const groupsParam = urlParams.get("mgroups");
                state.mtdnaSelectedGroups = new Set(groupsParam ? groupsParam.split(",") : []);
            } else if (urlParams.has("groups") && view === "mtdna") {
                const groupsParam = urlParams.get("groups");
                state.mtdnaSelectedGroups = new Set(groupsParam ? groupsParam.split(",") : []);
            }
        });
    }
    return dataPromise;
}

export function initFilters() {
    if (!ydnaPeopleData || !mtdnaPeopleData) return;

    const buildList = (people, haploData, rootsMap, selectedGroups, listId, toggleId, isMtDna) => {
        const groups = [...new Set(people.map((p) => p.group))].filter(Boolean);

        // 1. Build parent lookup from true phylogenetic tree paths
        const parentMap = {};
        if (haploData) {
            haploData.forEach(d => {
                parentMap[d.haplogroup] = d.parent;
            });
        }

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

        // 2. Map groups to their tree nodes and fetch their full ancestry
        const groupHgs = {};
        groups.forEach(g => groupHgs[g] = rootsMap[g] || g);

        const groupAncestors = {};
        groups.forEach(g => groupAncestors[g] = getAncestors(groupHgs[g]));

        // 3. Find the closest visible parent group for each group
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

        // 4. Sort siblings logically and build final ordered structure
        const childrenMap = {};
        groups.forEach(g => childrenMap[g] = []);

        groups.sort((a, b) => {
            const re = /([A-Za-z]+)|([0-9]+)/g;
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

        const rootGroups = [];
        groups.forEach(g => {
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

        const listContainer = d3.select(listId);
        listContainer.html("");

        orderedGroups.forEach((groupName) => {
            const count = people.filter((p) => p.group === groupName).length;
            const isChecked = selectedGroups.has(groupName);
            const color = getHaploColor(groupName);
            const shapeStyle = isMtDna ? "border-radius: 50%;" : "border-radius: 0%;";

            let indentStyle = null;
            const depth = groupDepths[groupName];
            if (depth > 0) {
                indentStyle = `margin-left: ${depth * 12}px;`;
            }

            listContainer.append("div").attr("class", "group-item")
                .attr("style", indentStyle)
                .html(`<input type="checkbox" id="chk-${isMtDna?'m':'y'}-${groupName}" ${isChecked ? "checked" : ""}><span style="width: 12px; height: 12px; ${shapeStyle} background: ${color}; margin-right: 6px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block;"></span><label for="chk-${isMtDna?'m':'y'}-${groupName}">${translations[state.currentLang].haplogroup} ${groupName} (${count})</label>`)
                .on("change", function () {
                    const cb = this.querySelector("input");
                    if (cb.checked) {
                        selectedGroups.add(groupName);
                    } else {
                        selectedGroups.delete(groupName);
                    }
                    state.lastZoomedGroup = groupName;
                    if (isMtDna) state.mtdnaAllSelected = selectedGroups.size === groups.length;
                    else state.ydnaAllSelected = selectedGroups.size === Object.keys(rootsMap).length;
                    updateURLState();
                    window.dispatchEvent(new CustomEvent("filterChanged"));
                });
        });

        d3.select(toggleId).on("click", function () {
            let newState;
            state.lastZoomedGroup = null;
            if (isMtDna) {
                state.mtdnaAllSelected = !state.mtdnaAllSelected;
                newState = state.mtdnaAllSelected;
                if (newState) groups.forEach(k => state.mtdnaSelectedGroups.add(k));
                else state.mtdnaSelectedGroups.clear();
            } else {
                state.ydnaAllSelected = !state.ydnaAllSelected;
                newState = state.ydnaAllSelected;
                if (newState) Object.keys(rootsMap).forEach((k) => state.ydnaSelectedGroups.add(k));
                else state.ydnaSelectedGroups.clear();
            }

            this.innerText = translations[state.currentLang][newState ? "deselectAll" : "selectAll"];
            groups.forEach((groupName) => {
                const chk = document.getElementById(`chk-${isMtDna?'m':'y'}-${groupName}`);
                if (chk) chk.checked = newState;
            });
            updateURLState();
            window.dispatchEvent(new CustomEvent("filterChanged"));
        });

        const btnEl = document.getElementById(toggleId.substring(1));
        if (btnEl) {
            const allSel = isMtDna ? state.mtdnaAllSelected : state.ydnaAllSelected;
            btnEl.innerText = translations[state.currentLang][allSel ? "deselectAll" : "selectAll"];
        }
    };

    buildList(ydnaPeopleData, ydnaHaploData, ydnaGroupRoots, state.ydnaSelectedGroups, "#group-list-ydna", "#toggle-all-ydna", false);
    buildList(mtdnaPeopleData, mtdnaHaploData, mtdnaGroupRoots, state.mtdnaSelectedGroups, "#group-list-mtdna", "#toggle-all-mtdna", true);

    const eraListContainer = d3.select("#era-list");
    if (!eraListContainer.empty() && eraListContainer.html() === "") {
        eraColors.forEach((era) => {
            eraListContainer.append("div").attr("class", "legend-item")
                .html(`<div class="legend-color" style="background:${era.color};"></div><span data-i18n="${era.id}">${translations[state.currentLang][era.id]}</span>`);
        });
    }
}