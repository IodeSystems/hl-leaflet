import L from "leaflet";
type HlMapConfig = {
    hlRender: string;
    hlCenter: string;
    hlZoom: string;
    markers: HlMarkerConfig[];
};
type HlMarkerConfig = {
    hlCenter?: string;
    hlPopup?: string;
};
type HlMap = {
    config: HlMapConfig;
    configElement: HTMLElement;
    renderElement: HTMLElement | null;
    map?: L.Map;
    configString?: string;
};
declare function findMaps(): HlMap[];
declare function apply(map: HlMap): void;
declare function initMaps(maps: HlMap[]): void;
declare function updateMaps(maps: HlMap[]): void;
declare const _default: {
    findMaps: typeof findMaps;
    initMaps: typeof initMaps;
    updateMaps: typeof updateMaps;
    mapCache: Record<string, HlMap>;
    apply: typeof apply;
};
export default _default;
