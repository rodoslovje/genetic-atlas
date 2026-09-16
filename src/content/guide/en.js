/* User Guide — English, the source of record.
 *
 * One file per language in this directory, lazy-loaded by ../../pages/page.js;
 * a language without a file falls back to this one whole. Section bodies are
 * HTML written by us and inserted as written, so they may use <p>, <ul>,
 * <strong>, <em>, <code> and links; `title` and `heading` are plain text.
 *
 * Keep this in step with the app — see the User Guide and Changelog rules in
 * CLAUDE.md. Check every claim against the code rather than the older wording:
 * instructions that no longer match the app are worse than missing ones.
 */

export default {
    title: "User Guide",

    intro: `The Slovenian Genetic Atlas shows the Y-DNA (paternal) and mtDNA (maternal) results
        contributed by members of the <a href="https://www.familytreedna.com/groups/slovenianorigin/about"
        target="_blank" rel="noopener noreferrer">Slovenian Origin</a> project at FamilyTreeDNA, as a map
        and as two lineage trees. This guide walks through what each view shows and how to work with it.`,

    sections: [
        {
            id: "views",
            heading: "The three views",
            body: `
        <p>The links at the top of the page switch between the three views. Each keeps its own
        state, so you can move between them without losing your place.</p>
        <ul>
          <li><strong>Map</strong> — where the earliest known ancestors of the tested members lived,
          both lineages at once.</li>
          <li><strong>Paternal Lineages (Y-DNA)</strong> — the tree of the Y chromosome, passed from
          father to son, which follows the surname line in most Slovenian families.</li>
          <li><strong>Maternal Lineages (mtDNA)</strong> — the tree of mitochondrial DNA, passed from a
          mother to all of her children but inherited further only through her daughters.</li>
        </ul>
        <p>The button with the three bars, at the top right, opens and closes the <strong>panel</strong>
        that holds the search box, the lineage filters and the options for the current view. On a
        narrow screen the view links move into that panel as well.</p>
        <p>The three round buttons float over the view itself: <strong>i</strong> shows background
        information about the view, the arrow exports what you are looking at, and the circle with
        the cross resets the view to its starting position.</p>`,
        },
        {
            id: "map",
            heading: "The map",
            body: `
        <p>Every marker is one tested member, placed at the birthplace of their earliest known direct
        ancestor. <strong>Squares</strong> are paternal (Y-DNA) results and <strong>circles</strong>
        maternal (mtDNA) ones; the colour is the major genetic group (haplogroup) the member belongs
        to, so related lineages share a colour across the whole map.</p>
        <p>Members from the same place would land on the very same point, so markers sharing an
        address are spread out in one or two small rings around it. Zooming in separates them.</p>
        <p>Clicking a marker opens its details: kit number, test taken, lineage, haplogroup, surname,
        earliest known ancestor and place. Three of those are links — the <strong>kit number</strong>
        opens that person in their lineage tree, the <strong>haplogroup</strong> searches the tree for
        that branch, and the <strong>place</strong> searches the map for everyone from it.</p>
        <p><strong>Show labels</strong>, in the panel, writes the ancestor's name (or the surname)
        beside each marker. Names in bold belong to members who took the most informative test for
        their lineage — Big Y for Y-DNA, the full mitochondrial sequence for mtDNA.</p>`,
        },
        {
            id: "tree",
            heading: "The lineage tree",
            body: `
        <p>The tree grows from left to right: the oldest common ancestors on the left, today's tested
        members as the leaves on the right. Each round node is a haplogroup — a branch of humanity
        defined by one mutation — and well-known branches also carry a descriptive name, so the line
        can be read as a story rather than as a list of SNP codes.</p>
        <p>Drag to move the tree and scroll (or pinch) to zoom. The small strip on the right is an
        overview of the whole tree with your current window marked on it; click or drag inside it to
        jump elsewhere. Hovering over a node shows its details, and over a member shows the same
        card as on the map.</p>
        <p>Clicking a haplogroup collapses the branch below it, and clicking again opens it up. A
        node drawn hollow — outlined in its colour but not filled — has something folded away behind
        it; a solid one shows everything it holds. Branch lines are coloured by the age of the
        branch, following the <strong>Eras</strong> legend at the bottom of the panel.</p>
        <p>Three options in the panel change how much of the tree is drawn:</p>
        <ul>
          <li><strong>Show all major genetic groups</strong> — draws every major haplogroup, including
          those with no member in the project, so the Slovenian lineages can be seen in their place
          on the human tree.</li>
          <li><strong>Show all genetic variants</strong> — keeps the intermediate branches that carry
          no member of their own. Without it the tree skips straight from one meaningful split to the
          next.</li>
          <li><strong>Show only lineages</strong> — leaves out the individual members and draws the
          branches alone, which makes the shape of the tree much easier to take in.</li>
        </ul>`,
        },
        {
            id: "block-tree",
            heading: "The block tree",
            body: `
        <p>The <strong>Tree</strong> and <strong>Block tree</strong> tabs at the top of the panel
        switch the way a lineage is drawn. Where the tree is about shape, the block tree is about
        <strong>time</strong>: years run down the vertical axis, from the oldest branch at the top to
        the present at the bottom, and every branch is a block drawn over the period it existed as a
        single line, before it split.</p>
        <p>Each block is labelled with its haplogroup and coloured by era. Hovering over one shows
        when the branch formed, when its members' most recent common ancestor lived, the 68 % and
        99 % ranges of that estimate, the branch's equivalent SNPs (for mtDNA, its mutations) and how
        many people FamilyTreeDNA has tested on it and below it.</p>
        <p>Below the blocks, each project member gets a card of their own under the branch they were
        tested to. A tinted card marks a member with the most informative test for their lineage, and
        an amber one a member matching the current search.</p>
        <p>Clicking a block redraws the view with that branch as the new starting point — the way to
        follow one line down into its detail. The <strong>↑</strong> button and the trail beside it,
        at the top of the view, lead back up towards the root.</p>`,
        },
        {
            id: "search",
            heading: "Searching",
            body: `
        <p>The search box in the panel matches a <strong>surname</strong>, the name of an
        <strong>earliest known ancestor</strong>, a <strong>kit number</strong>, a
        <strong>place</strong>, and every haplogroup on a member's line. Searching for an upstream
        branch such as <code>R-M420</code> therefore finds everyone descended from it, not only the
        members tested exactly to it.</p>
        <p>The counter under the box says how many people match; when nothing does, the text turns
        red. The search applies to whichever view is open: it filters the markers on the map, prunes
        the tree to the matching lines, and highlights the matching members in the block tree.</p>`,
        },
        {
            id: "filters",
            heading: "Choosing lineages",
            body: `
        <p>The <strong>Lineages</strong> list in the panel holds every major genetic group present in
        the project, each with its colour on the map and the number of members in it, and indented
        under the group it descends from. Unticking a group removes it from the current view;
        <strong>Select All</strong> and <strong>Deselect All</strong> switch them all at once. The
        line above the list counts the members currently shown, out of all of them. In a lineage
        view, ticking or unticking a group also moves the tree to that branch.</p>
        <p>On the map both lists are offered, since it draws both lineages together; in a lineage
        view only that lineage's own list is. <strong>Ungrouped</strong> collects the members whose
        results have not been sorted into a group yet; it is off by default and, unlike the other
        filters, is not remembered in the address.</p>
        <p>In the tree, clicking a haplogroup that is currently filtered out ticks its group back on
        instead of collapsing it, so a branch can be brought back without hunting for it in the
        list.</p>`,
        },
        {
            id: "export",
            heading: "Exporting a view",
            body: `
        <p>The download button exports exactly what you have on screen, with a heading, the source
        attribution and the date drawn in: the map as a <strong>PNG</strong> image, and both the tree
        and the block tree as <strong>SVG</strong>. An SVG keeps its text as text and stays sharp at
        any size, which makes it the better choice for a printed chart or for a figure in a
        document.</p>`,
        },
        {
            id: "sharing",
            heading: "Sharing what you see",
            body: `
        <p>The address in the browser keeps the state of the Atlas — the open view, the search, the
        chosen lineages, the zoom, and which branch a block tree starts from. Copying the address
        therefore shares the exact view you are looking at, and a bookmark brings it back later.</p>`,
        },
        {
            id: "language",
            heading: "Language",
            body: `
        <p>The flag button in the header switches the Atlas between Slovenian, English, Croatian,
        German, Italian, Hungarian and French. The choice is remembered on your device and is also
        used for this guide and for the changelog.</p>`,
        },
        {
            id: "data",
            heading: "Where the data comes from",
            body: `
        <p>The results are those of the members of the <a
        href="https://www.familytreedna.com/groups/slovenianorigin/about" target="_blank"
        rel="noopener noreferrer">Slovenian Origin</a> project at FamilyTreeDNA, together with the
        haplotree, the age estimates and the tester counts published by FamilyTreeDNA. Only what a
        member has chosen to make public in the project is shown. The date the data was last taken
        over is at the bottom left of every page.</p>
        <p>The Atlas is part of the <a href="https://rodoslovje.si/slovenska-dnk" target="_blank"
        rel="noopener noreferrer">Slovenian Genetic Heritage</a> project of the <a
        href="https://rodoslovje.si/" target="_blank" rel="noopener noreferrer">Slovenian Genealogical
        Society</a>. If you have tested with FamilyTreeDNA and have Slovenian roots, joining the
        project adds your lineage to this picture.</p>`,
        },
    ],
};
