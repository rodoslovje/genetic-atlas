import { state, getActiveData, getSelectedGroups, getPersonTooltip, getHaploColor } from "./shared.js";

export class MapVisualizer {
    constructor(containerId, isMtDna) {
        this.containerId = containerId;
        this.isMtDna = isMtDna;
        this.mapInitialized = false;
        this.map = null;
        this.markers = null;
        this.lastSearchQuery = null;
        this.firstLoad = true;
    }

    initMap() {
        if (this.mapInitialized) return;
        this.mapInitialized = true;

        this.map = L.map(this.containerId);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap contributors",
            crossOrigin: true
        }).addTo(this.map);

        this.markers = L.markerClusterGroup({
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 40,
            spiderfyDistanceMultiplier: 1.5
        }).addTo(this.map);

        this.refreshMap();
    }

    refreshMap() {
        const view = (window.location.hash || "#ymap").substring(1);
        if (this.isMtDna && view !== "mmap") return;
        if (!this.isMtDna && view !== "ymap") return;

        const { people } = getActiveData();
        const selectedGroups = getSelectedGroups();
        if (!this.markers || !people) return;
        this.markers.clearLayers();

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
            this.markers.addLayer(marker);
            bounds.extend([lat, lon]);
            hasResults = true;
        });

        const searchChanged = this.lastSearchQuery !== state.searchQuery;
        this.lastSearchQuery = state.searchQuery;

        if (searchChanged || this.firstLoad) {
            const maxZoom = this.firstLoad ? 12 : this.map.getZoom();
            this.firstLoad = false;

            if (state.searchQuery && hasResults) {
                this.map.fitBounds(bounds, { maxZoom: maxZoom, padding: [40, 40] });
            } else if (!state.searchQuery) {
                this.map.fitBounds([[45.421, 13.375], [46.876, 16.606]]);
            }
        }
    }
}

export const ymapVis = new MapVisualizer("ymap-container", false);
export const mmapVis = new MapVisualizer("mmap-container", true);

window.addEventListener("filterChanged", () => {
    if (ymapVis.mapInitialized) ymapVis.refreshMap();
    if (mmapVis.mapInitialized) mmapVis.refreshMap();
});

window.addEventListener("searchChanged", () => {
    if (ymapVis.mapInitialized) ymapVis.refreshMap();
    if (mmapVis.mapInitialized) mmapVis.refreshMap();
});