// Lazy loader for inline SVG flag data, sourced from the `flag-icons` package.
// Each flag is fetched once (Vite emits a chunk per ?raw import), cached as a
// string, and consumed as a data URI so tree nodes can render vector flags via
// the existing <image> element without any external network request.

const flagLoaders = import.meta.glob(
    "../node_modules/flag-icons/flags/4x3/*.svg",
    { query: "?raw", import: "default" }
);

const flagCache = new Map();
const inflight = new Map();
const dataUriCache = new Map();

const FALLBACK = "un";

function svgToDataUri(svg) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function loaderFor(code) {
    return flagLoaders[`../node_modules/flag-icons/flags/4x3/${code}.svg`];
}

function loadFlag(code) {
    if (flagCache.has(code)) return Promise.resolve(flagCache.get(code));
    if (inflight.has(code)) return inflight.get(code);
    const loader = loaderFor(code);
    if (!loader) {
        flagCache.set(code, null);
        return Promise.resolve(null);
    }
    const p = loader()
        .then(svg => { flagCache.set(code, svg); return svg; })
        .catch(() => { flagCache.set(code, null); return null; })
        .finally(() => inflight.delete(code));
    inflight.set(code, p);
    return p;
}

export async function prefetchFlags(codes) {
    const unique = new Set();
    for (const c of codes) if (c) unique.add(c.toLowerCase());
    unique.add(FALLBACK);
    await Promise.all([...unique].map(loadFlag));
}

// Synchronous lookup after prefetch — returns a data: URI ready for use as an
// <image href>, or null if the flag wasn't prefetched (caller can fall back).
export function getFlagDataUri(code) {
    const key = (code || FALLBACK).toLowerCase();
    if (dataUriCache.has(key)) return dataUriCache.get(key);
    const svg = flagCache.get(key) ?? flagCache.get(FALLBACK);
    if (!svg) return null;
    const uri = svgToDataUri(svg);
    dataUriCache.set(key, uri);
    return uri;
}
