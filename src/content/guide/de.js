/* Benutzerhandbuch — Deutsch.
 * Übersetzung von ./en.js, dem Original; ändert sich der englische Text, ist
 * auch dieser nachzuziehen. Die Abschnitts-ids bleiben wie im Original, damit
 * Anker in der Adresse in allen Sprachen funktionieren. Die Namen der Schalter
 * und Optionen müssen mit ../../i18n/de.json übereinstimmen.
 */

export default {
    title: "Benutzerhandbuch",

    intro: `Der Slowenische Genetische Atlas zeigt die Y-DNA-Ergebnisse (väterliche Linie) und
        mtDNA-Ergebnisse (mütterliche Linie) der Mitglieder des Projekts <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> bei FamilyTreeDNA — als Karte und als zwei
        Linienbäume. Dieses Handbuch beschreibt, was jede Ansicht zeigt und wie man damit arbeitet.`,

    sections: [
        {
            id: "views",
            heading: "Die drei Ansichten",
            body: `
        <p>Die Links am oberen Rand wechseln zwischen den drei Ansichten. Jede behält ihren eigenen
        Zustand, Sie können also zwischen ihnen wechseln, ohne Ihre Stelle zu verlieren.</p>
        <ul>
          <li><strong>Karte</strong> — wo die frühesten bekannten Vorfahren der getesteten Mitglieder
          lebten, beide Linien zugleich.</li>
          <li><strong>Väterliche Linien (Y-DNA)</strong> — der Baum des Y-Chromosoms, das vom Vater an
          den Sohn weitergegeben wird und in den meisten slowenischen Familien dem Nachnamen
          folgt.</li>
          <li><strong>Mütterliche Linien (mtDNA)</strong> — der Baum der mitochondrialen DNA, die eine
          Mutter an alle ihre Kinder weitergibt, die aber nur über ihre Töchter weitervererbt
          wird.</li>
        </ul>
        <p>Die Schaltfläche mit den drei Strichen oben rechts öffnet und schließt das
        <strong>Seitenfeld</strong> mit dem Suchfeld, den Linienfiltern und den Optionen der aktuellen
        Ansicht. Auf schmalen Bildschirmen wandern auch die Links zu den Ansichten dorthin.</p>
        <p>Drei runde Schaltflächen schweben über der Ansicht selbst: <strong>i</strong> zeigt
        Hintergrundinformationen zur Ansicht, der Pfeil exportiert, was Sie gerade sehen, und der Kreis
        mit dem Kreuz setzt die Ansicht auf ihre Ausgangslage zurück.</p>`,
        },
        {
            id: "map",
            heading: "Die Karte",
            body: `
        <p>Jede Markierung ist ein getestetes Mitglied, gesetzt auf den Geburtsort seines frühesten
        bekannten direkten Vorfahren. <strong>Quadrate</strong> sind väterliche Ergebnisse (Y-DNA),
        <strong>Kreise</strong> mütterliche (mtDNA); die Farbe steht für die genetische Hauptgruppe
        (Haplogruppe) des Mitglieds, sodass verwandte Linien auf der ganzen Karte dieselbe Farbe
        tragen.</p>
        <p>Mitglieder vom selben Ort lägen auf genau demselben Punkt; Markierungen mit gleicher
        Adresse werden deshalb in einem oder zwei kleinen Ringen darum verteilt. Beim Hineinzoomen
        trennen sie sich.</p>
        <p>Ein Klick auf eine Markierung öffnet ihre Angaben: Kit-Nummer, abgelegter Test, Linie,
        Haplogruppe, Nachname, frühester bekannter Vorfahr und Ort. Drei davon sind Links — die
        <strong>Kit-Nummer</strong> öffnet diese Person in ihrem Linienbaum, die
        <strong>Haplogruppe</strong> sucht diesen Zweig im Baum, und der <strong>Ort</strong> sucht auf
        der Karte alle, die von dort stammen.</p>
        <p><strong>Beschriftungen anzeigen</strong> im Seitenfeld schreibt den Namen des Vorfahren
        (oder den Nachnamen) neben jede Markierung. Fett gesetzte Namen gehören Mitgliedern, die den
        aussagekräftigsten Test ihrer Linie abgelegt haben — Big Y für Y-DNA, die vollständige
        mitochondriale Sequenz für mtDNA.</p>
        <p>Bei eingeschalteten <strong>antiken Verbindungen</strong> erscheinen Rauten und Ringe in
        Epochenfarben zwischen den Markern. Das sind ausgegrabene Bestattungen, keine Projektmitglieder
        – siehe <em>Antike Verbindungen</em> weiter unten.</p>`,
        },
        {
            id: "tree",
            heading: "Der Linienbaum",
            body: `
        <p>Der Baum wächst von links nach rechts: die ältesten gemeinsamen Vorfahren links, die heute
        getesteten Mitglieder als Blätter rechts. Jeder runde Knoten ist eine Haplogruppe — ein durch
        eine Mutation bestimmter Zweig der Menschheit — und bekanntere Zweige tragen zusätzlich einen
        beschreibenden Namen, sodass sich eine Linie wie eine Geschichte liest und nicht wie eine
        Liste von SNP-Codes.</p>
        <p>Ziehen verschiebt den Baum, Scrollen (oder Zusammenziehen) zoomt. Der schmale Streifen
        rechts ist eine Übersicht des ganzen Baums mit Ihrem aktuellen Ausschnitt darin; ein Klick oder
        Zug darin springt woandershin. Der Zeiger auf einem Knoten zeigt dessen Angaben, auf einem
        Mitglied dieselbe Karte wie auf der Karte.</p>
        <p>Ein Klick auf eine Haplogruppe klappt den Zweig darunter zu, ein weiterer öffnet ihn wieder.
        Ein hohl gezeichneter Knoten — in seiner Farbe umrandet, aber nicht gefüllt — hat noch etwas
        Zugeklapptes hinter sich; ein gefüllter zeigt alles, was er enthält. Die Zweiglinien sind nach
        dem Alter des Zweigs eingefärbt, entsprechend der Legende <strong>Epochen</strong> am unteren
        Ende des Seitenfelds.</p>
        <p>Drei Optionen im Seitenfeld bestimmen, wie viel vom Baum gezeichnet wird:</p>
        <ul>
          <li><strong>Alle genetischen Hauptgruppen anzeigen</strong> — zeichnet alle großen
          Haplogruppen, auch solche ohne Mitglied im Projekt, sodass die slowenischen Linien an ihrem
          Platz im menschlichen Stammbaum zu sehen sind.</li>
          <li><strong>Alle genetischen Varianten anzeigen</strong> — behält die Zwischenzweige, die kein
          eigenes Mitglied tragen. Ohne sie springt der Baum direkt von einer aussagekräftigen
          Verzweigung zur nächsten.</li>
          <li><strong>Nur Linien anzeigen</strong> — lässt die einzelnen Mitglieder weg und zeichnet nur
          die Zweige, was die Gestalt des Baums weit leichter erfassbar macht.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "Der Blockbaum",
            body: `
        <p>Die Reiter <strong>Baum</strong> und <strong>Blockbaum</strong> oben im Seitenfeld wechseln
        die Darstellung einer Linie. Geht es beim Baum um die Gestalt, geht es beim Blockbaum um die
        <strong>Zeit</strong>: die Jahre laufen an der senkrechten Achse hinab, vom ältesten Zweig oben
        bis zur Gegenwart unten, und jeder Zweig ist ein Block über jenen Zeitraum, in dem er als eine
        einzige Linie bestand, bevor er sich teilte.</p>
        <p>Jeder Block trägt seine Haplogruppe und ist nach Epoche eingefärbt. Der Zeiger darauf zeigt,
        wann der Zweig entstand, wann der gemeinsame Vorfahr seiner Mitglieder lebte, den 68-%- und
        99-%-Bereich dieser Schätzung, die äquivalenten SNPs des Zweigs (bei mtDNA seine Mutationen)
        und wie viele Personen FamilyTreeDNA auf ihm und unterhalb davon getestet hat.</p>
        <p>Unter den Blöcken erhält jedes Projektmitglied eine eigene Karte unter dem Zweig, bis zu dem
        es getestet wurde. Eine getönte Karte kennzeichnet ein Mitglied mit dem aussagekräftigsten Test
        seiner Linie, eine bernsteinfarbene ein Mitglied, das der aktuellen Suche entspricht.</p>
        <p>Ein Klick auf einen Block zeichnet die Ansicht mit diesem Zweig als neuem Ausgangspunkt neu
        — so folgen Sie einer Linie in ihre Einzelheiten. Die Schaltfläche <strong>↑</strong> und die
        Spur daneben am oberen Rand führen wieder zur Wurzel zurück.</p>`,
        },
        {
            id: "ancient",
            heading: "Antike Verbindungen",
            body: `
        <p><strong>Antike Verbindungen</strong> im Bedienfeld fügt eine Ebene ausgegrabener Bestattungen
        hinzu, deren DNA veröffentlicht ist und die FamilyTreeDNA einem der im Atlas gezeichneten Zweige
        zuordnet. Die Ebene ist ausgeschaltet, bis Sie sie einschalten; die Zeile darunter zählt die
        Bestattungen, die die aktuelle Ansicht zeigt.</p>
        <p>Es sind keine Projektmitglieder, und sie werden nie wie welche gezeichnet. Auf der Karte ist
        eine Bestattung eine <strong>Raute</strong> (väterlich) oder ein <strong>Ring</strong>
        (mütterlich) am Fundort, eingefärbt nach der Epoche, in der der Mensch lebte, nicht nach
        Haplogruppe. Im Baum hängt sie an dem Zweig, an dem ihre Linie auf unsere trifft, kursiv hinter
        einem ⚱ und mit der Jahreszahl. Im Blockbaum bekommt sie eine eigene Spalte wie ein Mitglied –
        eine, die im Todesjahr endet, statt bis in die Gegenwart zu laufen; dieses Jahr steht an ihrer
        Abschlusskante.</p>
        <p>Beim Überfahren erscheint, wer es war: die Datierung und ihre Spanne, der Fundort, die
        archäologische Kultur, die Haplogruppe der Überreste, der Zweig, an dem sich beide Linien
        treffen, wann dieser gemeinsame Vorfahre lebte, und die Studie, die die DNA veröffentlicht hat.
        Eine gestrichelte Kontur bedeutet, dass FamilyTreeDNA die Zuordnung als unsicher kennzeichnet –
        die Überreste tragen die Mutationen dieses Zweigs, aber keine darunter, die Bestattung könnte
        also irgendwo entlang des Zweigs gehören.</p>
        <p>Die Ebene folgt den Linienfiltern und der Suche wie alles andere. Die Suche nach einer
        Kultur oder einem Fundort (<code>Avar</code>, <code>Corded Ware</code>,
        <code>Kunpeszér</code>) hebt die Bestattungen selbst hervor. Ist <strong>Nur Treffer
        anzeigen</strong> angekreuzt, behält die Suche nach einem Nachnamen die antiken Verbindungen
        der Zweige dieser Familie, sodass eine Suche sowohl die getesteten Mitglieder als auch die
        Bestattungen ihrer Linie zeigt.</p>
        <p>Gezeigt werden nur Bestattungen, die sich zugleich einordnen und verorten lassen – jene, für
        die FamilyTreeDNA sowohl einen Zweig als auch Koordinaten angibt. Viele veröffentlichte Proben
        haben weder das eine noch das andere und bleiben außen vor.</p>`,
        },
        {
            id: "search",
            heading: "Suchen",
            body: `
        <p>Das Suchfeld im Seitenfeld findet einen <strong>Nachnamen</strong>, den Namen eines
        <strong>frühesten bekannten Vorfahren</strong>, eine <strong>Kit-Nummer</strong>, einen
        <strong>Ort</strong> und jede Haplogruppe auf der Linie eines Mitglieds. Die Suche nach einem
        übergeordneten Zweig wie <code>R-M420</code> findet daher alle seine Nachkommen, nicht nur die
        genau bis dorthin getesteten Mitglieder.</p>
        <p>Der Zähler unter dem Feld nennt die Zahl der Treffer; gibt es keine, färbt sich der Text
        rot. Die Suche <strong>hebt hervor</strong>, was sie findet, und lässt alle anderen
        sichtbar, sodass Verwandte und Nachbarn eines gesuchten Mitglieds um es herum bleiben. Auf
        der Karte behalten die passenden Markierungen ihre volle Farbe, die übrigen verblassen. Im
        Baum öffnen sich die Zweige, die zu einem Treffer führen, mit allen Mitgliedern darauf und
        den Treffern bernsteinfarben markiert; die anderen Zweige klappen zu. Im Blockbaum werden
        die Karten der passenden Mitglieder bernsteinfarben.</p>
        <p>Wer unter dem Feld <strong>Nur Treffer anzeigen</strong> ankreuzt, blendet in jeder
        Ansicht alles aus, was die Suche nicht findet: Die Karte behält nur die passenden
        Markierungen, der Baum nur die passenden Linien.</p>
        <p>Mit eingeschalteten antiken Verbindungen findet die Suche Bestattungen auch über ihren
        Namen, ihre Kultur oder ihren Fundort. Ist <strong>Nur Treffer anzeigen</strong> angekreuzt,
        behält sie außerdem die Bestattungen auf den Zweigen der gefundenen Personen.</p>`,
        },
        {
            id: "filters",
            heading: "Linien auswählen",
            body: `
        <p>Die Liste <strong>Linien</strong> im Seitenfeld führt jede im Projekt vertretene genetische
        Hauptgruppe auf, jeweils mit ihrer Farbe auf der Karte und der Zahl ihrer Mitglieder, eingerückt
        unter der Gruppe, von der sie abstammt. Ein abgewähltes Häkchen nimmt die Gruppe aus der
        aktuellen Ansicht; <strong>Alle auswählen</strong> und <strong>Alle abwählen</strong> schalten
        alle auf einmal. Die Zeile über der Liste zählt die derzeit gezeigten Mitglieder von allen. In
        einer Linienansicht rückt das Setzen oder Entfernen eines Häkchens den Baum zugleich auf diesen
        Zweig.</p>
        <p>Auf der Karte werden beide Listen angeboten, da sie beide Linien zusammen zeichnet; in einer
        Linienansicht nur deren eigene. <strong>Nicht gruppiert</strong> sammelt die Mitglieder, deren
        Ergebnisse noch keiner Gruppe zugeordnet sind; sie ist standardmäßig aus und wird, anders als
        die übrigen Filter, nicht in der Adresse gemerkt.</p>
        <p>Im Baum schaltet ein Klick auf eine gerade ausgefilterte Haplogruppe deren Gruppe wieder ein,
        statt sie zuzuklappen — so holen Sie einen Zweig zurück, ohne ihn in der Liste zu suchen.</p>`,
        },
        {
            id: "export",
            heading: "Eine Ansicht exportieren",
            body: `
        <p>Die Download-Schaltfläche exportiert genau das, was Sie auf dem Bildschirm haben, mit
        Überschrift, Quellenangabe und Datum: die Karte als <strong>PNG</strong>-Bild, den Baum und den
        Blockbaum als <strong>SVG</strong>. Ein SVG behält seinen Text als Text und bleibt in jeder
        Größe scharf — die bessere Wahl für eine gedruckte Tafel oder eine Abbildung in einem
        Dokument.</p>`,
        },
        {
            id: "sharing",
            heading: "Ansichten teilen",
            body: `
        <p>Die Adresse im Browser hält den Zustand des Atlas fest — die geöffnete Ansicht, die Suche,
        die gewählten Linien, den Zoom und den Zweig, von dem ein Blockbaum ausgeht. Die Adresse zu
        kopieren teilt daher genau die Ansicht, die Sie vor sich haben, und ein Lesezeichen holt sie
        später zurück.</p>
        <p>Auch ob antike Verbindungen gezeigt werden, steht in der Adresse.</p>`,
        },
        {
            id: "language",
            heading: "Sprache",
            body: `
        <p>Die Flaggen-Schaltfläche in der Kopfzeile stellt den Atlas auf Slowenisch, Englisch,
        Kroatisch, Deutsch, Italienisch, Ungarisch oder Französisch um. Die Wahl wird auf Ihrem Gerät
        gemerkt und gilt auch für dieses Handbuch und für die Neuerungen.</p>`,
        },
        {
            id: "data",
            heading: "Woher die Daten stammen",
            body: `
        <p>Gezeigt werden die Ergebnisse der Mitglieder des Projekts <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> bei FamilyTreeDNA, zusammen mit dem Haplobaum,
        den Altersschätzungen und den Testerzahlen, die FamilyTreeDNA veröffentlicht. Es erscheint nur,
        was ein Mitglied im Projekt öffentlich gemacht hat. Das Datum der letzten Datenübernahme steht
        unten links auf jeder Seite.</p>
        <p>Der Atlas ist Teil des Projekts <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Slowenisches Genetisches Erbe</a> der <a href="https://rodoslovje.si/"
        target="_blank" rel="noopener noreferrer">Slowenischen Genealogischen Gesellschaft</a>. Wer bei
        FamilyTreeDNA getestet hat und slowenische Wurzeln besitzt, fügt mit dem Beitritt zum Projekt
        die eigene Linie diesem Bild hinzu.</p>`,
        },
    ],
};
