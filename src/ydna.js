import { ydnaHaploData, ydnaPeopleData, ydnaGroupRoots } from "./shared.js";
import { TreeVisualizer } from "./tree.js";

export let ydnaInitialized = false;
let ydnaTree = null;

export function initYDNA() {
    ydnaInitialized = true;
    ydnaTree = new TreeVisualizer("#tree-container-ydna");
    refreshYDNADisplay();
}

export function refreshYDNADisplay() {
    if (!ydnaInitialized) return;
    ydnaTree.render(ydnaHaploData, ydnaPeopleData, ydnaGroupRoots);
}