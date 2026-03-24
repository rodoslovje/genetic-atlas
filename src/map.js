import { state, getActiveData, getSelectedGroups, getPersonTooltip, getHaploColor } from "./shared.js";

export let mapInitialized = false;
let map;
let markers;
let lastSearchQuery = null;
let firstLoad = true;

export function initMap() {
    if (mapInitialized) return;
    mapInitialized = true;

    map = L.map("map-container");
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
        crossOrigin: true
    }).addTo(map);

    markers = L.markerClusterGroup({
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 40,
        spiderfyDistanceMultiplier: 1.5
    }).addTo(map);

    refreshMap();
}

export function refreshMap() {
    const { people } = getActiveData();
    const selectedGroups = getSelectedGroups();
    if (!markers || !people) return;
    markers.clearLayers();

    let bounds = L.latLngBounds();
    let hasResults = false;

    people.forEach((p) => {
        if (!selectedGroups.has(p.group)) return;

        if (state.searchQuery) {
            const q = state.searchQuery.toLowerCase();
            if (!(
                (p.surname && p.surname.toLowerCase().includes(q)) ||
                (p.ancestor && p.ancestor.toLowerCase().includes(q)) ||
                (p.kit && p.kit.toLowerCase().includes(q)) ||
                (p.haplogroup && p.haplogroup.toLowerCase().includes(q))
            )) return;
        }

        const lat = Number(p.latitude);
        const lon = Number(p.longitude);

        if (!lat || !lon || (lat === 0 && lon === 0)) return;

        const color = getHaploColor(p.group);
        const marker = L.circleMarker([lat, lon], {
            radius: 6, fillColor: color, color: "#ffffff",
            weight: 1.5, opacity: 1, fillOpacity: 0.9
        });

        const popupContent = `<div style="font-size: 13px; line-height: 1.5;">${getPersonTooltip(p)}</div>`;
        marker.bindPopup(popupContent);
        markers.addLayer(marker);
        bounds.extend([lat, lon]);
        hasResults = true;
    });

    const searchChanged = lastSearchQuery !== state.searchQuery;
    lastSearchQuery = state.searchQuery;

    if (searchChanged || firstLoad) {
        const maxZoom = firstLoad ? 12 : map.getZoom();
        firstLoad = false;

        if (state.searchQuery && hasResults) {
            map.fitBounds(bounds, { maxZoom: maxZoom, padding: [40, 40] });
        } else if (!state.searchQuery) {
            map.fitBounds([[45.421, 13.375], [46.876, 16.606]]); // Default bounding box for Slovenia
        }
    }
}

window.addEventListener("filterChanged", () => {
    if (mapInitialized) refreshMap();
});

window.addEventListener("searchChanged", () => {
    if (mapInitialized) refreshMap();
});