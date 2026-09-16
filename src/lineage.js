import * as data from "./shared.js";
import { state } from "./shared.js";
import { TreeVisualizer } from "./tree.js";
import { BlockTree } from "./blocktree.js";

function makeLineage(containerId, isSquare, haploKey, peopleKey, rootsKey, withBlockTree = false) {
    let tree = null;
    let blockTree = null;
    let scheduled = false;
    const api = {
        initialized: false,
        init() {
            api.initialized = true;
            tree = new TreeVisualizer(containerId, isSquare);
            if (withBlockTree) blockTree = new BlockTree(containerId);
            api.refresh();
        },
        // Coalesce rapid refresh calls (filter toggles, search input) into a single
        // render per animation frame. The block tree decides for itself whether
        // it is the active mode (state.ymode) and shows or hides accordingly.
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
            });
        },
        // Reset button: in block mode go back to the automatic starting
        // haplogroup; in tree mode reset pan/zoom.
        reset() {
            if (blockTree && state.ymode === "block") blockTree.home();
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
        exportBlockTreeSvg() {
            return blockTree ? blockTree.exportSvg() : null;
        }
    };
    return api;
}

export const ydna = makeLineage("#tree-container-ydna", true, "ydnaHaploData", "ydnaPeopleData", "ydnaGroupRoots", true);
export const mtdna = makeLineage("#tree-container-mtdna", false, "mtdnaHaploData", "mtdnaPeopleData", "mtdnaGroupRoots");
