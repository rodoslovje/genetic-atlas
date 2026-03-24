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

export const groupRoots = {
    A: "A-M91", B: "B-M60", C: "C-M130", D: "D-M174", E: "E-M96",
    G: "G-M201", H: "H-L901", I: "I-M170", I1: "I-M253", I2: "I-P215",
    J: "J-M304", L: "L-M20", N: "N-M231", O: "O-M175", Q: "Q-M242",
    R1a: "R-M420", R1b: "R-M343", R2: "R-M479", T: "T-M184"
};

// Configurable colors for each major haplogroup
export const haploColors = {
    "A": "#4b5563",    // Dark Grey
    "B": "#78350f",    // Brown
    "C": "#eab308",    // Gold / Yellow
    "D": "#9333ea",    // Purple
    "E": "#4ade80",    // Light Green
    "G": "#14b8a6",    // Teal / Turquoise
    "H": "#ea580c",    // Orange-Red
    "I": "#1d4ed8",    // Deep Blue
    "I1": "#3b82f6",   // Blue
    "I2": "#0369a1",   // Dark Blue
    "J": "#38bdf8",    // Light Blue / Sky Blue
    "L": "#d946ef",    // Pink / Fuchsia
    "N": "#15803d",    // Dark Green
    "O": "#84cc16",    // Lime Green
    "Q": "#c2410c",    // Burnt Orange
    "R1a": "#ff0000",  // Bright Red
    "R1b": "#800000",  // Dark Red / Maroon
    "R2": "#d81b60",   // Dark Pink
    "T": "#d97706",    // Tan / Gold
    "default": "#6b7280" // Gray fallback
};

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
    selectedGroups: new Set(Object.keys(groupRoots)),
    lastZoomedGroup: new URLSearchParams(window.location.search).get("zoom") || null,
    allSelected: true
};

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("groups")) {
    const groupsParam = urlParams.get("groups");
    state.selectedGroups = new Set(groupsParam ? groupsParam.split(",") : []);
    state.allSelected = state.selectedGroups.size === Object.keys(groupRoots).length;
}

export function updateURLState() {
    const params = new URLSearchParams(window.location.search);
    params.set("groups", Array.from(state.selectedGroups).join(","));
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

    return (
        `${lang.kit}: <b>${person.kit || "N/A"}</b><br>` +
        `${lang.testType}: <b>${person.test || "N/A"}</b><br>` +
        `${lang.lineage}: <b>${majorGroup}</b><br>` +
        `${lang.haplogroup}: <b>${haplo || "N/A"}</b>${error}<br>` +
        `${lang.surname}: <b>${person.surname || "N/A"}</b><br>` +
        `${lang.ancestor}: <b>${person.ancestor || "N/A"}</b><br>` +
        `${lang.location}: <b>${person.location || "N/A"}</b>`
    );
}

export let rawHaploData = null;
export let rawPeopleData = null;
let dataPromise = null;

export function loadData() {
    if (!dataPromise) {
        dataPromise = Promise.all([
            d3.json("/data/slo-ydna-paths.json"),
            d3.json("/data/slo-ydna.json")
        ]).then(([haplo, people]) => {
            rawHaploData = haplo;

            people.forEach((p) => {
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

            rawPeopleData = people;
        });
    }
    return dataPromise;
}

export function initFilters() {
    if (!rawPeopleData) return;
    const groups = [...new Set(rawPeopleData.map((p) => p.group))].filter((g) => g).sort();
    const listContainer = d3.select("#group-list");
    listContainer.html("");

    groups.forEach((groupName) => {
        const count = rawPeopleData.filter((p) => p.group === groupName).length;
        const isChecked = state.selectedGroups.has(groupName);
        const color = haploColors[groupName] || haploColors["default"];

        listContainer.append("div").attr("class", "group-item")
            .html(`<input type="checkbox" id="chk-${groupName}" ${isChecked ? "checked" : ""}><span style="width: 12px; height: 12px; border-radius: 50%; background: ${color}; margin-right: 6px; border: 1px solid rgba(0,0,0,0.15); flex-shrink: 0; display: inline-block;"></span><label for="chk-${groupName}">${translations[state.currentLang].haplogroup} ${groupName} (${count})</label>`)
            .on("change", function () {
                const cb = this.querySelector("input");
                if (cb.checked) {
                    state.selectedGroups.add(groupName);
                    state.lastZoomedGroup = groupName;
                } else {
                    state.selectedGroups.delete(groupName);
                }
                updateURLState();
                window.dispatchEvent(new CustomEvent("filterChanged", { detail: { groupName, checked: cb.checked } }));
            });
    });

    d3.select("#toggle-all").on("click", function () {
        state.allSelected = !state.allSelected;
        this.innerText = translations[state.currentLang][state.allSelected ? "deselectAll" : "selectAll"];

        if (state.allSelected) {
            Object.keys(groupRoots).forEach((k) => state.selectedGroups.add(k));
        } else {
            state.selectedGroups.clear();
        }

        groups.forEach((groupName) => {
            const chk = document.getElementById("chk-" + groupName);
            if (chk) chk.checked = state.allSelected;
        });
        updateURLState();
        window.dispatchEvent(new CustomEvent("filterChanged", { detail: { groupName: "ALL", checked: state.allSelected } }));
    });

    const eraListContainer = d3.select("#era-list");
    if (!eraListContainer.empty() && eraListContainer.html() === "") {
        eraColors.forEach((era) => {
            eraListContainer.append("div").attr("class", "legend-item")
                .html(`<div class="legend-color" style="background:${era.color};"></div><span data-i18n="${era.id}">${translations[state.currentLang][era.id]}</span>`);
        });
    }
}