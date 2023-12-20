import L, { LatLngTuple } from "leaflet";
type HlMapConfig = {
    hlRender: string;
    hlCenter: LatLngTuple;
    hlZoom: number;
    hlPreserve: boolean;
    markers: HlMarkerConfig[];
};
type HlMarkerConfig = {
    hlCenter?: LatLngTuple;
    hlPopup?: string;
};
type HlMap = {
    config: HlMapConfig;
    configElement: HTMLElement;
    renderElement: HTMLElement | null;
    map?: L.Map;
    configString?: string;
};
export type HlMapMoveEndEvent = {
    center: LatLngTuple;
    zoom: number;
    bounds: LatLngTuple[];
};
export type HlPopupOpenEvent = {
    popup: HTMLElement;
};
declare function findMaps(): HlMap[];
declare function apply(map: HlMap): void;
declare function initMaps(maps: HlMap[]): void;
declare function updateMaps(maps: HlMap[]): void;
/**
 * Synchronize a maps center, zoom and bounds with the given values
 */
declare function syncMove(element: HTMLElement, event: HlMapMoveEndEvent): void;
declare const _default: {
    findMaps: typeof findMaps;
    initMaps: typeof initMaps;
    updateMaps: typeof updateMaps;
    mapCache: Record<string, HlMap>;
    apply: typeof apply;
    syncMove: typeof syncMove;
};
export default _default;
