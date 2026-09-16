/* Nouveautés — français.
 * Traduction de ./en.js, qui fait foi. Seules sont traduites les entrées
 * comprises dans la fenêtre de trois mois affichée par la page ; les plus
 * anciennes restent dans l'original anglais, où elles sont également écrites.
 * Une entrée manquante revient d'elle-même à l'anglais.
 */

export default {
    title: "Nouveautés",

    intro: `Ce qui a été ajouté à l'Atlas Génétique Slovène ces trois derniers mois, du plus récent au
        plus ancien. Seuls figurent ici les nouvelles fonctions et les changements de fonctionnement de
        l'Atlas ; ni les corrections ni les mises à jour régulières des données. Tout ce qui précède se
        trouve dans l'<a href="https://github.com/rodoslovje/genetic-atlas/commits/main" target="_blank"
        rel="noopener noreferrer">historique du projet sur GitHub</a>.`,

    entries: [
        {
            date: "2026-09-16",
            items: [
                {
                    title: "L'arbre en blocs, une seconde façon de lire une lignée",
                    text: `Les deux vues de lignées possèdent désormais les onglets <em>Arbre</em> et
                        <em>Arbre en blocs</em>. L'arbre en blocs place le temps sur l'axe vertical :
                        chaque branche est tracée sur la période où elle a existé comme une seule lignée,
                        avec l'âge de son ancêtre commun et l'intervalle à 68 % de cette estimation, ses
                        SNP équivalents et chaque membre du projet sous forme de fiche sous la branche
                        jusqu'à laquelle il a été testé. Un clic sur un bloc suit cette lignée vers le
                        détail, et le résultat s'exporte en SVG comme toute autre vue.`,
                },
                {
                    title: "Un guide d'utilisation et ces nouveautés",
                    text: `La barre au bas de l'Atlas mène désormais à un <a href="/guide/">guide
                        d'utilisation</a>, qui parcourt chaque vue et chaque option, ainsi qu'à ces
                        nouveautés. Les deux s'ouvrent dans leur propre onglet, dans la langue où vous
                        lisez l'Atlas, et les dates de la version et des données ont rejoint cette même
                        barre.`,
                },
            ],
        },
        {
            date: "2026-08-28",
            items: [
                {
                    title: "Le français",
                    text: `L'Atlas est désormais proposé en français également, aux côtés du slovène, de
                        l'anglais, du croate, de l'allemand, de l'italien et du hongrois.`,
                },
                {
                    title: "Une carte plus nette",
                    text: `La carte est dessinée à partir de tuiles vectorielles : les noms de lieux
                        restent nets à tous les niveaux de zoom et les repères se détachent sur un fond
                        plus sobre.`,
                },
            ],
        },
    ],
};
