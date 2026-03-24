import { state, ydnaPeopleData, mtdnaPeopleData, getPersonTooltip, getHaploColor } from "./shared.js";

export class MapVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
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
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

    resetZoom() {
        if (!this.map || !this.markers) return;
        const bounds = this.markers.getBounds();
        if (bounds && bounds.isValid()) {
            this.map.fitBounds(bounds, { maxZoom: 14, padding: [40, 40] });
        } else {
            this.map.fitBounds([[45.421, 13.375], [46.876, 16.606]]);
        }
    }

    refreshMap() {
        const view = (window.location.hash || "#map").substring(1);
        if (view !== "map") return;

        if (!this.markers || !ydnaPeopleData || !mtdnaPeopleData) return;
        this.markers.clearLayers();

        let bounds = L.latLngBounds();
        let hasResults = false;

        const addPersonToMap = (p, isMtDna) => {
            const selectedGroups = isMtDna ? state.mtdnaSelectedGroups : state.ydnaSelectedGroups;
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
            let marker;
            if (isMtDna) {
                marker = L.circleMarker([lat, lon], {
                    radius: 6, fillColor: color, color: "#ffffff",
                    weight: 1.5, opacity: 1, fillOpacity: 0.9
                });
            } else {
                const size = 12;
                const html = `<div style="background-color: ${color}; border: 1.5px solid #ffffff; width: ${size}px; height: ${size}px; opacity: 0.9; box-sizing: border-box; box-shadow: 0 0 1px rgba(0,0,0,0.5);"></div>`;
                const icon = L.divIcon({
                    html: html,
                    className: 'ydna-square-marker',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                    popupAnchor: [0, -size / 2]
                });
                marker = L.marker([lat, lon], { icon: icon });
            }

            const popupContent = `<div style="font-size: 13px; line-height: 1.5;">${getPersonTooltip(p)}</div>`;
            marker.bindPopup(popupContent);
            this.markers.addLayer(marker);
            bounds.extend([lat, lon]);
            hasResults = true;
        };

        ydnaPeopleData.forEach(p => addPersonToMap(p, false));
        mtdnaPeopleData.forEach(p => addPersonToMap(p, true));

        const searchChanged = this.lastSearchQuery !== state.searchQuery;
        this.lastSearchQuery = state.searchQuery;

        if (searchChanged || this.firstLoad) {
            this.firstLoad = false;

            if (state.searchQuery && hasResults) {
                this.map.fitBounds(bounds, { maxZoom: 14, padding: [40, 40] });
            } else if (!state.searchQuery) {
                this.map.fitBounds([[45.421, 13.375], [46.876, 16.606]]);
            }
        }
    }
}

export const mapVis = new MapVisualizer("map-container");

window.addEventListener("filterChanged", () => {
    if (mapVis.mapInitialized) mapVis.refreshMap();
});

window.addEventListener("searchChanged", () => {
    if (mapVis.mapInitialized) mapVis.refreshMap();
});