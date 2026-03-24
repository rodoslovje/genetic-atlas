import { state, translations, loadData, initFilters, updateURLState, getActiveData, getSelectedGroups, ydnaPeopleData, mtdnaPeopleData, ydnaGroupRoots, mtdnaGroupRoots } from "./shared.js";
import { initYDNA, refreshYDNADisplay, ydnaInitialized } from "./ydna.js";
import { initMTDNA, refreshMTDNADisplay, mtdnaInitialized } from "./mtdna.js";
import { mapVis } from "./map.js";

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
    updatePageTitle();
}

function updatePageTitle() {
    const view = (window.location.hash || "#map").substring(1);
    const lang = translations[state.currentLang];
    const viewName = lang[view] || view;
    const domain = window.location.hostname;

    if (domain) {
        document.title = `${viewName} - ${lang.brand} - ${domain}`;
    } else {
        document.title = `${viewName} - ${lang.brand}`;
    }
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

window.exportView = function (e) {
    e.preventDefault();
    const view = (window.location.hash || "#map").substring(1);
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.classList.add("active");

    // Delay briefly to allow the browser to paint the loading UI
    setTimeout(() => {
        if (view === "map") {
            const mapEl = document.getElementById("map-container");
            if (!mapEl || typeof html2canvas === "undefined") {
                if (overlay) overlay.classList.remove("active");
                return;
            }

            html2canvas(mapEl, { useCORS: true, allowTaint: false }).then(canvas => {
                const scale = window.devicePixelRatio || 1;

                const headerHeight = 80 * scale;
                const footerHeight = 60 * scale;
                const width = canvas.width;
                const height = canvas.height + headerHeight + footerHeight;

                const newCanvas = document.createElement("canvas");
                newCanvas.width = width;
                newCanvas.height = height;
                const ctx = newCanvas.getContext("2d");

                ctx.fillStyle = "#f1f5f9";
                ctx.fillRect(0, 0, width, height);

                ctx.drawImage(canvas, 0, headerHeight);

                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = translations[state.currentLang].attributionHtml;
                const sourceText = tempDiv.textContent || tempDiv.innerText || "";

                const titleText = `${translations[state.currentLang].brand} - ${translations[state.currentLang][view]}`;
                const urlText = window.location.hostname;

                ctx.textBaseline = "middle";
                ctx.textAlign = "left";
                ctx.font = `bold ${24 * scale}px 'Segoe UI', Tahoma, sans-serif`;
                ctx.fillStyle = "#1a365d";
                ctx.fillText(titleText, 20 * scale, headerHeight / 2);

                ctx.textAlign = "right";
                ctx.font = `${18 * scale}px 'Segoe UI', Tahoma, sans-serif`;
                ctx.fillStyle = "#2b6cb0";
                ctx.fillText(urlText, width - 20 * scale, headerHeight / 2);

                ctx.textAlign = "left";
                ctx.font = `${14 * scale}px 'Segoe UI', Tahoma, sans-serif`;
                ctx.fillStyle = "#4a5568";
                ctx.fillText(sourceText, 20 * scale, height - (footerHeight / 2));

                const link = document.createElement("a");
                link.download = `Slovenian_DNA_Map.png`;
                link.href = newCanvas.toDataURL("image/png");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                if (overlay) overlay.classList.remove("active");
            }).catch(err => {
                console.error("Map export failed:", err);
                if (overlay) overlay.classList.remove("active");
            });
            return;
        }

        if (view !== "ydna" && view !== "mtdna") {
            if (overlay) overlay.classList.remove("active");
            return;
        }

        const svgContainer = document.querySelector("#tree-container-" + view + " svg");
        if (!svgContainer) {
            if (overlay) overlay.classList.remove("active");
            return;
        }

        const clone = svgContainer.cloneNode(true);
        const g = clone.querySelector("g");
        if (!g) {
            if (overlay) overlay.classList.remove("active");
            return;
        }

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
        clone.setAttribute("viewBox", `${bbox.x - 60} ${bbox.y - 100} ${bbox.width + 120} ${bbox.height + 180}`);
        clone.setAttribute("width", bbox.width + 120);
        clone.setAttribute("height", bbox.height + 180);

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", bbox.x - 60); rect.setAttribute("y", bbox.y - 100);
        rect.setAttribute("width", bbox.width + 120); rect.setAttribute("height", bbox.height + 180);
        rect.setAttribute("fill", "#f1f5f9");
        clone.insertBefore(rect, clone.firstChild);

        const titleLink = document.createElementNS("http://www.w3.org/2000/svg", "a");
        titleLink.setAttribute("href", window.location.origin);
        titleLink.setAttribute("target", "_blank");

        const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        titleText.textContent = `${translations[state.currentLang].brand} - ${translations[state.currentLang][view]}`;
        titleText.setAttribute("x", bbox.x - 40);
        titleText.setAttribute("y", bbox.y - 55);
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
        urlText.setAttribute("y", bbox.y - 55);
        urlText.setAttribute("font-size", "18px");
        urlText.setAttribute("text-anchor", "end");
        urlText.setAttribute("fill", "#2b6cb0");
        urlLink.appendChild(urlText);
        clone.appendChild(urlLink);

        const sourceText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        sourceText.setAttribute("x", bbox.x - 40);
        sourceText.setAttribute("y", bbox.y + bbox.height + 50);
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
        if (overlay) overlay.classList.remove("active");
    }, 50);
};

function validateSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    let hasResults = true;
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const currentView = (window.location.hash || "#map").substring(1);
        hasResults = false;

        const checkPeople = (people, selectedGroups, rootsMap) => {
            return people.some(p => {
                const matchesText = (p.surname && p.surname.toLowerCase().includes(query)) ||
                    (p.ancestor && p.ancestor.toLowerCase().includes(query)) ||
                    (p.kit && p.kit.toLowerCase().includes(query)) ||
                    (p.haplogroup && p.haplogroup.toLowerCase().includes(query));
                const matchesGroup = selectedGroups.has(p.group);
                const missingPath = ((currentView === "ydna" || currentView === "mtdna") && p.haplogroup === "" && !rootsMap[p.group]);
                return matchesText && matchesGroup && !missingPath;
            });
        };

        if ((currentView === "ydna" || currentView === "map") && ydnaPeopleData) {
            if (checkPeople(ydnaPeopleData, state.ydnaSelectedGroups, ydnaGroupRoots)) hasResults = true;
        }
        if ((currentView === "mtdna" || currentView === "map") && mtdnaPeopleData) {
            if (checkPeople(mtdnaPeopleData, state.mtdnaSelectedGroups, mtdnaGroupRoots)) hasResults = true;
        }
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
    let hash = window.location.hash;
    if (!hash || hash === "#ymap" || hash === "#mmap") hash = "#map";
    window.location.hash = hash;

    updatePageTitle();
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
    const lineageYdna = document.getElementById("lineage-controls-ydna");
    const lineageMtdna = document.getElementById("lineage-controls-mtdna");
    const treeOptions = document.getElementById("tree-options");
    const ydnaEras = document.getElementById("ydna-eras");
    const exportBtn = document.getElementById("export-btn");

    const isMap = view === "map";
    const isTree = view === "ydna" || view === "mtdna";

    if (exportBtn) {
        exportBtn.style.display = (isMap || isTree) ? "flex" : "none";
        const titleKey = isMap ? "exportMap" : "exportTree";
        exportBtn.setAttribute("data-i18n-title", titleKey);
        exportBtn.setAttribute("title", translations[state.currentLang][titleKey]);
    }

    if (isMap || isTree) {
        if (lineageYdna) lineageYdna.style.display = (isMap || view === "ydna") ? "block" : "none";
        if (lineageMtdna) lineageMtdna.style.display = (isMap || view === "mtdna") ? "block" : "none";
        if (treeOptions) treeOptions.style.display = isTree ? "block" : "none";

        if (isTree && ydnaEras) ydnaEras.style.display = "block";
        else if (ydnaEras) ydnaEras.style.display = "none";

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
            if (view === "map") {
                setTimeout(() => mapVis.initMap(), 50);
            }
            validateSearch();
        });
    } else {
        if (lineageYdna) lineageYdna.style.display = "none";
        if (lineageMtdna) lineageMtdna.style.display = "none";
        if (treeOptions) treeOptions.style.display = "none";
        if (ydnaEras) ydnaEras.style.display = "none";
    }
}

window.addEventListener("hashchange", handleHashChange);

function initApp() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.add("closed");
    }

    if (window.location.hash === "#ymap" || window.location.hash === "#mmap" || !window.location.hash) {
        window.location.hash = "#map";
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