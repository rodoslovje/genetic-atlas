import { mtdnaHaploData, mtdnaPeopleData, mtdnaGroupRoots } from "./shared.js";
import { TreeVisualizer } from "./tree.js";

export let mtdnaInitialized = false;
let mtdnaTree = null;

export function initMTDNA() {
    mtdnaInitialized = true;
    mtdnaTree = new TreeVisualizer("#tree-container-mtdna", false);
    refreshMTDNADisplay();
}

export function refreshMTDNADisplay() {
    if (!mtdnaInitialized) return;
    mtdnaTree.render(mtdnaHaploData, mtdnaPeopleData, mtdnaGroupRoots);
}

export function resetMTDNATree() {
    if (mtdnaTree) mtdnaTree.resetZoom();
}