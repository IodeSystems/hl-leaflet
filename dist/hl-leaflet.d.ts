declare const mapCache: Record<string, HlMap>;
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
declare function els(nodes: NodeListOf<Element>): HTMLElement[];
declare function findMaps(): HlMap[];
declare function apply(map: HlMap): void;
