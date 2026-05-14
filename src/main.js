import { state, translations, t, loadData, initFilters, updateURLState, ydnaPeopleData, mtdnaPeopleData, ydnaGroupRoots, mtdnaGroupRoots } from "./shared.js";
import { initYDNA, refreshYDNADisplay, ydnaInitialized, resetYDNATree } from "./ydna.js";
import { initMTDNA, refreshMTDNADisplay, mtdnaInitialized, resetMTDNATree } from "./mtdna.js";
import { mapVis } from "./map.js";

const languageConfig = {
    de: { flag: "de", text: "DE", fullText: "Deutsch (DE)" },
    en: { flag: "gb", text: "EN", fullText: "English (EN)" },
    hr: { flag: "hr", text: "HR", fullText: "Hrvatski (HR)" },
    hu: { flag: "hu", text: "HU", fullText: "Magyar (HU)" },
    it: { flag: "it", text: "IT", fullText: "Italiano (IT)" },
    sl: { flag: "si", text: "SL", fullText: "Slovenščina (SL)" }
};

function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[state.currentLang][key]) {
            el.innerText = t(key);
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (translations[state.currentLang][key]) {
            el.setAttribute("placeholder", t(key));
        }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        if (translations[state.currentLang][key]) {
            el.innerHTML = t(key);
        }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (translations[state.currentLang][key]) {
            el.setAttribute("title", t(key));
        }
    });

    checkNavOverflow();
    updatePageTitle();
}

function updatePageTitle() {
    const view = (window.location.hash || "#map").substring(1);
    const viewName = t(view);
    const domain = window.location.hostname;

    if (domain) {
        document.title = `${viewName} - ${t("brand")} - ${domain}`;
    } else {
        document.title = `${viewName} - ${t("brand")}`;
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

window.toggleLangMenuSidebar = function (e) {
    e.stopPropagation();
    document.getElementById("lang-menu-sidebar").classList.toggle("open");
};

window.setLanguage = function (e, lang) {
    e.preventDefault();
    state.currentLang = lang;
    localStorage.setItem("preferredLang", lang);
    loadVersionInfo();
    updateLangIcon();
    applyTranslations();
    initFilters();
    validateSearch();
    refreshYDNADisplay();
    refreshMTDNADisplay();
    document.getElementById("lang-menu").classList.remove("open");
    const sidebarMenu = document.getElementById("lang-menu-sidebar");
    if (sidebarMenu) sidebarMenu.classList.remove("open");
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("open");
};

function updateLangIcon() {
    const lang = state.currentLang;
    const config = languageConfig[lang] || languageConfig["en"];
    const imgSrc = `https://flagcdn.com/w20/${config.flag}.png`;

    const flag = document.getElementById("lang-btn-flag");
    const text = document.getElementById("lang-btn-text");
    if (flag && text) {
        flag.src = imgSrc;
        text.innerText = config.text;
    }

    const flagSidebar = document.getElementById("lang-btn-flag-sidebar");
    const textSidebar = document.getElementById("lang-btn-text-sidebar");
    if (flagSidebar && textSidebar) {
        flagSidebar.src = imgSrc;
        textSidebar.innerText = config.fullText;
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

    const langSelectorSidebar = document.querySelector(".lang-selector-sidebar");
    const langMenuSidebar = document.getElementById("lang-menu-sidebar");
    if (langSelectorSidebar && langMenuSidebar && !langSelectorSidebar.contains(e.target)) {
        langMenuSidebar.classList.remove("open");
    }
});

window.resetView = function (e) {
    e.preventDefault();
    const view = (window.location.hash || "#map").substring(1);
    if (view === "map") {
        mapVis.resetZoom();
    } else if (view === "ydna") {
        state.yzoom = null;
        updateURLState();
        resetYDNATree();
    } else if (view === "mtdna") {
        state.mzoom = null;
        updateURLState();
        resetMTDNATree();
    }
};

window.exportView = function (e) {
    e.preventDefault();
    const view = (window.location.hash || "#map").substring(1);
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.classList.add("active");

    // Delay briefly to allow the browser to paint the loading UI
    setTimeout(() => {
        if (view === "map") {
            const mapEl = document.getElementById(view + "-container");
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
                tempDiv.innerHTML = t("attributionHtml");
                const sourceText = tempDiv.textContent || tempDiv.innerText || "";

                const titleText = `${t("brand")} - ${t(view)}`;
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
            .node text { font-size: 12px; fill: #1a202c; }
            .node--person text { font-weight: normal; fill: #2c5282; font-size: 13px; }
            .node--prominent text { font-weight: bold; font-size: 13px; }
            .node--autoplaced text { fill: #c53030 !important; font-weight: bold; }
            .node--search-match text { fill: #c05621 !important; font-weight: 800 !important; font-size: 13.5px !important; }
            .link { fill: none; stroke-width: 1.5px; opacity: 0.5; }
        `;
        clone.insertBefore(style, clone.firstChild);

        const originalG = svgContainer.querySelector("g");
        const bbox = originalG.getBBox();

        const minWidth = 1000;
        const paddingY = 40;
        const contentWidth = bbox.width + 120;
        const extraWidth = Math.max(0, minWidth - contentWidth);
        const exportX = bbox.x - 60 - extraWidth / 2;
        const exportWidth = contentWidth + extraWidth;
        const exportY = bbox.y - 60 - paddingY;
        const exportHeight = bbox.height + 110 + (paddingY * 2);

        clone.setAttribute("viewBox", `${exportX} ${exportY} ${exportWidth} ${exportHeight}`);
        clone.setAttribute("width", exportWidth);
        clone.setAttribute("height", exportHeight);

        const footerBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        footerBg.setAttribute("x", exportX);
        footerBg.setAttribute("y", bbox.y + bbox.height + paddingY);
        footerBg.setAttribute("width", exportWidth);
        footerBg.setAttribute("height", 50);
        footerBg.setAttribute("fill", "#f1f5f9");
        clone.insertBefore(footerBg, clone.firstChild);

        const headerBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        headerBg.setAttribute("x", exportX);
        headerBg.setAttribute("y", exportY);
        headerBg.setAttribute("width", exportWidth);
        headerBg.setAttribute("height", 60);
        headerBg.setAttribute("fill", "#f1f5f9");
        clone.insertBefore(headerBg, clone.firstChild);

        const titleLink = document.createElementNS("http://www.w3.org/2000/svg", "a");
        titleLink.setAttribute("href", window.location.origin);
        titleLink.setAttribute("target", "_blank");

        const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        titleText.textContent = `${t("brand")} - ${t(view)}`;
        titleText.setAttribute("x", exportX + 20);
        titleText.setAttribute("y", exportY + 38);
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
        urlText.setAttribute("x", exportX + exportWidth - 20);
        urlText.setAttribute("y", exportY + 38);
        urlText.setAttribute("font-size", "18px");
        urlText.setAttribute("text-anchor", "end");
        urlText.setAttribute("fill", "#2b6cb0");
        urlLink.appendChild(urlText);
        clone.appendChild(urlLink);

        const sourceText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        sourceText.setAttribute("x", exportX + 20);
        sourceText.setAttribute("y", bbox.y + bbox.height + paddingY + 30);
        sourceText.setAttribute("font-size", "14px");
        sourceText.setAttribute("fill", "#4a5568");
        sourceText.setAttribute("xml:space", "preserve");

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = t("attributionHtml");

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

        const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Slovenian_${view.toUpperCase()}_Tree.svg`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        if (overlay) overlay.classList.remove("active");
    }, 50);
};

function validateSearch() {
    const searchInput = document.getElementById("search-input");
    const searchCounter = document.getElementById("search-counter");
    if (!searchInput) return;

    let hasResults = true;
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const currentView = (window.location.hash || "#map").substring(1);
        let matchCount = 0;

        const checkPeople = (people, selectedGroups, rootsMap) => {
            const matches = people.filter(p => {
                const matchesText = (p.surname && p.surname.toLowerCase().includes(query)) ||
                    (p.ancestor && p.ancestor.toLowerCase().includes(query)) ||
                    (p.kit && p.kit.toLowerCase().includes(query)) ||
                    (p.haplogroup && p.haplogroup.toLowerCase().includes(query));
                const matchesGroup = selectedGroups.has(p.group);
                const missingPath = ((currentView === "ydna" || currentView === "mtdna") && p.haplogroup === "" && !rootsMap[p.group]);
                return matchesText && matchesGroup && !missingPath;
            });
            return matches.length;
        };

        if ((currentView === "ydna" || currentView === "map") && ydnaPeopleData) {
            matchCount += checkPeople(ydnaPeopleData, state.ydnaSelectedGroups, ydnaGroupRoots);
        }
        if ((currentView === "mtdna" || currentView === "map") && mtdnaPeopleData) {
            matchCount += checkPeople(mtdnaPeopleData, state.mtdnaSelectedGroups, mtdnaGroupRoots);
        }

        hasResults = matchCount > 0;
        if (searchCounter) {
            searchCounter.innerText = t("searchMatches", matchCount);
            searchCounter.style.display = "block";
        }
    } else {
        if (searchCounter) searchCounter.style.display = "none";
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

    // Sanitize hash if it illegally contained query parameters
    if (hash.includes("?")) hash = hash.split("?")[0];
    if (hash.includes("&")) hash = hash.split("&")[0];

    if (window.location.hash !== hash) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search + hash);
    }

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
    const mapOptions = document.getElementById("map-options");
    const ydnaEras = document.getElementById("ydna-eras");
    const exportBtn = document.getElementById("export-btn");
    const resetBtn = document.getElementById("reset-btn");

    const isMap = view === "map";
    const isTree = view === "ydna" || view === "mtdna";

    if (exportBtn) {
        exportBtn.style.display = (isMap || isTree) ? "flex" : "none";
        const titleKey = isMap ? "exportMap" : "exportTree";
        exportBtn.setAttribute("data-i18n-title", titleKey);
        exportBtn.setAttribute("title", t(titleKey));
    }

    if (resetBtn) {
        resetBtn.style.display = (isMap || isTree) ? "flex" : "none";
    }

    if (isMap || isTree) {
        if (lineageYdna) lineageYdna.style.display = (isMap || view === "ydna") ? "block" : "none";
        if (lineageMtdna) lineageMtdna.style.display = (isMap || view === "mtdna") ? "block" : "none";
        if (treeOptions) treeOptions.style.display = isTree ? "block" : "none";
        if (mapOptions) mapOptions.style.display = isMap ? "block" : "none";

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

function renderLanguageMenus() {
    const menus = [document.getElementById("lang-menu"), document.getElementById("lang-menu-sidebar")];

    const sortedLangs = Object.entries(languageConfig)
        .map(([code, config]) => ({ code, ...config }))
        .sort((a, b) => a.fullText.localeCompare(b.fullText));

    menus.forEach(menu => {
        if (!menu) return;
        menu.innerHTML = "";
        sortedLangs.forEach(lang => {
            const a = document.createElement("a");
            a.href = "#";
            a.onclick = (e) => setLanguage(e, lang.code);
            a.innerHTML = `<img src="https://flagcdn.com/w20/${lang.flag}.png" alt="${lang.text}"> ${lang.fullText}`;
            menu.appendChild(a);
        });
    });
}

function initApp() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.add("closed");
    }

    if (window.location.hash === "#ymap" || window.location.hash === "#mmap" || !window.location.hash) {
        window.location.hash = "#map";
    }

    renderLanguageMenus();
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

    const chkShowLabels = document.getElementById("chk-show-labels");
    if (chkShowLabels) {
        chkShowLabels.checked = state.showLabels;
        chkShowLabels.addEventListener("change", (e) => {
            state.showLabels = e.target.checked;
            updateURLState();
            if (mapVis.mapInitialized) mapVis.refreshMap();
        });
    }

    let searchTimeout;
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");

    if (searchInput && searchClear) {
        searchInput.value = state.searchQuery;
        if (state.searchQuery) {
            searchClear.style.display = "block";
            searchInput.style.paddingRight = "75px";
        } else {
            searchInput.style.paddingRight = "6px";
        }

        const updateSearch = (val) => {
            state.searchQuery = val;
            searchClear.style.display = val ? "block" : "none";
            searchInput.style.paddingRight = val ? "75px" : "6px";
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
    loadVersionInfo();
}

function loadVersionInfo() {
    const versionEl = document.getElementById('version-info');
    const dataEl = document.getElementById('data-info');
    const formatDate = (iso) => iso.slice(0, 10);

    if (versionEl) {
        versionEl.innerText = t("versionLabel", formatDate(__BUILD_DATE__));
        versionEl.style.display = 'block';
    }
    if (dataEl) {
        dataEl.innerText = t("dataUpdateLabel", formatDate(__DATA_DATE__));
        dataEl.style.display = 'block';
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}