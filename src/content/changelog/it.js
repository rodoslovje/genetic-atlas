/* Novità — italiano.
 * Traduzione di ./en.js, che è l'originale. Sono tradotte solo le voci che
 * rientrano nella finestra di tre mesi mostrata dalla pagina; quelle più
 * vecchie restano nell'originale inglese, dove vengono anche scritte. Una voce
 * mancante ricade da sé sull'inglese.
 */

export default {
    title: "Novità",

    intro: `Che cosa è stato aggiunto all'Atlante Genetico Sloveno negli ultimi tre mesi, dal più
        recente. Sono elencate solo le nuove funzioni e i cambiamenti nel funzionamento dell'Atlante;
        non le correzioni né i consueti aggiornamenti dei dati. Tutto ciò che precede si trova nella <a
        href="https://github.com/rodoslovje/genetic-atlas/commits/main" target="_blank"
        rel="noopener noreferrer">cronologia del progetto su GitHub</a>.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "L'albero a blocchi, un secondo modo di leggere un lignaggio",
                    text: `Entrambe le viste dei lignaggi hanno ora le schede <em>Albero</em> e
                        <em>Albero a blocchi</em>. L'albero a blocchi mette il tempo sull'asse verticale:
                        ogni ramo è disegnato sul periodo in cui è esistito come un'unica linea, con
                        l'età del suo antenato comune e l'intervallo al 68 % di quella stima, i suoi SNP
                        equivalenti e ogni membro del progetto come scheda sotto il ramo fino al quale è
                        stato testato. Un clic su un blocco segue quella linea in profondità, e il
                        risultato si esporta in SVG come ogni altra vista.`,
                },
                {
                    title: "Una guida utente e queste novità",
                    text: `La barra in fondo all'Atlante porta ora a una <a href="/guide/">guida
                        utente</a>, che percorre ogni vista e ogni opzione, e a queste novità. Entrambe
                        si aprono in una scheda propria, nella lingua in cui state leggendo l'Atlante, e
                        le date della versione e dei dati si sono spostate nella stessa barra.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "Francese",
                    text: `L'Atlante è ora disponibile anche in francese, accanto a sloveno, inglese,
                        croato, tedesco, italiano e ungherese.`,
                },
                {
                    title: "Una mappa più nitida",
                    text: `La mappa è disegnata da tasselli vettoriali, così i nomi dei luoghi restano
                        nitidi a ogni livello di ingrandimento e i segni poggiano su uno sfondo più
                        sobrio.`,
                },
            ],
        },
    ],
};
