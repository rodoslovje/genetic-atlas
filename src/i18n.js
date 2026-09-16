/* =============================================================
 * Translation loading and string formatting.
 *
 * Kept apart from shared.js so the standalone pages (the User Guide and
 * the Changelog) can translate their chrome without importing the
 * app — shared.js pulls in d3 and the data loaders, which those
 * pages have no use for.
 *
 * shared.js re-exports `translations` / `loadTranslation`, so app
 * modules keep importing their i18n from there.
 * ============================================================= */

// English bundled as fallback; all other languages lazy-loaded on first use.
import enTranslations from "./i18n/en.json";

// Explicit loader map (avoids Vite warning about static + dynamic import of en.json).
// Adding a new language: drop the JSON in i18n/ and add an entry here + in languageConfig in main.js.
const langLoaders = {
    sl: () => import("./i18n/sl.json"),
    de: () => import("./i18n/de.json"),
    fr: () => import("./i18n/fr.json"),
    hr: () => import("./i18n/hr.json"),
    hu: () => import("./i18n/hu.json"),
    it: () => import("./i18n/it.json"),
};

export const translations = { en: enTranslations };

/** Every language the app offers, English first. */
export const availableLangs = ["en", ...Object.keys(langLoaders)];

export async function loadTranslation(lang) {
    if (translations[lang]) return translations[lang];
    if (!langLoaders[lang]) return null;
    const mod = await langLoaders[lang]();
    translations[lang] = mod.default;
    return translations[lang];
}

/** The language to start in: a stored preference, else Slovenian for a
 *  Slovenian browser, else English. Shared by the app and the static pages so
 *  a reader who has picked a language keeps it wherever they land. */
export function preferredLang() {
    let saved = null;
    try {
        saved = localStorage.getItem("preferredLang");
    } catch {
        // Private mode / blocked storage: fall through to the browser's language.
    }
    if (saved) return saved;
    return navigator.language && navigator.language.toLowerCase().startsWith("sl") ? "sl" : "en";
}

/** Formats one key out of an already-loaded dictionary: `{0}`, `{1}`, … are
 *  replaced by the positional arguments and `{someKey}` by another string from
 *  the same dictionary. Unknown keys render as themselves. */
export function translate(dict, key, ...args) {
    let str = dict[key] ?? key;
    args.forEach((val, i) => { str = str.replace(`{${i}}`, val); });
    str = str.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (m, name) => {
        if (name === key) return m;
        const v = dict[name];
        return typeof v === "string" ? v : m;
    });
    return str;
}
