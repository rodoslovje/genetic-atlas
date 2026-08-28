import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { state, ydnaPeopleData, mtdnaPeopleData, getPersonTooltip, getHaploColor, isProminentPerson, matchesSearchQuery } from "./shared.js";

function bindNameLabel(marker, dir) {
    const offset = { right: [6, 0], left: [-6, 0], top: [0, -6], bottom: [0, 6] }[dir] ?? [6, 0];
    const className = marker._labelProminent ? "marker-name-label prominent" : "marker-name-label";
    marker.bindTooltip(marker._labelName, {
        permanent: true, direction: dir, offset,
        className, interactive: false,
    });
}

// Base spread radius in degrees latitude (~270 m near Slovenia). Markers sharing a
// coordinate are placed on a circle whose radius scales with sqrt(group size).
const JITTER_BASE_DEG = 0.0024;

export class MapVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.mapInitialized = false;
        this.map = null;
        this.markers = null;
        this.lastSearchQuery = null;
        this.firstLoad = true;
        this.jitteredCoords = null;
    }

    initMap() {
        if (this.mapInitialized) return;
        this.mapInitialized = true;

        this.map = L.map(this.containerId, { maxZoom: 19 });
        this.markers = L.featureGroup().addTo(this.map);

        this.addBaseLayer();
        this.refreshMap();
    }

    // CARTO Voyager as vector tiles (MapLibre GL) instead of raster PNGs: sharper
    // labels at any zoom and crisp rendering on HiDPI screens. MapLibre is a heavy
    // dependency, so it is only pulled in once the map view is actually opened.
    async addBaseLayer() {
        const [{ setWorkerUrl }, { default: maplibreGL }, { default: workerUrl }] = await Promise.all([
            import("maplibre-gl"),
            import("@maplibre/maplibre-gl-leaflet"),
            // MapLibre resolves its tile-parsing worker relative to its own module
            // URL, which the bundler never emits; point it at the bundled worker
            // instead, or tiles are fetched but never decoded (blank basemap).
            import("maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url"),
            import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (!this.map) return;
        setWorkerUrl(workerUrl);
        maplibreGL({
            style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            // Keeps the WebGL frame readable so html2canvas can export the map;
            // without it the buffer is cleared after compositing and the basemap
            // comes out blank.
            canvasContextAttributes: { preserveDrawingBuffer: true },
            attributionControl: {
                customAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }
        }).addTo(this.map);
    }

    // Stable spread for markers that share a (rounded) coordinate: deterministic
    // ring layout keyed by person identity so positions don't reshuffle when
    // filters or searches change.
    precomputeJitter() {
        if (this.jitteredCoords) return;
        if (!ydnaPeopleData || !mtdnaPeopleData) return;

        const groups = new Map();
        const consider = (p, isMt) => {
            const lat = Number(p.latitude);
            const lon = Number(p.longitude);
            if (!lat || !lon || (lat === 0 && lon === 0)) return;
            const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
            if (!groups.has(key)) groups.set(key, { lat, lon, items: [] });
            groups.get(key).items.push({ person: p, isMt });
        };

        ydnaPeopleData.forEach(p => consider(p, false));
        mtdnaPeopleData.forEach(p => consider(p, true));

        // Sort key: haplogroup, then ancestor, then surname. Ungrouped items have
        // an empty group so they fall back to ancestor/surname order.
        const sortItems = (items) => items.slice().sort((a, b) => {
            const ag = String(a.person.group ?? ""), bg = String(b.person.group ?? "");
            if (ag !== bg) return ag.localeCompare(bg);
            const aa = String(a.person.ancestor ?? ""), ba = String(b.person.ancestor ?? "");
            if (aa !== ba) return aa.localeCompare(ba);
            return String(a.person.surname ?? "").localeCompare(String(b.person.surname ?? ""));
        });

        const result = new Map();
        for (const [key, group] of groups) {
            if (group.items.length === 1) {
                result.set(group.items[0].person, { lat: group.lat, lon: group.lon });
                continue;
            }
            // Two rings per cluster, both traversed CW from 12 o'clock:
            //   Grouped ring   = Y grouped  → mt grouped       (with haplogroup)
            //   Ungrouped ring = mt no-grp  → Y no-grp         (without haplogroup)
            const grouped = [
                ...sortItems(group.items.filter(it => !it.isMt && it.person.group)),
                ...sortItems(group.items.filter(it =>  it.isMt && it.person.group)),
            ];
            const ungrouped = [
                ...sortItems(group.items.filter(it =>  it.isMt && !it.person.group)),
                ...sortItems(group.items.filter(it => !it.isMt && !it.person.group)),
            ];

            const lngScale = 1 / Math.cos(group.lat * Math.PI / 180);
            const placeRing = (items, radius) => {
                const n = items.length;
                if (n === 0) return;
                const step = (2 * Math.PI) / n;
                items.forEach((it, i) => {
                    const angle = Math.PI / 2 - i * step;
                    result.set(it.person, {
                        lat: group.lat + radius * Math.sin(angle),
                        lon: group.lon + radius * lngScale * Math.cos(angle)
                    });
                });
            };

            // Larger bucket gets the outer ring; inner ring is exactly half its
            // radius (the "at least 2× larger" constraint). On a tie, grouped wins.
            let rGrouped, rUngrouped;
            if (grouped.length === 0) {
                rUngrouped = JITTER_BASE_DEG * Math.sqrt(ungrouped.length);
            } else if (ungrouped.length === 0) {
                rGrouped = JITTER_BASE_DEG * Math.sqrt(grouped.length);
            } else {
                const groupedIsOuter = grouped.length >= ungrouped.length;
                const rBig = JITTER_BASE_DEG * Math.sqrt(groupedIsOuter ? grouped.length : ungrouped.length);
                const rSmall = rBig / 2;
                rGrouped = groupedIsOuter ? rBig : rSmall;
                rUngrouped = groupedIsOuter ? rSmall : rBig;
            }

            placeRing(grouped, rGrouped);
            placeRing(ungrouped, rUngrouped);
        }

        this.jitteredCoords = result;
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
        this.precomputeJitter();
        this.markers.clearLayers();

        let bounds = L.latLngBounds();
        let hasResults = false;

        const addPersonToMap = (p, isMtDna) => {
            const selectedGroups = isMtDna ? state.mtdnaSelectedGroups : state.ydnaSelectedGroups;
            if (!selectedGroups.has(p.group)) return;

            if (!matchesSearchQuery(p, state.searchQuery)) return;

            const coords = this.jitteredCoords.get(p);
            if (!coords) return;
            const { lat, lon } = coords;

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

            const popupContent = `<div style="font-size: 13px; line-height: 1.5;">${getPersonTooltip(p, "", isMtDna ? "mt" : "y", "map")}</div>`;
            marker.bindPopup(popupContent);

            const name = p.ancestor || p.surname;
            if (name) {
                marker._labelName = name;
                marker._labelProminent = isProminentPerson(p);
                if (state.showLabels) bindNameLabel(marker, "right");
            }

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
