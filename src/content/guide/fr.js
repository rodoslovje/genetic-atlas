/* Guide d'utilisation — français.
 * Traduction de ./en.js, qui fait foi ; lorsque le texte anglais change, il
 * faut mettre celui-ci à jour aussi. Les id des sections restent ceux de
 * l'original, pour que les ancres de l'adresse fonctionnent dans toutes les
 * langues. Les noms des boutons et des options doivent correspondre à
 * ../../i18n/fr.json.
 */

export default {
    title: "Guide d'utilisation",

    intro: `L'Atlas Génétique Slovène présente les résultats Y-DNA (lignée paternelle) et mtDNA
        (lignée maternelle) des membres du projet <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> chez FamilyTreeDNA, sous forme de carte et de
        deux arbres de lignées. Ce guide explique ce que montre chaque vue et comment s'en servir.`,

    sections: [
        {
            id: "views",
            heading: "Les trois vues",
            body: `
        <p>Les liens en haut de la page font passer d'une vue à l'autre. Chacune conserve son propre
        état : vous pouvez donc circuler entre elles sans perdre l'endroit où vous en étiez.</p>
        <ul>
          <li><strong>Carte</strong> — où vivaient les ancêtres connus les plus anciens des membres
          testés, les deux lignées à la fois.</li>
          <li><strong>Lignées Paternelles (Y-DNA)</strong> — l'arbre du chromosome Y, transmis de père
          en fils, qui suit le nom de famille dans la plupart des familles slovènes.</li>
          <li><strong>Lignées Maternelles (mtDNA)</strong> — l'arbre de l'ADN mitochondrial, qu'une
          mère transmet à tous ses enfants mais qui ne se poursuit que par ses filles.</li>
        </ul>
        <p>Le bouton à trois barres, en haut à droite, ouvre et ferme le <strong>panneau</strong> qui
        contient le champ de recherche, les filtres de lignées et les options de la vue en cours. Sur
        un écran étroit, les liens vers les vues y sont également déplacés.</p>
        <p>Trois boutons ronds flottent au-dessus de la vue : <strong>i</strong> affiche des
        informations de fond sur la vue, la flèche exporte ce que vous regardez, et le cercle barré
        d'une croix ramène la vue à sa position de départ.</p>`,
        },
        {
            id: "map",
            heading: "La carte",
            body: `
        <p>Chaque repère est un membre testé, placé au lieu de naissance de son ancêtre direct connu le
        plus ancien. Les <strong>carrés</strong> sont des résultats paternels (Y-DNA), les
        <strong>cercles</strong> des résultats maternels (mtDNA) ; la couleur indique le groupe
        génétique principal (haplogroupe) auquel le membre appartient, de sorte que les lignées
        apparentées partagent une couleur sur toute la carte.</p>
        <p>Des membres d'un même lieu se retrouveraient exactement au même point : les repères partageant
        une adresse sont donc répartis en un ou deux petits anneaux autour d'elle. En zoomant, ils se
        séparent.</p>
        <p>Un clic sur un repère ouvre ses détails : numéro de kit, test effectué, lignée, haplogroupe,
        nom de famille, ancêtre connu le plus ancien et lieu. Trois d'entre eux sont des liens — le
        <strong>numéro de kit</strong> ouvre cette personne dans son arbre, l'<strong>haplogroupe</strong>
        recherche cette branche dans l'arbre, et le <strong>lieu</strong> recherche sur la carte tous
        ceux qui en sont originaires.</p>
        <p><strong>Afficher les étiquettes</strong>, dans le panneau, inscrit le nom de l'ancêtre (ou le
        nom de famille) à côté de chaque repère. Les noms en gras appartiennent aux membres ayant passé
        le test le plus complet pour leur lignée — Big Y pour l'Y-DNA, la séquence mitochondriale
        complète pour le mtDNA.</p>`,
        },
        {
            id: "tree",
            heading: "L'arbre des lignées",
            body: `
        <p>L'arbre pousse de gauche à droite : les ancêtres communs les plus anciens à gauche, les
        membres testés d'aujourd'hui en feuilles à droite. Chaque nœud rond est un haplogroupe — une
        branche de l'humanité définie par une mutation — et les branches les mieux connues portent en
        plus un nom descriptif, pour qu'une lignée se lise comme un récit et non comme une liste de
        sigles SNP.</p>
        <p>Faites glisser pour déplacer l'arbre, faites défiler (ou pincez) pour zoomer. La bande étroite
        à droite est un aperçu de l'arbre entier, votre fenêtre actuelle y étant marquée ; un clic ou un
        glissé à l'intérieur vous emmène ailleurs. Le pointeur sur un nœud en affiche les détails, et
        sur un membre la même fiche que sur la carte.</p>
        <p>Un clic sur un haplogroupe replie la branche qui en dépend, un autre la rouvre. Un nœud dessiné
        creux — cerné de sa couleur mais non rempli — cache encore quelque chose derrière lui ; un nœud
        plein montre tout ce qu'il contient. Les traits des branches sont colorés selon l'âge de la
        branche, suivant la légende <strong>Époques</strong> au bas du panneau.</p>
        <p>Trois options du panneau déterminent la quantité d'arbre dessinée :</p>
        <ul>
          <li><strong>Afficher tous les groupes génétiques principaux</strong> — dessine tous les grands
          haplogroupes, y compris ceux sans membre dans le projet, ce qui montre les lignées slovènes à
          leur place dans l'arbre de l'humanité.</li>
          <li><strong>Afficher toutes les variantes génétiques</strong> — conserve les branches
          intermédiaires qui n'ont pas de membre propre. Sans elle, l'arbre saute directement d'une
          bifurcation significative à la suivante.</li>
          <li><strong>Afficher uniquement les lignées</strong> — laisse de côté les membres individuels
          et ne dessine que les branches, ce qui rend la forme de l'arbre bien plus lisible.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "L'arbre en blocs",
            body: `
        <p>Les onglets <strong>Arbre</strong> et <strong>Arbre en blocs</strong> en haut du panneau
        changent la façon dont une lignée est dessinée. Si l'arbre parle de forme, l'arbre en blocs parle
        de <strong>temps</strong> : les années descendent le long de l'axe vertical, de la branche la plus
        ancienne en haut jusqu'au présent en bas, et chaque branche est un bloc tracé sur la période où
        elle a existé comme une seule lignée, avant de se diviser.</p>
        <p>Chaque bloc porte son haplogroupe et prend la couleur de son époque. Le pointeur dessus indique
        quand la branche s'est formée, quand a vécu l'ancêtre commun de ses membres, les intervalles à
        68 % et à 99 % de cette estimation, les SNP équivalents de la branche (pour le mtDNA, ses
        mutations) et combien de personnes FamilyTreeDNA a testées sur elle et en dessous.</p>
        <p>Sous les blocs, chaque membre du projet reçoit sa propre fiche sous la branche jusqu'à laquelle
        il a été testé. Une fiche teintée signale un membre ayant passé le test le plus complet pour sa
        lignée, une fiche ambrée un membre correspondant à la recherche en cours.</p>
        <p>Un clic sur un bloc redessine la vue avec cette branche pour nouveau point de départ — la façon
        de suivre une lignée dans le détail. Le bouton <strong>↑</strong> et le fil d'ariane à côté, en
        haut de la vue, ramènent vers la racine.</p>`,
        },
        {
            id: "search",
            heading: "Rechercher",
            body: `
        <p>Le champ de recherche du panneau trouve un <strong>nom de famille</strong>, le nom d'un
        <strong>ancêtre connu le plus ancien</strong>, un <strong>numéro de kit</strong>, un
        <strong>lieu</strong> et chaque haplogroupe présent sur la lignée d'un membre. Rechercher une
        branche en amont telle que <code>R-M420</code> trouve donc tous ses descendants, et pas seulement
        les membres testés exactement jusque-là.</p>
        <p>Le compteur sous le champ indique combien de personnes correspondent ; lorsqu'aucune ne
        correspond, le texte passe au rouge. La recherche s'applique à la vue ouverte : sur la carte elle
        filtre les repères, dans l'arbre elle l'élague aux lignées correspondantes, et dans l'arbre en
        blocs elle met en évidence les membres trouvés.</p>`,
        },
        {
            id: "filters",
            heading: "Choisir les lignées",
            body: `
        <p>La liste <strong>Lignées</strong> du panneau contient tous les groupes génétiques principaux
        présents dans le projet, chacun avec sa couleur sur la carte et son nombre de membres, en retrait
        sous le groupe dont il descend. Décocher un groupe le retire de la vue en cours ; <strong>Tout
        sélectionner</strong> et <strong>Tout désélectionner</strong> agissent sur l'ensemble. La ligne
        au-dessus de la liste compte les membres actuellement affichés sur le total. Dans une vue de
        lignée, cocher ou décocher déplace aussi l'arbre sur cette branche.</p>
        <p>Sur la carte, les deux listes sont proposées, puisqu'elle dessine les deux lignées ensemble ;
        dans une vue de lignée, seulement la sienne. <strong>Non groupés</strong> rassemble les membres
        dont les résultats n'ont pas encore été classés dans un groupe ; l'option est désactivée par
        défaut et, contrairement aux autres filtres, n'est pas retenue dans l'adresse.</p>
        <p>Dans l'arbre, un clic sur un haplogroupe actuellement filtré réactive son groupe au lieu de le
        replier : une branche revient ainsi sans avoir à la chercher dans la liste.</p>`,
        },
        {
            id: "export",
            heading: "Exporter une vue",
            body: `
        <p>Le bouton de téléchargement exporte exactement ce que vous avez à l'écran, avec un titre, la
        mention de la source et la date : la carte en image <strong>PNG</strong>, l'arbre et l'arbre en
        blocs en <strong>SVG</strong>. Un SVG garde son texte comme du texte et reste net à toute taille,
        ce qui en fait le meilleur choix pour une planche imprimée ou une figure dans un document.</p>`,
        },
        {
            id: "sharing",
            heading: "Partager ce que vous voyez",
            body: `
        <p>L'adresse dans le navigateur conserve l'état de l'Atlas — la vue ouverte, la recherche, les
        lignées choisies, le zoom et la branche d'où part un arbre en blocs. Copier l'adresse partage donc
        exactement la vue que vous avez sous les yeux, et un signet la retrouve plus tard.</p>`,
        },
        {
            id: "language",
            heading: "Langue",
            body: `
        <p>Le bouton au drapeau, dans l'en-tête, fait passer l'Atlas en slovène, anglais, croate,
        allemand, italien, hongrois ou français. Le choix est retenu sur votre appareil et vaut aussi pour
        ce guide et pour les nouveautés.</p>`,
        },
        {
            id: "data",
            heading: "D'où viennent les données",
            body: `
        <p>Les résultats sont ceux des membres du projet <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> chez FamilyTreeDNA, avec l'haplo-arbre, les
        estimations d'âge et le nombre de personnes testées publiés par FamilyTreeDNA. Seul ce qu'un
        membre a choisi de rendre public dans le projet est affiché. La date de la dernière reprise des
        données figure en bas à gauche de chaque page.</p>
        <p>L'Atlas fait partie du projet <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Patrimoine Génétique Slovène</a> de la <a href="https://rodoslovje.si/"
        target="_blank" rel="noopener noreferrer">Société Généalogique Slovène</a>. Si vous avez fait un
        test chez FamilyTreeDNA et avez des racines slovènes, rejoindre le projet ajoute votre lignée à
        ce tableau.</p>`,
        },
    ],
};
