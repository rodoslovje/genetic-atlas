import { state, translations, t, loadData, loadTranslation, initFilters, updateURLState, ydnaPeopleData, mtdnaPeopleData, ydnaGroupRoots, mtdnaGroupRoots, matchesSearchQuery } from "./shared.js";

function currentLangDict() {
    return translations[state.currentLang] || translations.en;
}
import { ydna, mtdna } from "./lineage.js";
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
        if (currentLangDict()[key]) {
            el.innerText = t(key);
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (currentLangDict()[key]) {
            el.setAttribute("placeholder", t(key));
        }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        if (currentLangDict()[key]) {
            el.innerHTML = t(key);
        }
    });

    document.querySelectorAll("[data-i18n-title]").forEach(el => {
        const key = el.getAttribute("data-i18n-title");
        if (currentLangDict()[key]) {
            el.setAttribute("title", t(key));
        }
    });

    checkNavOverflow();
    updatePageTitle();
    updateInfoText();
}

function updateInfoText() {
    const view = (window.location.hash || "#map").substring(1);
    const container = document.getElementById("info-text-container");
    if (!container) return;

    const key = "infoText" + view.charAt(0).toUpperCase() + view.slice(1);
    const translatedText = currentLangDict()[key];

    if (translatedText) {
        container.innerHTML = translatedText;
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }
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

window.setLanguage = async function (e, lang) {
    e.preventDefault();
    await loadTranslation(lang);
    state.currentLang = lang;
    localStorage.setItem("preferredLang", lang);
    loadVersionInfo();
    updateLangIcon();
    applyTranslations();
    initFilters();
    validateSearch();
    ydna.refresh();
    mtdna.refresh();
    document.getElementById("lang-menu").classList.remove("open");
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

window.resetView = function (e) {
    e.preventDefault();
    const view = (window.location.hash || "#map").substring(1);
    if (view === "map") {
        mapVis.resetZoom();
    } else if (view === "ydna") {
        state.yzoom = null;
        updateURLState();
        ydna.reset();
    } else if (view === "mtdna") {
        state.mzoom = null;
        updateURLState();
        mtdna.reset();
    }
};

const SVG_NS = "http://www.w3.org/2000/svg";
const BG_COLOR = "#f1f5f9";
const TITLE_COLOR = "#1a365d";
const URL_COLOR = "#2b6cb0";
const ATTRIBUTION_COLOR = "#4a5568";
const CREATED_COLOR = "#718096";

// Single source of truth for the header/footer label strings used in both exports.
function getExportLabels(view) {
    return {
        title: `${t(view)} - ${t("brand")}`,
        url: window.location.hostname,
        urlHref: window.location.origin,
        created: t("createdLabel", new Date().toLocaleDateString(state.currentLang)),
        attributionHtml: t("attributionHtml"),
    };
}

function triggerDownload(url, filename) {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function setSvgAttrs(el, attrs) {
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function createSvg(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    setSvgAttrs(el, attrs);
    return el;
}

// Walks the attribution HTML and emits a list of {text, href?} segments that
// the SVG renderer turns into <tspan>/<a> children. Canvas renderer uses plain text.
function parseAttributionFragments(html) {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const out = [];
    for (const node of tmp.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            out.push({ text: node.textContent });
        } else if (node.nodeName === "A") {
            out.push({ text: node.textContent, href: node.getAttribute("href") });
        }
    }
    return out;
}

async function exportMapAsPng(overlay) {
    const mapEl = document.getElementById("map-container");
    if (!mapEl) {
        if (overlay) overlay.classList.remove("active");
        return;
    }

    const { default: html2canvas } = await import("html2canvas");
    html2canvas(mapEl, { useCORS: true, allowTaint: false }).then(canvas => {
        const labels = getExportLabels("map");
        const scale = window.devicePixelRatio || 1;
        const headerH = 80 * scale;
        const footerH = 60 * scale;
        const width = canvas.width;
        const height = canvas.height + headerH + footerH;

        const out = document.createElement("canvas");
        out.width = width;
        out.height = height;
        const ctx = out.getContext("2d");

        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(canvas, 0, headerH);

        const tmp = document.createElement("div");
        tmp.innerHTML = labels.attributionHtml;
        const attributionText = tmp.textContent || tmp.innerText || "";

        ctx.textBaseline = "middle";

        ctx.textAlign = "left";
        ctx.font = `bold ${24 * scale}px 'IBM Plex Sans', 'Segoe UI', Tahoma, sans-serif`;
        ctx.fillStyle = TITLE_COLOR;
        ctx.fillText(labels.title, 20 * scale, headerH / 2);

        ctx.textAlign = "right";
        ctx.font = `${18 * scale}px 'IBM Plex Sans', 'Segoe UI', Tahoma, sans-serif`;
        ctx.fillStyle = URL_COLOR;
        ctx.fillText(labels.url, width - 20 * scale, headerH / 2);

        ctx.textAlign = "left";
        ctx.font = `${14 * scale}px 'IBM Plex Sans', 'Segoe UI', Tahoma, sans-serif`;
        ctx.fillStyle = ATTRIBUTION_COLOR;
        ctx.fillText(attributionText, 20 * scale, height - footerH / 2);

        ctx.textAlign = "right";
        ctx.fillStyle = CREATED_COLOR;
        ctx.fillText(labels.created, width - 20 * scale, height - footerH / 2);

        triggerDownload(out.toDataURL("image/png"), "Slovenian_DNA_Map.png");
        if (overlay) overlay.classList.remove("active");
    }).catch(err => {
        console.error("Map export failed:", err);
        if (overlay) overlay.classList.remove("active");
    });
}

function addSvgHeader(clone, labels, x, y, width) {
    clone.insertBefore(createSvg("rect", { x, y, width, height: 60, fill: BG_COLOR }), clone.firstChild);

    const titleLink = createSvg("a", { href: labels.urlHref, target: "_blank" });
    titleLink.appendChild(createSvg("text", {
        x: x + 20, y: y + 38,
        "font-size": "24px", "font-weight": "bold", fill: TITLE_COLOR,
    })).textContent = labels.title;
    clone.appendChild(titleLink);

    const urlLink = createSvg("a", { href: labels.urlHref, target: "_blank" });
    urlLink.appendChild(createSvg("text", {
        x: x + width - 20, y: y + 38,
        "font-size": "18px", "text-anchor": "end", fill: URL_COLOR,
    })).textContent = labels.url;
    clone.appendChild(urlLink);
}

function addSvgFooter(clone, labels, x, y, width) {
    clone.insertBefore(createSvg("rect", { x, y, width, height: 50, fill: BG_COLOR }), clone.firstChild);

    const sourceText = createSvg("text", {
        x: x + 20, y: y + 30,
        "font-size": "14px", fill: ATTRIBUTION_COLOR, "xml:space": "preserve",
    });
    for (const frag of parseAttributionFragments(labels.attributionHtml)) {
        if (frag.href) {
            const a = createSvg("a", { href: frag.href, target: "_blank" });
            const tspan = createSvg("tspan", { fill: URL_COLOR });
            tspan.textContent = frag.text;
            a.appendChild(tspan);
            sourceText.appendChild(a);
        } else {
            const tspan = createSvg("tspan");
            tspan.textContent = frag.text;
            sourceText.appendChild(tspan);
        }
    }
    clone.appendChild(sourceText);

    const createdText = createSvg("text", {
        x: x + width - 20, y: y + 30,
        "font-size": "14px", "text-anchor": "end", fill: CREATED_COLOR,
    });
    createdText.textContent = labels.created;
    clone.appendChild(createdText);
}

function exportTreeAsSvg(view, overlay) {
    const svgContainer = document.querySelector("#tree-container-" + view + " svg");
    const g = svgContainer && svgContainer.querySelector("g");
    if (!svgContainer || !g) {
        if (overlay) overlay.classList.remove("active");
        return;
    }

    const clone = svgContainer.cloneNode(true);
    const cloneG = clone.querySelector("g");
    cloneG.removeAttribute("transform"); // Reset pan/zoom on the exported version

    const style = document.createElement("style");
    style.textContent = `
        text { font-family: 'IBM Plex Sans', 'Segoe UI', Tahoma, sans-serif; }
        .node circle { stroke-width: 2.5px; }
        .node text { font-size: 12px; fill: #1a202c; }
        .node--person text { font-weight: normal; fill: #2c5282; font-size: 13px; }
        .node--prominent text { font-weight: bold; font-size: 13px; }
        .node--autoplaced text { fill: #c53030 !important; font-weight: bold; }
        .node--search-match text { fill: #c05621 !important; font-size: 13.5px !important; }
        .link { fill: none; stroke-width: 1.5px; opacity: 0.5; }
    `;
    clone.insertBefore(style, clone.firstChild);

    const bbox = g.getBBox();
    const minWidth = 1000;
    const paddingY = 40;
    const contentWidth = bbox.width + 120;
    const extraWidth = Math.max(0, minWidth - contentWidth);
    const exportX = bbox.x - 60 - extraWidth / 2;
    const exportWidth = contentWidth + extraWidth;
    const exportY = bbox.y - 60 - paddingY;
    const exportHeight = bbox.height + 110 + (paddingY * 2);
    const footerY = bbox.y + bbox.height + paddingY;

    setSvgAttrs(clone, {
        viewBox: `${exportX} ${exportY} ${exportWidth} ${exportHeight}`,
        width: exportWidth,
        height: exportHeight,
    });

    const labels = getExportLabels(view);
    // Header text appended first then footer, preserving original z-order
    addSvgHeader(clone, labels, exportX, exportY, exportWidth);
    addSvgFooter(clone, labels, exportX, footerY, exportWidth);

    const svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    triggerDownload(URL.createObjectURL(blob), `Slovenian_${view.toUpperCase()}_Tree.svg`);
    if (overlay) overlay.classList.remove("active");
}

window.exportView = function (e) {
    e.preventDefault();
    const view = (window.location.hash || "#map").substring(1);
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.classList.add("active");

    // Delay briefly to allow the browser to paint the loading UI
    setTimeout(() => {
        if (view === "map") exportMapAsPng(overlay);
        else if (view === "ydna" || view === "mtdna") exportTreeAsSvg(view, overlay);
        else if (overlay) overlay.classList.remove("active");
    }, 50);
};

function validateSearch() {
    const searchInput = document.getElementById("search-input");
    const searchCounter = document.getElementById("search-counter");
    if (!searchInput) return;

    let hasResults = true;
    if (state.searchQuery) {
        const currentView = (window.location.hash || "#map").substring(1);
        let matchCount = 0;

        const checkPeople = (people, selectedGroups, rootsMap) => {
            const matches = people.filter(p => {
                const matchesGroup = selectedGroups.has(p.group);
                const missingPath = ((currentView === "ydna" || currentView === "mtdna") && p.haplogroup === "" && !rootsMap[p.group]);
                return matchesSearchQuery(p, state.searchQuery) && matchesGroup && !missingPath;
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
    if (view === "ydna") ydna.refresh();
    else if (view === "mtdna") mtdna.refresh();
});

function applySearchToCurrentView() {
    validateSearch();
    window.dispatchEvent(new CustomEvent("searchChanged"));
    const v = (window.location.hash || "#map").substring(1);
    if (v === "ydna" && ydna.initialized) ydna.refresh();
    else if (v === "mtdna" && mtdna.initialized) mtdna.refresh();
    else if (v === "map" && mapVis.mapInitialized) mapVis.refreshMap();
}

window.navigateToSearch = function (view, query) {
    state.searchQuery = query;
    const searchInput = document.getElementById("search-input");
    const searchClear = document.getElementById("search-clear");
    if (searchInput) {
        searchInput.value = query;
        searchInput.style.paddingRight = query ? "75px" : "6px";
    }
    if (searchClear) searchClear.style.display = query ? "block" : "none";
    updateURLState();

    document.querySelectorAll(".tooltip").forEach(el => { el.style.opacity = "0"; });
    if (mapVis.map) mapVis.map.closePopup();

    const targetHash = "#" + view;
    if (window.location.hash === targetHash) {
        applySearchToCurrentView();
    } else {
        window.location.hash = targetHash;
        // handleHashChange may need to load data and init the view; apply once that settles
        setTimeout(applySearchToCurrentView, 250);
    }
};

// Delegated click handler for tooltip/popup search links.
// Use capture phase so Leaflet's popup stopPropagation can't swallow the event.
document.addEventListener("click", (e) => {
    const link = e.target.closest(".tooltip-link");
    if (!link) return;
    e.preventDefault();
    e.stopPropagation();
    window.navigateToSearch(link.dataset.view, link.dataset.search);
}, true);

function handleHashChange() {
    let hash = window.location.hash;
    if (!hash || hash === "#ymap" || hash === "#mmap") hash = "#map";

    updatePageTitle();
    updateInfoText();
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
            if (view === "ydna" && !ydna.initialized) {
                ydna.init();
            }
            if (view === "mtdna" && !mtdna.initialized) {
                mtdna.init();
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
    const menus = [document.getElementById("lang-menu")];

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

async function initApp() {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.add("closed");
    }

    if (window.location.hash === "#ymap" || window.location.hash === "#mmap" || !window.location.hash) {
        window.location.hash = "#map";
    }

    // Load the user's preferred language before any translation lookup runs
    await loadTranslation(state.currentLang);

    renderLanguageMenus();
    updateLangIcon();

    const chkPassthrough = document.getElementById("chk-passthrough");
    if (chkPassthrough) {
        chkPassthrough.checked = state.showPassthrough;
        chkPassthrough.addEventListener("change", (e) => {
            state.showPassthrough = e.target.checked;
            updateURLState();
            const view = (window.location.hash || "#map").substring(1);
            if (view === "ydna") ydna.refresh();
            else if (view === "mtdna") mtdna.refresh();
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

    const chkShowAllMajor = document.getElementById("chk-show-all-major");
    if (chkShowAllMajor) {
        chkShowAllMajor.checked = state.showAllMajorGroups;
        chkShowAllMajor.addEventListener("change", (e) => {
            state.showAllMajorGroups = e.target.checked;
            updateURLState();

            if (state.ydnaAllSelected) {
                if (state.showAllMajorGroups) {
                    Object.keys(ydnaGroupRoots).forEach(k => state.ydnaSelectedGroups.add(k));
                } else {
                    const validYGroups = new Set(ydnaPeopleData.map(p => p.group));
                    for (let k of state.ydnaSelectedGroups) {
                        if (k !== "" && !validYGroups.has(k)) state.ydnaSelectedGroups.delete(k);
                    }
                }
            }
            if (state.mtdnaAllSelected) {
                if (state.showAllMajorGroups) {
                    Object.keys(mtdnaGroupRoots).forEach(k => state.mtdnaSelectedGroups.add(k));
                } else {
                    const validMtGroups = new Set(mtdnaPeopleData.map(p => p.group));
                    for (let k of state.mtdnaSelectedGroups) {
                        if (k !== "" && !validMtGroups.has(k)) state.mtdnaSelectedGroups.delete(k);
                    }
                }
            }

            initFilters();
            const view = (window.location.hash || "#map").substring(1);
            if (view === "ydna") ydna.refresh();
            else if (view === "mtdna") mtdna.refresh();
        });
    }

    const chkShowOnlyLineages = document.getElementById("chk-show-only-lineages");
    if (chkShowOnlyLineages) {
        chkShowOnlyLineages.checked = state.showOnlyLineages;
        chkShowOnlyLineages.addEventListener("change", (e) => {
            state.showOnlyLineages = e.target.checked;
            updateURLState();
            const view = (window.location.hash || "#map").substring(1);
            if (view === "ydna") ydna.refresh();
            else if (view === "mtdna") mtdna.refresh();
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
                if (view === "ydna") ydna.refresh();
                else if (view === "mtdna") mtdna.refresh();
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