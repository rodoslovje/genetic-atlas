/* Changelog — English, the source of record.
 *
 * New features and functionality only: bug fixes, refactors, data updates and
 * tooling never get an entry. Newest first, grouped by the date the change
 * shipped — the footer's "Version" is that same build date, so a reader can
 * tell what their build already has.
 *
 * The page draws only the last three months, counted back from the newest entry
 * (see WINDOW_MONTHS in ../../pages/page.js). Entries that fall out of that
 * window stay here as the record of what shipped when; they just stop being
 * shown, and a translation need only keep up with the ones still inside it.
 *
 * One file per language in this directory, lazy-loaded by ../../pages/page.js.
 * English is the fallback: a language with no file falls back whole, and a date
 * this file has but a translation lacks falls back entry by entry, so a new
 * release always shows even before it has been translated.
 *
 * `title` is the headline, `text` the one to three sentence explanation; both
 * may carry simple inline HTML (<em>, <strong>, <a>), written by us and
 * inserted as written.
 */

export default {
    title: "Changelog",

    intro: `What has been added to the Slovenian Genetic Atlas over the last three months, newest
        first. Only new features and changes to how the Atlas works are listed here; corrections and
        regular data updates are not. Everything before that is in the project's <a
        href="https://github.com/rodoslovje/genetic-atlas/commits/main" target="_blank"
        rel="noopener noreferrer">history on GitHub</a>.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "The block tree, a second way to read a lineage",
                    text: `Both lineage views now have <em>Tree</em> and <em>Block tree</em> tabs. The block
                        tree puts time on the vertical axis: each branch is drawn over the period it
                        existed as a single line, with the age of its common ancestor and the 68 % range
                        of that estimate, its equivalent SNPs, and every project member as a card under
                        the branch they were tested to. Click a block to follow that line down, and
                        export the result as SVG like any other view.`,
                },
                {
                    title: "A User Guide and this Changelog",
                    text: `The bar at the bottom of the Atlas now leads to a <a href="/guide/">User
                        Guide</a>, which walks through every view and every option, and to this
                        changelog. Both open in their own tab, in the language you are reading the
                        Atlas in, and the dates of the build and of the data have moved down into that
                        same bar.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "French",
                    text: `The Atlas is now offered in French as well, alongside Slovenian, English,
                        Croatian, German, Italian and Hungarian.`,
                },
                {
                    title: "A sharper map",
                    text: `The map is drawn from vector tiles, so place names stay crisp at every zoom
                        level and the markers sit on a quieter background.`,
                },
            ],
        },
        {
            date: "2026-05-24",
            items: [
                {
                    title: "A flag for every member",
                    text: `Members are shown with the flag of the country their earliest known ancestor
                        came from, in the lineage trees and in the exported charts alike.`,
                },
                {
                    title: "Exports that open correctly everywhere",
                    text: `The exported SVG now carries its own styling, fonts and flags, so a chart looks
                        the same in a word processor, a drawing program or a print shop as it does in the
                        browser.`,
                },
            ],
        },
        {
            date: "2026-05-21",
            items: [
                {
                    title: "A new look, and a new name",
                    text: `The Atlas has been redrawn in the shared design of the Slovenian Genealogical
                        Society's sites, and now carries the name <em>Slovenian Genetic Atlas</em>.`,
                },
            ],
        },
        {
            date: "2026-05-19",
            items: [
                {
                    title: "Members sharing a birthplace are all visible on the map",
                    text: `Markers at the same address used to disappear into a numbered bubble. They are
                        now spread in a small ring around the place instead, so the colours of the
                        lineages present there can be seen at a glance.`,
                },
            ],
        },
        {
            date: "2026-05-17",
            items: [
                {
                    title: "The tree without the people",
                    text: `<em>Show only lineages</em> leaves the individual members out and draws the
                        branches alone — the easiest way to take in the shape of a large tree.`,
                },
            ],
        },
        {
            date: "2026-05-16",
            items: [
                {
                    title: "Historical names for the branches",
                    text: `Well-known haplogroups now carry a descriptive name — a person, a region and a
                        time — so a lineage reads as a story instead of a list of SNP codes. Both the
                        paternal and the maternal tree have them.`,
                },
                {
                    title: "Every major lineage in its place",
                    text: `<em>Show all major genetic groups</em> draws the major branches of the human
                        tree even where the project has no member on them, which shows where the
                        Slovenian lineages sit among the rest.`,
                },
                {
                    title: "An overview beside the tree",
                    text: `A strip on the right shows the whole tree with your current window marked on
                        it; click or drag in it to jump anywhere without zooming out first.`,
                },
            ],
        },
        {
            date: "2026-05-14",
            items: [
                {
                    title: "German, Croatian and Hungarian",
                    text: `Three more languages for the neighbours and for the descendants of emigrants
                        who no longer read Slovenian.`,
                },
            ],
        },
        {
            date: "2026-04-21",
            items: [
                {
                    title: "Names on the map",
                    text: `<em>Show labels</em> writes the ancestor's name beside each marker, in bold for
                        members who took the most informative test for their lineage.`,
                },
                {
                    title: "Italian, and member counts per lineage",
                    text: `The Atlas is also offered in Italian, and the lineage list in the panel now
                        shows how many members each group holds and how many are currently shown.`,
                },
            ],
        },
        {
            date: "2026-03-27",
            items: [
                {
                    title: "Slovenian and English throughout",
                    text: `Every label, tooltip and message in the Atlas is translated, and the language
                        you pick is remembered on your device.`,
                },
            ],
        },
        {
            date: "2026-03-25",
            items: [
                {
                    title: "Finding your way around",
                    text: `The search box counts its matches as you type, the lineage filters follow the
                        shape of the tree, and a reset button returns any view to its starting position.`,
                },
            ],
        },
        {
            date: "2026-03-24",
            items: [
                {
                    title: "The Slovenian Genetic Atlas opens",
                    text: `The first release: the map of the earliest known ancestors of the members of the
                        <a href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
                        rel="noopener noreferrer">Slovenian Origin</a> project, the paternal (Y-DNA) and
                        maternal (mtDNA) lineage trees, a search across surnames, ancestors, kits and
                        haplogroups, and export of any view as an image.`,
                },
            ],
        },
    ],
};
