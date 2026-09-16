/* Neuerungen — Deutsch.
 * Übersetzung von ./en.js, dem Original. Übersetzt sind nur die Einträge
 * innerhalb des Drei-Monats-Fensters, das die Seite zeigt; ältere bleiben im
 * englischen Original, wo sie auch entstehen. Ein fehlender Eintrag fällt von
 * selbst auf Englisch zurück.
 */

export default {
    title: "Neuerungen",

    intro: `Was in den letzten drei Monaten zum Slowenischen Genetischen Atlas hinzugekommen ist,
        Neuestes zuerst. Aufgeführt sind nur neue Funktionen und Änderungen an der Arbeitsweise des
        Atlas; Korrekturen und regelmäßige Datenaktualisierungen nicht. Alles Ältere steht in der <a
        href="https://github.com/rodoslovje/genetic-atlas/commits/main" target="_blank"
        rel="noopener noreferrer">Projektgeschichte auf GitHub</a>.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "Der Blockbaum, eine zweite Lesart einer Linie",
                    text: `Beide Linienansichten haben nun die Reiter <em>Baum</em> und
                        <em>Blockbaum</em>. Der Blockbaum legt die Zeit auf die senkrechte Achse: Jeder
                        Zweig wird über jenen Zeitraum gezeichnet, in dem er als eine einzige Linie
                        bestand — mit dem Alter seines gemeinsamen Vorfahren und dem 68-%-Bereich dieser
                        Schätzung, seinen äquivalenten SNPs und jedem Projektmitglied als Karte unter dem
                        Zweig, bis zu dem es getestet wurde. Ein Klick auf einen Block folgt dieser Linie
                        weiter hinab, und das Ergebnis lässt sich wie jede andere Ansicht als SVG
                        exportieren.`,
                },
                {
                    title: "Ein Benutzerhandbuch und diese Neuerungen",
                    text: `Die Leiste am unteren Rand des Atlas führt nun zu einem <a
                        href="/guide/">Benutzerhandbuch</a>, das jede Ansicht und jede Option der Reihe
                        nach beschreibt, und zu diesen Neuerungen. Beide öffnen sich in einem eigenen
                        Tab, in der Sprache, in der Sie den Atlas lesen; das Datum des Builds und das
                        der Daten sind in dieselbe Leiste gewandert.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "Französisch",
                    text: `Der Atlas wird nun auch auf Französisch angeboten, neben Slowenisch, Englisch,
                        Kroatisch, Deutsch, Italienisch und Ungarisch.`,
                },
                {
                    title: "Eine schärfere Karte",
                    text: `Die Karte wird aus Vektorkacheln gezeichnet, sodass Ortsnamen in jeder
                        Zoomstufe scharf bleiben und die Markierungen auf einem ruhigeren Untergrund
                        stehen.`,
                },
            ],
        },
    ],
};
