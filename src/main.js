import { state, translations, loadData, initFilters, updateURLState, getActiveData, getSelectedGroups } from "./shared.js";
import { initYDNA, refreshYDNADisplay, ydnaInitialized } from "./ydna.js";
import { initMTDNA, refreshMTDNADisplay, mtdnaInitialized } from "./mtdna.js";
import { initMap, mapInitialized } from "./map.js";

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[state.currentLang][key]) {
            el.innerText = translations[state.currentLang][key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[state.currentLang][key]) {
            el.setAttribute("placeholder", translations[state.currentLang][key]);
        }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        if (translations[state.currentLang][key]) {
            el.innerHTML = translations[state.currentLang][key];
        }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (translations[state.currentLang][key]) {
            el.setAttribute("title", translations[state.currentLang][key]);
        }
    });

    checkNavOverflow();
}

function checkNavOverflow() {
    const navbar = document.getElementById("navbar");
    if (navbar) {
        document.body.classList.remove("compact-nav");
        if (navbar.scrollWidth > navbar.clientWidth) {
            document.body.classList.add("compact-nav");
        }
    }
}

window.addEventListener("resize", checkNavOverflow);

window.toggleSidebar = function () {
    document.getElementById("sidebar").classList.toggle("open");
};

window.resetApp = function (e) {
    e.preventDefault();
    window.location.href = window.location.pathname;
};

window.toggleInfoBubble = function () {
    document.getElementById("info-bubble").classList.toggle("open");
};

window.toggleLangMenu = function (e) {
    e.stopPropagation();
    document.getElementById("lang-menu").classList.toggle("open");
};

window.setLanguage = function (e, lang) {
    e.preventDefault();
    state.currentLang = lang;
    localStorage.setItem("preferredLang", lang);
    updateLangIcon();
    applyTranslations();
    initFilters();
    refreshYDNADisplay();
    refreshMTDNADisplay();
    document.getElementById("lang-menu").classList.remove("open");
};

function updateLangIcon() {
    const flag = document.getElementById("lang-btn-flag");
    const text = document.getElementById("lang-btn-text");
    if (flag && text) {
        if (state.currentLang === "sl") {
            flag.src = "https://flagcdn.com/w20/si.png";
            text.innerText = "SL";
        } else {
            flag.src = "https://flagcdn.com/w20/gb.png";
            text.innerText = "EN";
        }
    }
}

window.addEventListener("click", (e) => {
    const infoWidget = document.getElementById("info-widget");
    const infoBubble = document.getElementById("info-bubble");
    if (infoWidget && infoBubble && !infoWidget.contains(e.target)) {
        infoBubble.classList.remove("open");
    }

    const langSelector = document.querySelector(".lang-selector");
    const langMenu = document.getElementById("lang-menu");
    if (langSelector && langMenu && !langSelector.contains(e.target)) {
        langMenu.classList.remove("open");
    }
});

window.exportTree = function (e) {
    e.preventDefault();
    const view = (window.location.hash || "#map").substring(1);
    if (view !== "ydna" && view !== "mtdna") return;

    const svgContainer = document.querySelector("#tree-container-" + view + " svg");
    if (!svgContainer) return;

    const clone = svgContainer.cloneNode(true);
    const g = clone.querySelector("g");
    if (!g) return;

    g.removeAttribute("transform"); // Reset pan/zoom on the exported version

    const style = document.createElement("style");
    style.textContent = `
        text { font-family: 'Segoe UI', Tahoma, sans-serif; }
        .node circle { stroke-width: 2.5px; }
        .node text { font-size: 11px; fill: #1a202c; }
        .node--person text { font-weight: normal; fill: #2c5282; font-size: 12px; }
        .node--prominent text { font-weight: bold; font-size: 12px; }
        .node--autoplaced circle { fill: #e53e3e !important; stroke: #9b2c2c !important; }
        .node--autoplaced text { fill: #c53030 !important; font-weight: bold; }
        .node--search-match text { fill: #c05621 !important; font-weight: 800 !important; font-size: 13.5px !important; }
        .link { fill: none; stroke-width: 1.5px; opacity: 0.5; }
    `;
    clone.insertBefore(style, clone.firstChild);

    const originalG = svgContainer.querySelector("g");
    const bbox = originalG.getBBox();
    clone.setAttribute("viewBox", `${bbox.x - 50} ${bbox.y - 80} ${bbox.width + 100} ${bbox.height + 130}`);
    clone.setAttribute("width", bbox.width + 100);
    clone.setAttribute("height", bbox.height + 130);

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", bbox.x - 50); rect.setAttribute("y", bbox.y - 80);
    rect.setAttribute("width", bbox.width + 100); rect.setAttribute("height", bbox.height + 130);
    rect.setAttribute("fill", "#f1f5f9");
    clone.insertBefore(rect, clone.firstChild);

    const titleLink = document.createElementNS("http://www.w3.org/2000/svg", "a");
    titleLink.setAttribute("href", window.location.origin);
    titleLink.setAttribute("target", "_blank");

    const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    titleText.textContent = `${translations[state.currentLang].brand} - ${translations[state.currentLang][view]}`;
    titleText.setAttribute("x", bbox.x - 40);
    titleText.setAttribute("y", bbox.y - 45);
    titleText.setAttribute("font-size", "24px");
    titleText.setAttribute("font-weight", "bold");
    titleText.setAttribute("fill", "#1a365d");
    titleLink.appendChild(titleText);
    clone.appendChild(titleLink);

    const urlLink = document.createElementNS("http://www.w3.org/2000/svg", "a");
    urlLink.setAttribute("href", window.location.origin);
    urlLink.setAttribute("target", "_blank");

    const urlText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    urlText.textContent = window.location.hostname;
    urlText.setAttribute("x", bbox.x + bbox.width + 40);
    urlText.setAttribute("y", bbox.y - 45);
    urlText.setAttribute("font-size", "18px");
    urlText.setAttribute("text-anchor", "end");
    urlText.setAttribute("fill", "#2b6cb0");
    urlLink.appendChild(urlText);
    clone.appendChild(urlLink);

    const sourceText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    sourceText.setAttribute("x", bbox.x - 40);
    sourceText.setAttribute("y", bbox.y + bbox.height + 40);
    sourceText.setAttribute("font-size", "14px");
    sourceText.setAttribute("fill", "#4a5568");
    sourceText.setAttribute("xml:space", "preserve");

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = translations[state.currentLang].attributionHtml;

    Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeType === 3) { // TEXT_NODE
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.textContent = node.textContent;
            sourceText.appendChild(tspan);
        } else if (node.nodeName === "A") {
            const a = document.createElementNS("http://www.w3.org/2000/svg", "a");
            a.setAttribute("href", node.getAttribute("href"));
            a.setAttribute("target", "_blank");
            const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
            tspan.textContent = node.textContent;
            tspan.setAttribute("fill", "#2b6cb0");
            a.appendChild(tspan);
            sourceText.appendChild(a);
        }
    });

    clone.appendChild(sourceText);

    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Slovenian_${view.toUpperCase()}_Tree.svg`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
};

function validateSearch() {
    const searchInput = document.getElementById("search-input");
    const { people, roots } = getActiveData();
    const selectedGroups = getSelectedGroups();
    if (!searchInput || !people) return;

    let hasResults = true;
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const currentView = (window.location.hash || "#map").substring(1);

        hasResults = people.some(p => {
            const matchesText = (p.surname && p.surname.toLowerCase().includes(query)) ||
                (p.ancestor && p.ancestor.toLowerCase().includes(query)) ||
                (p.kit && p.kit.toLowerCase().includes(query)) ||
                (p.haplogroup && p.haplogroup.toLowerCase().includes(query));

            const matchesGroup = selectedGroups.has(p.group);
            const missingPath = ((currentView === "ydna" || currentView === "mtdna") && p.haplogroup === "" && !roots[p.group]);

            return matchesText && matchesGroup && !missingPath;
        });
    }
    searchInput.style.color = hasResults ? "" : "#e53e3e";
}

window.addEventListener("filterChanged", () => {
    validateSearch();
    const view = (window.location.hash || "#map").substring(1);
    if (view === "ydna") refreshYDNADisplay();
    else if (view === "mtdna") refreshMTDNADisplay();
});

function handleHashChange() {
    const hash = window.location.hash || "#map";
    document.querySelectorAll(".page-view").forEach(el => el.classList.remove("active"));

    const viewId = "view-" + hash.substring(1);
    const viewEl = document.getElementById(viewId);
    if (viewEl) viewEl.classList.add("active");

    document.querySelectorAll(".nav-route").forEach(el => {
        el.classList.remove("active");
        if (el.getAttribute("href") === hash) {
            el.classList.add("active");
        }
    });

    const view = hash.substring(1);
    const sidebar = document.getElementById("sidebar");
    const lineageControls = document.getElementById("lineage-controls");
    const ydnaEras = document.getElementById("ydna-eras");
    const passthroughContainer = document.getElementById("passthrough-container");
    const exportBtn = document.getElementById("export-btn");

    if (exportBtn) {
        exportBtn.style.display = (view === "ydna" || view === "mtdna") ? "flex" : "none";
    }

    if (view === "ydna" || view === "mtdna" || view === "map") {
        if (lineageControls) lineageControls.style.display = "block";

        if ((view === "ydna" || view === "mtdna") && ydnaEras) ydnaEras.style.display = "block";
        else if (ydnaEras) ydnaEras.style.display = "none";

        if (passthroughContainer) {
            passthroughContainer.style.display = (view === "ydna" || view === "mtdna") ? "flex" : "none";
        }

        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.add("open");
        }

        loadData().then(() => {
            initFilters();
            if (view === "ydna" && !ydnaInitialized) {
                initYDNA();
            }
            if (view === "mtdna" && !mtdnaInitialized) {
                initMTDNA();
            }
            if (view === "map" && !mapInitialized) {
                setTimeout(initMap, 50);
            }
            validateSearch();
        });
    } else {
        if (lineageControls) lineageControls.style.display = "none";
        if (ydnaEras) ydnaEras.style.display = "none";
    }
}

window.addEventListener("hashchange", handleHashChange);

function initApp() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.add("closed");
    }

    updateLangIcon();

    const chkPassthrough = document.getElementById("chk-passthrough");
    if (chkPassthrough) {
        chkPassthrough.checked = state.showPassthrough;
        chkPassthrough.addEventListener("change", (e) => {
            state.showPassthrough = e.target.checked;
            updateURLState();
            const view = (window.location.hash || "#map").substring(1);
            if (view === "ydna") refreshYDNADisplay();
            else if (view === "mtdna") refreshMTDNADisplay();
        });
    }

    let searchTimeout;
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");

    if (searchInput && searchClear) {
        searchInput.value = state.searchQuery;
        if (state.searchQuery) {
            searchClear.style.display = "block";
        }

        const updateSearch = (val) => {
            state.searchQuery = val;
            searchClear.style.display = val ? "block" : "none";
            validateSearch();
            updateURLState();

            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                window.dispatchEvent(new CustomEvent("searchChanged"));
                const view = (window.location.hash || "#map").substring(1);
                if (view === "ydna") refreshYDNADisplay();
                else if (view === "mtdna") refreshMTDNADisplay();
            }, 300);
        };

        searchInput.addEventListener("input", (e) => updateSearch(e.target.value));

        searchClear.addEventListener("click", () => {
            searchInput.value = "";
            updateSearch("");
        });
    }

    applyTranslations();
    handleHashChange();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}