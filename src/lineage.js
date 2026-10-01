import * as data from "./shared.js";
import { lineageMode } from "./shared.js";
import { TreeVisualizer } from "./tree.js";
import { BlockTree } from "./blocktree.js";

function makeLineage(containerId, kind, haploKey, peopleKey, rootsKey) {
    const isSquare = kind === "y";
    let tree = null;
    let blockTree = null;
    let scheduled = false;
    const api = {
        initialized: false,
        kind,
        init() {
            api.initialized = true;
            tree = new TreeVisualizer(containerId, isSquare);
            blockTree = new BlockTree(containerId, kind);
            api.refresh();
        },
        // Coalesce rapid refresh calls (filter toggles, search input) into a single
        // render per animation frame. The block tree decides for itself whether
        // it is the active mode and shows or hides accordingly.
        refresh() {
            if (!api.initialized || scheduled) return;
            scheduled = true;
            requestAnimationFrame(() => {
                scheduled = false;
                tree.render(data[haploKey], data[peopleKey], data[rootsKey]);
                if (blockTree) {
                    blockTree.setData(data[haploKey], data[peopleKey]);
                    blockTree.render();
                }
                // Counts that depend on what was actually drawn (the ancient
                // layer) can only be updated once the render has happened.
                window.dispatchEvent(new CustomEvent("viewRendered"));
            });
        },
        // Reset button: in block mode go back to the automatic starting
        // haplogroup; in tree mode reset pan/zoom.
        reset() {
            if (blockTree && lineageMode(kind) === "block") blockTree.home();
            else if (tree) tree.resetZoom();
        },
        openBlockTree(hg) {
            if (!blockTree) return;
            blockTree.setData(data[haploKey], data[peopleKey]);
            blockTree.open(hg);
        },
        get blockTreeOpen() {
            return !!(blockTree && blockTree.isOpen);
        },
        // Ancient burials this lineage's active mode put on screen. A burial
        // hangs on the branch where it joins the tree, so a view that starts
        // below that branch — or a tree pruned past it — draws fewer than the
        // lineage holds.
        get ancientDrawn() {
            if (!api.initialized) return null;
            const view = lineageMode(kind) === "block" ? blockTree : tree;
            return view && typeof view.ancientDrawn === "number" ? view.ancientDrawn : null;
        },
        exportBlockTreeSvg() {
            return blockTree ? blockTree.exportSvg() : null;
        }
    };
    return api;
}

export const ydna = makeLineage("#tree-container-ydna", "y", "ydnaHaploData", "ydnaPeopleData", "ydnaGroupRoots");
export const mtdna = makeLineage("#tree-container-mtdna", "mt", "mtdnaHaploData", "mtdnaPeopleData", "mtdnaGroupRoots");
