import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { state, ydnaPeopleData, mtdnaPeopleData, getPersonTooltip, getHaploColor, isProminentPerson, matchesSearchQuery, matchesAncientQuery, searchFilters, getAncientSamples, getAncientTooltip, eraColorFor } from "./shared.js";

function bindNameLabel(marker, dir) {
    const offset = { right: [6, 0], left: [-6, 0], top: [0, -6], bottom: [0, 6] }[dir] ?? [6, 0];
    const className = "marker-name-label" + (marker._labelProminent ? " prominent" : "") + (marker._dimmed ? " dimmed" : "");
    marker.bindTooltip(marker._labelName, {
        permanent: true, direction: dir, offset,
        className, interactive: false,
    });
}

// Base spread radius in degrees latitude (~270 m near Slovenia). Markers sharing a
// coordinate are placed on a circle whose radius scales with sqrt(group size).
const JITTER_BASE_DEG = 0.0024;

// Opacity of a marker the search doesn't match, while it highlights.
const DIMMED_OPACITY = 0.25;

// Step between ancient burials sharing an excavation site (~130 m near Slovenia).
const ANCIENT_NUDGE_DEG = 0.0012;

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
        // Markers a search doesn't match sit in their own pane below every
        // other marker, so a dimmed square never covers a highlighted circle.
        this.map.createPane("dimmed").style.zIndex = 390;
        this.markers = L.featureGroup().addTo(this.map);
        // Ancient burials live in their own group: they sit at excavation sites
        // all over Europe, so they must stay out of the project members' bounds
        // (and out of the jitter rings, which only spread shared addresses).
        this.ancientMarkers = L.featureGroup().addTo(this.map);

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
        this.ancientMarkers.clearLayers();

        let bounds = L.latLngBounds();
        let hasResults = false;
        let ancientBounds = L.latLngBounds();
        let hasAncientResults = false;
        // A burial whose paternal and maternal lines both reach the project is in
        // both lists at the very same coordinate. Count what has already been
        // placed on each spot so the second mark can be nudged off the first
        // instead of hiding under it — the ancient equivalent of the jitter rings.
        const ancientSeenAt = new Map();

        const addPersonToMap = (p, isMtDna) => {
            const selectedGroups = isMtDna ? state.mtdnaSelectedGroups : state.ydnaSelectedGroups;
            if (!selectedGroups.has(p.group)) return;

            // A search highlights its matches and dims everyone else; with
            // "Show only matches" the rest are left off the map.
            const isMatch = matchesSearchQuery(p, state.searchQuery);
            if (!isMatch && searchFilters()) return;
            const dimmed = !isMatch;

            const coords = this.jitteredCoords.get(p);
            if (!coords) return;
            const { lat, lon } = coords;

            const color = getHaploColor(p.group);
            const pane = dimmed ? { pane: "dimmed" } : {};
            let marker;
            if (isMtDna) {
                marker = L.circleMarker([lat, lon], {
                    radius: 6, fillColor: color, color: "#ffffff", weight: 1.5,
                    opacity: dimmed ? DIMMED_OPACITY : 1,
                    fillOpacity: dimmed ? DIMMED_OPACITY : 0.9,
                    ...pane
                });
            } else {
                const size = 12;
                const html = `<div style="background-color: ${color}; border: 1.5px solid #ffffff; width: ${size}px; height: ${size}px; opacity: ${dimmed ? DIMMED_OPACITY : 0.9}; box-sizing: border-box; box-shadow: 0 0 1px rgba(0,0,0,0.5);"></div>`;
                const icon = L.divIcon({
                    html: html,
                    className: 'ydna-square-marker',
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                    popupAnchor: [0, -size / 2]
                });
                marker = L.marker([lat, lon], { icon: icon, ...pane });
            }
            marker._dimmed = dimmed;

            const popupContent = `<div style="font-size: 13px; line-height: 1.5;">${getPersonTooltip(p, "", isMtDna ? "mt" : "y", "map")}</div>`;
            marker.bindPopup(popupContent);

            const name = p.ancestor || p.surname;
            if (name) {
                marker._labelName = name;
                marker._labelProminent = isProminentPerson(p);
                if (state.showLabels) bindNameLabel(marker, "right");
            }

            this.markers.addLayer(marker);
            if (isMatch) {
                bounds.extend([lat, lon]);
                hasResults = true;
            }
        };

        // An ancient burial is drawn as a diamond (Y-DNA) or a ring (mtDNA) in the
        // colour of its era, at the excavation site — never a flag-shaped marker
        // in a lineage colour, so it can't be mistaken for a project member.
        const addAncientToMap = (s, isMtDna) => {
            const key = `${s.latitude.toFixed(5)},${s.longitude.toFixed(5)}`;
            const placed = ancientSeenAt.get(key) || 0;
            ancientSeenAt.set(key, placed + 1);
            // First mark stays on the site; each further one steps down-right by
            // a marker's width, which at any zoom keeps both clickable.
            const step = placed * ANCIENT_NUDGE_DEG;
            const lat = s.latitude - step;
            const lon = s.longitude + step / Math.cos(s.latitude * Math.PI / 180);

            // With "Show only matches", getAncientSamples has already kept just
            // the burials the search found or reached through a matching member,
            // so all are drawn in full; otherwise those the text misses are dimmed.
            const dimmed = !!state.searchQuery && !searchFilters() && !matchesAncientQuery(s, state.searchQuery);
            const color = eraColorFor(s.year);
            const size = 13;
            const shape = isMtDna ? "border-radius: 50%;" : "transform: rotate(45deg);";
            const html = `<div style="background-color: ${color}; border: 2px solid #ffffff; width: ${size}px; height: ${size}px; ${shape} box-sizing: border-box; box-shadow: 0 0 0 1px rgba(26,32,44,0.75);${dimmed ? ` opacity: ${DIMMED_OPACITY};` : ""}"></div>`;
            const marker = L.marker([lat, lon], {
                icon: L.divIcon({
                    html: html,
                    className: "ancient-marker",
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size / 2],
                    popupAnchor: [0, -size / 2]
                }),
                ...(dimmed ? { pane: "dimmed" } : {})
            });
            marker._dimmed = dimmed;
            marker.bindPopup(`<div style="font-size: 13px; line-height: 1.5;">${getAncientTooltip(s, isMtDna ? "mt" : "y")}</div>`);
            marker._labelName = s.name;
            marker._labelProminent = false;
            if (state.showLabels) bindNameLabel(marker, "right");
            this.ancientMarkers.addLayer(marker);
            if (dimmed) return;
            ancientBounds.extend([lat, lon]);
            hasAncientResults = true;
        };

        ydnaPeopleData.forEach(p => addPersonToMap(p, false));
        mtdnaPeopleData.forEach(p => addPersonToMap(p, true));
        getAncientSamples("y").forEach(s => addAncientToMap(s, false));
        getAncientSamples("mt").forEach(s => addAncientToMap(s, true));

        const searchChanged = this.lastSearchQuery !== state.searchQuery;
        this.lastSearchQuery = state.searchQuery;

        if (searchChanged || this.firstLoad) {
            this.firstLoad = false;

            if (state.searchQuery && hasResults) {
                this.map.fitBounds(bounds, { maxZoom: 14, padding: [40, 40] });
            } else if (state.searchQuery && hasAncientResults) {
                // A search that only matches ancient burials ("Avar", "Corded
                // Ware") would otherwise leave the reader looking at Slovenia
                // while every match sits off-screen.
                this.map.fitBounds(ancientBounds, { maxZoom: 9, padding: [40, 40] });
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
