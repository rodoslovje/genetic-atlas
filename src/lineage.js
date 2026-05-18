import * as data from "./shared.js";
import { TreeVisualizer } from "./tree.js";

function makeLineage(containerId, isSquare, haploKey, peopleKey, rootsKey) {
    let tree = null;
    const api = {
        initialized: false,
        init() {
            api.initialized = true;
            tree = new TreeVisualizer(containerId, isSquare);
            api.refresh();
        },
        refresh() {
            if (!api.initialized) return;
            tree.render(data[haploKey], data[peopleKey], data[rootsKey]);
        },
        reset() {
            if (tree) tree.resetZoom();
        }
    };
    return api;
}

export const ydna = makeLineage("#tree-container-ydna", true, "ydnaHaploData", "ydnaPeopleData", "ydnaGroupRoots");
export const mtdna = makeLineage("#tree-container-mtdna", false, "mtdnaHaploData", "mtdnaPeopleData", "mtdnaGroupRoots");
