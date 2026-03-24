export const translations = {
    en: {
        brand: "Slovenian Genetic Heritage", map: "Map (Y-DNA)", ydna: "Paternal Tree (Y-DNA)", mtdna: "Maternal Tree (mtDNA)",
        comingSoon: "View (Coming Soon)", navTitle: "Navigation", langTitle: "Language",
        filterTitle: "Lineage", selectAll: "Select All", deselectAll: "Deselect All",
        showPassthrough: "Show all SNPs", eraTitle: "Eras", eraStone: "Stone Age",
        eraBronze: "Bronze Age", eraIron: "Iron Age", eraAntiquity: "Antiquity",
        eraMiddle: "Middle Age", eraModern: "Modern Age", kit: "Kit", surname: "Surname",
        testType: "Test", ancestor: "Ancestor", lineage: "Lineage", newestSnp: "Newest SNP",
        ageEstimate: "Age Estimate", missingPath: "Missing data", notePathMissing: "Path missing in JSON",
        bce: "BCE", ce: "CE", snpLabel: "SNP", haplogroup: "Haplogroup", location: "Location",
        infoDataFtdna: "Slovenian Origin project on FamilyTreeDNA", infoSloDnaPool: "Slovenian DNA Pool",
        infoSloGenSoc: "Slovenian Genealogical Society", searchTitle: "Search", searchPlaceholder: "Surname, ancestor, kit, haplogroup...",
        attributionHtml: "Source: <a href='https://www.familytreedna.com' target='_blank' rel='noopener noreferrer'>FamilyTreeDNA</a> and <a href='https://www.familytreedna.com/groups/slovenianorigin/about' target='_blank' rel='noopener noreferrer'>Slovenian Origin</a> project."
    },
    sl: {
        brand: "Slovenska genetska dediščina", map: "Zemljevid (Y-DNK)", ydna: "Očetovsko drevo (Y-DNK)", mtdna: "Materinsko drevo (mtDNK)",
        comingSoon: "Pogled (Kmalu)", navTitle: "Navigacija", langTitle: "Jezik",
        filterTitle: "Rod", selectAll: "Izberi vse", deselectAll: "Počisti vse",
        showPassthrough: "Prikaži vse SNP", eraTitle: "Obdobja", eraStone: "Kamena doba",
        eraBronze: "Bronasta doba", eraIron: "Železna doba", eraAntiquity: "Antika",
        eraMiddle: "Srednji vek", eraModern: "Novi vek", kit: "Komplet", surname: "Priimek",
        testType: "Test", ancestor: "Prednik", lineage: "Rod", newestSnp: "Najnovejši SNP",
        ageEstimate: "Ocena starosti", missingPath: "Pomanjkljivi podatki", notePathMissing: "V JSON manjka pot",
        bce: "pr. n. št.", ce: "n. št.", snpLabel: "SNP", haplogroup: "Haploskupina", location: "Lokacija",
        infoDataFtdna: "Projekt Slovensko poreklo na FamilyTreeDNA", infoSloDnaPool: "Slovenski DNK sklad",
        infoSloGenSoc: "Slovensko rodoslovno društvo", searchTitle: "Iskanje", searchPlaceholder: "Priimek, prednik, kit, haploskupina...",
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

    if (groupName.startsWith("H") && !groupName.startsWith("HV")) {
        const num = parseInt(groupName.replace(/\D/g, '')) || 0;
        const reds = [
            "#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d",
            "#f87171", "#fca5a5", "#e11d48", "#be123c", "#9f1239",
            "#881337", "#f43f5e", "#fb7185", "#fda4af"
        ];
        return reds[num % reds.length];
    }
    if (groupName.startsWith("U")) return "#f59e0b";
    if (groupName.startsWith("J")) return "#0ea5e9";
    if (groupName.startsWith("T")) return "#d97706";
    if (groupName.startsWith("K")) return "#10b981";
    if (groupName.startsWith("V") || groupName.startsWith("HV")) return "#6366f1";
    if (groupName.startsWith("W")) return "#e11d48";
    if (groupName.startsWith("X")) return "#06b6d4";
    if (groupName.startsWith("L")) return "#d946ef";
    if (groupName.startsWith("I")) return "#3b82f6";
    if (groupName.startsWith("N")) return "#15803d";
    if (groupName.startsWith("M")) return "#8b5cf6";
    if (groupName.startsWith("R")) return "#be185d";
    if (groupName.startsWith("A")) return "#4b5563";
    if (groupName.startsWith("B")) return "#78350f";
    if (groupName.startsWith("C")) return "#eab308";
    if (groupName.startsWith("D")) return "#9333ea";
    if (groupName.startsWith("E")) return "#4ade80";
    if (groupName.startsWith("G")) return "#14b8a6";
    if (groupName.startsWith("S")) return "#fb923c";
    if (groupName.startsWith("Y")) return "#fb7185";
    if (groupName.startsWith("Z")) return "#22d3ee";

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

    const newUrl = window.location.pathname + "?" + params.toString().replace(/%2C/g, ",") + window.location.hash;
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
    const { people, roots } = getActiveData();
    if (!people) return;
    const groups = [...new Set(people.map((p) => p.group))].filter((g) => g).sort();
    const listContainer = d3.select("#group-list");
    listContainer.html("");

    const selectedGroups = getSelectedGroups();

    groups.forEach((groupName) => {
        const count = people.filter((p) => p.group === groupName).length;
        const isChecked = selectedGroups.has(groupName);
        const color = getHaploColor(groupName);

        listContainer.append("div").attr("class", "group-item")
            .html(`<input type="checkbox" id="chk-${groupName}" ${isChecked ? "checked" : ""}><span style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; margin-right: 6px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block;"></span><label for="chk-${groupName}">${translations[state.currentLang].haplogroup} ${groupName} (${count})</label>`)
            .on("change", function () {
                const cb = this.querySelector("input");
                if (cb.checked) {
                    selectedGroups.add(groupName);
                    state.lastZoomedGroup = groupName;
                } else {
                    selectedGroups.delete(groupName);
                }

                const view = (window.location.hash || "#map").substring(1);
                if (view === "mtdna") state.mtdnaAllSelected = selectedGroups.size === groups.length;
                else state.ydnaAllSelected = selectedGroups.size === Object.keys(roots).length;

                updateURLState();
                window.dispatchEvent(new CustomEvent("filterChanged", { detail: { groupName, checked: cb.checked } }));
            });
    });

    const isAllSelected = (window.location.hash || "#map").substring(1) === "mtdna" ? state.mtdnaAllSelected : state.ydnaAllSelected;

    d3.select("#toggle-all").on("click", function () {
        const view = (window.location.hash || "#map").substring(1);
        let newState;
        if (view === "mtdna") {
            state.mtdnaAllSelected = !state.mtdnaAllSelected;
            newState = state.mtdnaAllSelected;
            if (newState) groups.forEach(k => state.mtdnaSelectedGroups.add(k));
            else state.mtdnaSelectedGroups.clear();
        } else {
            state.ydnaAllSelected = !state.ydnaAllSelected;
            newState = state.ydnaAllSelected;
            if (newState) Object.keys(roots).forEach((k) => state.ydnaSelectedGroups.add(k));
            else state.ydnaSelectedGroups.clear();
        }

        this.innerText = translations[state.currentLang][newState ? "deselectAll" : "selectAll"];

        groups.forEach((groupName) => {
            const chk = document.getElementById("chk-" + groupName);
            if (chk) chk.checked = newState;
        });
        updateURLState();
        window.dispatchEvent(new CustomEvent("filterChanged", { detail: { groupName: "ALL", checked: newState } }));
    });

    const toggleAllBtn = document.getElementById("toggle-all");
    if (toggleAllBtn) {
        toggleAllBtn.innerText = translations[state.currentLang][isAllSelected ? "deselectAll" : "selectAll"];
    }

    const eraListContainer = d3.select("#era-list");
    if (!eraListContainer.empty() && eraListContainer.html() === "") {
        eraColors.forEach((era) => {
            eraListContainer.append("div").attr("class", "legend-item")
                .html(`<div class="legend-color" style="background:${era.color};"></div><span data-i18n="${era.id}">${translations[state.currentLang][era.id]}</span>`);
        });
    }
}