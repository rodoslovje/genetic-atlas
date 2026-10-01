/* Guida utente — italiano.
 * Traduzione di ./en.js, che è l'originale; quando il testo inglese cambia,
 * va aggiornata anche questa. Gli id delle sezioni restano quelli
 * dell'originale, così le ancore nell'indirizzo funzionano in tutte le lingue.
 * I nomi dei pulsanti e delle opzioni devono corrispondere a
 * ../../i18n/it.json.
 */

export default {
    title: "Guida utente",

    intro: `L'Atlante Genetico Sloveno mostra i risultati Y-DNA (linea paterna) e mtDNA (linea
        materna) dei membri del progetto <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> di FamilyTreeDNA, sotto forma di mappa e di due
        alberi dei lignaggi. Questa guida spiega che cosa mostra ciascuna vista e come usarla.`,

    sections: [
        {
            id: "views",
            heading: "Le tre viste",
            body: `
        <p>I collegamenti in alto passano da una vista all'altra. Ognuna conserva il proprio stato, così
        potete spostarvi tra loro senza perdere il punto in cui eravate.</p>
        <ul>
          <li><strong>Mappa</strong> — dove vivevano gli antenati noti più antichi dei membri testati,
          entrambi i lignaggi insieme.</li>
          <li><strong>Lignaggi Paterni (Y-DNA)</strong> — l'albero del cromosoma Y, trasmesso di padre
          in figlio, che nella maggior parte delle famiglie slovene segue il cognome.</li>
          <li><strong>Lignaggi Materni (mtDNA)</strong> — l'albero del DNA mitocondriale, che una madre
          trasmette a tutti i figli ma che prosegue solo attraverso le figlie.</li>
        </ul>
        <p>Il pulsante con le tre barre, in alto a destra, apre e chiude il <strong>pannello</strong>
        con il campo di ricerca, i filtri dei lignaggi e le opzioni della vista attuale. Su uno schermo
        stretto vi si spostano anche i collegamenti alle viste.</p>
        <p>Tre pulsanti rotondi fluttuano sulla vista stessa: <strong>i</strong> mostra informazioni di
        contesto sulla vista, la freccia esporta ciò che state guardando e il cerchio con la croce
        riporta la vista alla posizione iniziale.</p>`,
        },
        {
            id: "map",
            heading: "La mappa",
            body: `
        <p>Ogni segno è un membro testato, collocato nel luogo di nascita del suo antenato diretto noto
        più antico. I <strong>quadrati</strong> sono risultati paterni (Y-DNA), i
        <strong>cerchi</strong> materni (mtDNA); il colore indica il gruppo genetico principale
        (aplogruppo) a cui il membro appartiene, così i lignaggi affini condividono il colore su tutta
        la mappa.</p>
        <p>I membri di una stessa località finirebbero esattamente sullo stesso punto: i segni con lo
        stesso indirizzo vengono perciò distribuiti in uno o due piccoli anelli attorno ad esso.
        Ingrandendo si separano.</p>
        <p>Un clic su un segno ne apre i dati: numero del kit, test effettuato, lignaggio, aplogruppo,
        cognome, antenato noto più antico e luogo. Tre di questi sono collegamenti — il <strong>numero
        del kit</strong> apre quella persona nel suo albero, l'<strong>aplogruppo</strong> cerca quel
        ramo nell'albero e il <strong>luogo</strong> cerca sulla mappa tutti coloro che ne
        provengono.</p>
        <p><strong>Mostra etichette</strong>, nel pannello, scrive il nome dell'antenato (o il cognome)
        accanto a ogni segno. I nomi in grassetto appartengono ai membri che hanno svolto il test più
        informativo per il proprio lignaggio — Big Y per l'Y-DNA, la sequenza mitocondriale completa per
        il mtDNA.</p>
        <p>Con le <strong>connessioni antiche</strong> attive, tra i marcatori compaiono rombi e anelli
        nei colori delle epoche. Sono sepolture scavate, non membri del progetto — si veda
        <em>Connessioni antiche</em> più sotto.</p>`,
        },
        {
            id: "tree",
            heading: "L'albero dei lignaggi",
            body: `
        <p>L'albero cresce da sinistra a destra: gli antenati comuni più antichi a sinistra, i membri
        testati di oggi come foglie a destra. Ogni nodo tondo è un aplogruppo — un ramo dell'umanità
        definito da una mutazione — e i rami più noti portano anche un nome descrittivo, così che una
        linea si legga come un racconto e non come un elenco di sigle SNP.</p>
        <p>Trascinate per spostare l'albero e usate la rotellina (o le due dita) per ingrandire. La
        striscia sulla destra è una panoramica dell'intero albero con la finestra attuale segnata
        sopra; un clic o un trascinamento al suo interno vi porta altrove. Passando sopra un nodo ne
        compaiono i dati, e sopra un membro la stessa scheda della mappa.</p>
        <p>Un clic su un aplogruppo chiude il ramo sottostante, un altro lo riapre. Un nodo disegnato
        vuoto — con il contorno del suo colore ma non riempito — ha ancora qualcosa di chiuso dietro di
        sé; uno pieno mostra tutto ciò che contiene. Le linee dei rami sono colorate secondo l'età del
        ramo, come indica la legenda <strong>Epoche</strong> in fondo al pannello.</p>
        <p>Tre opzioni nel pannello decidono quanto albero viene disegnato:</p>
        <ul>
          <li><strong>Mostra tutti i principali gruppi genetici</strong> — disegna tutti i grandi
          aplogruppi, compresi quelli senza alcun membro nel progetto, così i lignaggi sloveni si
          vedono al loro posto nell'albero dell'umanità.</li>
          <li><strong>Mostra tutte le varianti genetiche</strong> — mantiene i rami intermedi che non
          hanno un membro proprio. Senza di essa l'albero salta da una biforcazione significativa alla
          successiva.</li>
          <li><strong>Mostra solo i lignaggi</strong> — lascia fuori i singoli membri e disegna i soli
          rami, il che rende molto più leggibile la forma dell'albero.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "L'albero a blocchi",
            body: `
        <p>Le schede <strong>Albero</strong> e <strong>Albero a blocchi</strong> in cima al pannello
        cambiano il modo in cui un lignaggio è disegnato. Se l'albero riguarda la forma, l'albero a
        blocchi riguarda il <strong>tempo</strong>: gli anni scorrono lungo l'asse verticale, dal ramo
        più antico in alto al presente in basso, e ogni ramo è un blocco disegnato sul periodo in cui è
        esistito come un'unica linea, prima di dividersi.</p>
        <p>Ogni blocco porta il proprio aplogruppo ed è colorato per epoca. Passandovi sopra compaiono
        quando il ramo si è formato, quando visse l'antenato comune dei suoi membri, gli intervalli al
        68 % e al 99 % di quella stima, gli SNP equivalenti del ramo (per il mtDNA le sue mutazioni) e
        quante persone FamilyTreeDNA ha testato su di esso e al di sotto.</p>
        <p>Sotto i blocchi ogni membro del progetto ha una scheda propria sotto il ramo fino al quale è
        stato testato. Una scheda colorata segnala un membro con il test più informativo per il proprio
        lignaggio, una ambrata un membro che corrisponde alla ricerca in corso.</p>
        <p>Un clic su un blocco ridisegna la vista con quel ramo come nuovo punto di partenza: è il modo
        di seguire una linea nel dettaglio. Il pulsante <strong>↑</strong> e il percorso accanto ad
        esso, in cima alla vista, riportano verso la radice.</p>`,
        },
        {
            id: "ancient",
            heading: "Connessioni antiche",
            body: `
        <p><strong>Connessioni antiche</strong>, nel pannello, aggiunge uno strato di sepolture scavate
        il cui DNA è stato pubblicato e che FamilyTreeDNA colloca su uno dei rami disegnati nell'Atlante.
        Lo strato è spento finché non lo si accende, e la riga sottostante conta le sepolture che la
        vista attuale mostra.</p>
        <p>Non sono membri del progetto e non vengono mai disegnate come tali. Sulla mappa una sepoltura
        è un <strong>rombo</strong> (linea paterna) o un <strong>anello</strong> (linea materna) nel
        luogo dello scavo, colorato secondo l'epoca in cui la persona visse e non secondo l'aplogruppo.
        Nell'albero pende dal ramo in cui la sua linea incontra la nostra, in corsivo dopo un ⚱ e con la
        data. Nell'albero a blocchi riceve una colonna propria, come un membro — ma una che si ferma
        all'anno della morte invece di arrivare fino a oggi, con quell'anno scritto sul bordo di
        chiusura.</p>
        <p>Passandoci sopra si vede di chi si tratta: la datazione e il suo intervallo, il sito, la
        cultura archeologica, l'aplogruppo dei resti, il ramo in cui quella linea e la nostra si
        incontrano, quando visse quell'antenato comune e lo studio che ha pubblicato il DNA. Un contorno
        tratteggiato indica che FamilyTreeDNA segnala la collocazione come incerta — i resti portano le
        mutazioni di quel ramo ma nessuna al di sotto, perciò la sepoltura potrebbe trovarsi in qualsiasi
        punto lungo di esso.</p>
        <p>Lo strato segue i filtri delle linee e la ricerca come tutto il resto. Cercando una
        cultura o un sito (<code>Avar</code>, <code>Corded Ware</code>, <code>Kunpeszér</code>) si
        evidenziano le sepolture stesse. Con <strong>Mostra solo i risultati</strong> spuntato,
        cercando un cognome si mantengono le connessioni antiche dei rami di quella famiglia, così
        una sola ricerca mostra sia i membri testati sia le sepolture che la loro linea
        incontra.</p>
        <p>Sono mostrate solo le sepolture che si possono sia collocare sia mappare — quelle per cui
        FamilyTreeDNA fornisce sia un ramo sia le coordinate. Molti campioni pubblicati non hanno né
        l'uno né le altre e restano fuori.</p>`,
        },
        {
            id: "search",
            heading: "Cercare",
            body: `
        <p>Il campo di ricerca nel pannello trova un <strong>cognome</strong>, il nome di un
        <strong>antenato noto più antico</strong>, un <strong>numero di kit</strong>, una
        <strong>località</strong> e ogni aplogruppo sulla linea di un membro. Cercare un ramo a monte
        come <code>R-M420</code> trova quindi tutti i suoi discendenti, non soltanto i membri testati
        esattamente fino a quel punto.</p>
        <p>Il contatore sotto il campo dice quante persone corrispondono; quando non ne corrisponde
        nessuna il testo diventa rosso. La ricerca <strong>evidenzia</strong> ciò che trova e lascia
        in vista tutti gli altri, così parenti e vicini di un membro cercato restano attorno a lui.
        Sulla mappa i segni corrispondenti mantengono il colore pieno mentre gli altri sbiadiscono.
        Nell'albero si aprono i rami che portano a un risultato, con tutti i membri che vi si
        trovano e i risultati segnati in ambra, mentre gli altri rami si chiudono. Nell'albero a
        blocchi le schede dei membri trovati diventano ambrate.</p>
        <p>Spuntando <strong>Mostra solo i risultati</strong>, sotto il campo, si nasconde in ogni
        vista tutto ciò che la ricerca non trova: la mappa conserva solo i segni corrispondenti e
        l'albero solo le linee corrispondenti.</p>
        <p>Con le connessioni antiche attivate, la ricerca trova le sepolture anche per nome,
        cultura o sito. Con <strong>Mostra solo i risultati</strong> spuntato, mantiene anche le
        sepolture che si trovano sui rami delle persone trovate.</p>`,
        },
        {
            id: "filters",
            heading: "Scegliere i lignaggi",
            body: `
        <p>L'elenco <strong>Lignaggi</strong> nel pannello contiene tutti i gruppi genetici principali
        presenti nel progetto, ciascuno con il suo colore sulla mappa e il numero di membri, rientrato
        sotto il gruppo da cui discende. Togliendo la spunta a un gruppo lo si toglie dalla vista;
        <strong>Seleziona tutto</strong> e <strong>Deseleziona tutto</strong> agiscono su tutti insieme.
        La riga sopra l'elenco conta i membri attualmente mostrati sul totale. In una vista di lignaggio,
        spuntare o togliere la spunta sposta anche l'albero su quel ramo.</p>
        <p>Sulla mappa sono offerti entrambi gli elenchi, poiché disegna insieme i due lignaggi; in una
        vista di lignaggio soltanto il suo. <strong>Non raggruppati</strong> raccoglie i membri i cui
        risultati non sono ancora stati assegnati a un gruppo; è disattivato in partenza e, a differenza
        degli altri filtri, non viene ricordato nell'indirizzo.</p>
        <p>Nell'albero, un clic su un aplogruppo attualmente filtrato riattiva il suo gruppo invece di
        chiuderlo, così un ramo torna visibile senza doverlo cercare nell'elenco.</p>`,
        },
        {
            id: "export",
            heading: "Esportare una vista",
            body: `
        <p>Il pulsante di scaricamento esporta esattamente ciò che avete sullo schermo, con
        un'intestazione, la citazione della fonte e la data: la mappa come immagine
        <strong>PNG</strong>, l'albero e l'albero a blocchi come <strong>SVG</strong>. Un SVG conserva il
        testo come testo e resta nitido a qualsiasi dimensione: è la scelta migliore per una tavola
        stampata o per una figura in un documento.</p>`,
        },
        {
            id: "sharing",
            heading: "Condividere ciò che vedete",
            body: `
        <p>L'indirizzo nel browser conserva lo stato dell'Atlante — la vista aperta, la ricerca, i
        lignaggi scelti, l'ingrandimento e il ramo da cui parte un albero a blocchi. Copiare l'indirizzo
        condivide quindi esattamente la vista che avete davanti, e un segnalibro la riporta più
        tardi.</p>
        <p>Anche il fatto che le connessioni antiche siano mostrate viaggia nell'indirizzo.</p>`,
        },
        {
            id: "language",
            heading: "Lingua",
            body: `
        <p>Il pulsante con la bandiera nell'intestazione passa l'Atlante tra sloveno, inglese, croato,
        tedesco, italiano, ungherese e francese. La scelta viene ricordata sul vostro dispositivo e vale
        anche per questa guida e per le novità.</p>`,
        },
        {
            id: "data",
            heading: "Da dove vengono i dati",
            body: `
        <p>I risultati sono quelli dei membri del progetto <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> di FamilyTreeDNA, insieme all'aplo-albero, alle
        stime di età e al numero di testati pubblicati da FamilyTreeDNA. Viene mostrato solo ciò che un
        membro ha scelto di rendere pubblico nel progetto. La data dell'ultimo aggiornamento dei dati è
        in basso a sinistra su ogni pagina.</p>
        <p>L'Atlante fa parte del progetto <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Patrimonio Genetico Sloveno</a> della <a href="https://rodoslovje.si/"
        target="_blank" rel="noopener noreferrer">Società Genealogica Slovena</a>. Se avete fatto un
        test con FamilyTreeDNA e avete radici slovene, aderendo al progetto aggiungete il vostro
        lignaggio a questo quadro.</p>`,
        },
    ],
};
