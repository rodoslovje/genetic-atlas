import { state, translations, loadData, initFilters, updateURLState, rawPeopleData, groupRoots } from "./shared.js";
import { initYDNA, refreshYDNADisplay, ydnaInitialized } from "./ydna.js";
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

    const toggleAllBtn = document.getElementById("toggle-all");
    if (toggleAllBtn) {
        toggleAllBtn.innerText = translations[state.currentLang][state.allSelected ? "deselectAll" : "selectAll"];
    }

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

function validateSearch() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput || !rawPeopleData) return;

    let hasResults = true;
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const currentView = (window.location.hash || "#map").substring(1);

        hasResults = rawPeopleData.some(p => {
            const matchesText = (p.surname && p.surname.toLowerCase().includes(query)) ||
                (p.ancestor && p.ancestor.toLowerCase().includes(query)) ||
                (p.kit && p.kit.toLowerCase().includes(query)) ||
                (p.haplogroup && p.haplogroup.toLowerCase().includes(query));

            const matchesGroup = state.selectedGroups.has(p.group);
            const missingPath = (currentView === "ydna" && p.haplogroup === "-" && !groupRoots[p.group]);

            return matchesText && matchesGroup && !missingPath;
        });
    }
    searchInput.style.color = hasResults ? "" : "#e53e3e";
}

window.addEventListener("filterChanged", () => {
    validateSearch();
    refreshYDNADisplay();
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

    if (view === "ydna" || view === "map") {
        if (lineageControls) lineageControls.style.display = "block";

        if (view === "ydna" && ydnaEras) ydnaEras.style.display = "block";
        else if (ydnaEras) ydnaEras.style.display = "none";

        if (passthroughContainer) {
            passthroughContainer.style.display = view === "ydna" ? "flex" : "none";
        }

        if (window.innerWidth > 768 && sidebar) {
            sidebar.classList.add("open");
        }

        loadData().then(() => {
            initFilters();
            if (view === "ydna" && !ydnaInitialized) {
                initYDNA();
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
            refreshYDNADisplay();
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
                refreshYDNADisplay();
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