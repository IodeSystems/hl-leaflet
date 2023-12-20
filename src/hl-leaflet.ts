import L, {LatLngTuple} from "leaflet"

const mapCache = {} as Record<string, HlMap>

type HlMapConfig = {
    hlRender: string,
    hlCenter: LatLngTuple,
    hlZoom: number,
    hlPreserve: boolean,
    markers: HlMarkerConfig[]
}

type HlMarkerConfig = {
    hlCenter?: LatLngTuple,
    hlPopup?: string,
}

type HlMap = {
    config: HlMapConfig
    configElement: HTMLElement,
    renderElement: HTMLElement | null,
    map?: L.Map,
    configString?: string,
}

export type HlMapMoveEndEvent = {
    center: LatLngTuple,
    zoom: number,
    bounds: LatLngTuple[]
}

export type HlPopupOpenEvent = {
    popup: HTMLElement
}

function moveEvent(map:L.Map) {
    const center = map.getCenter()
    const zoom = map.getZoom()
    const nw = map.getBounds().getNorthWest()
    const se = map.getBounds().getSouthEast()
    const bounds: LatLngTuple[] = [[nw.lat, nw.lng], [se.lat, se.lng]]
    const event: HlMapMoveEndEvent = {
        center: [center.lat, center.lng],
        zoom: zoom,
        bounds: bounds
    }
    return new CustomEvent("hl-leaflet-moveend", {
        detail: event
    })
}

function els(nodes: NodeListOf<Element>): HTMLElement[] {
    return Array.prototype.slice.call(nodes)
}

function findMaps(): HlMap[] {
    const maps = els(document.body.querySelectorAll(".hl-map"))
    return maps.map((map) => {
        const dataset = map.dataset

        // Basic config
        const data: HlMapConfig = {
            hlRender: dataset.hlRender ?? "",
            hlCenter: JSON.parse(dataset.hlCenter ?? "[0,0]"),
            hlZoom: JSON.parse(dataset.hlZoom ?? "10"),
            hlPreserve: JSON.parse(dataset.hlPreserve ?? "false"),
            markers: [] as HlMarkerConfig[]
        }

        // Detect markers
        els(map.querySelectorAll(".hl-marker")).forEach((marker) => {
            const markerData = marker.dataset
            data.markers.push({
                hlCenter: JSON.parse(markerData.hlCenter ?? "[0,0]"),
                hlPopup: markerData.hlPopup
            })
        })

        return {
            config: data,
            configElement: map,
            renderElement: document.querySelector(data.hlRender)
        }
    })
}


function apply(
    map: HlMap,
) {
    const lMap = map.map
    if (lMap === undefined) return
    const center = map.config.hlCenter
    const zoom = map.config.hlZoom

    lMap.setView(center, zoom)

    // Layers
    const hasLayer = lMap.options.layers?.find((layer) =>
        layer.options.attribution === "© OpenStreetMap contributors"
    )
    if (!hasLayer) L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(lMap);


    // Remove layers
    lMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            layer.removeFrom(lMap)
        }
    })

    // Markers
    map.config.markers.forEach((marker) => {
        const center = marker.hlCenter ?? map.config.hlCenter
        const popup = marker.hlPopup ?? ""
        const markerLayer = L.marker(center)
        markerLayer.setIcon(L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        }))
        if (popup !== "") markerLayer.bindPopup(popup)
        markerLayer.addTo(lMap)
    })
}

function initMaps(maps: HlMap[]) {
    maps.forEach((map) => {
        const {configElement, renderElement, config} = map
        if (renderElement === null) return
        const lMap = L.map(renderElement)
        map.map = lMap
        apply(map)
        mapCache[configElement.id] = {
            ...map,
            configString: JSON.stringify(config),
        }

        // Bind events
        lMap.on("moveend", () => {
            renderElement.dispatchEvent(moveEvent(lMap))
        })

        lMap.on("popupopen", (e) => {
            const popupEvent: HlPopupOpenEvent = {
                popup: e.popup.getElement()!!
            }
            const event = new CustomEvent("hl-leaflet-popupopen", {
                detail: popupEvent
            })
            renderElement.dispatchEvent(event)
        })

        // Fire initial moveend event
        renderElement.dispatchEvent(moveEvent(lMap))
    })
}

function updateMaps(maps: HlMap[]) {
    maps.forEach((map) => {
        const cached = mapCache[map.configElement.id]
        if (cached === undefined) return
        const {map: lMap} = cached
        if (lMap === undefined) return
        const configString = JSON.stringify(map.config)
        if (configString == cached.configString) return
        cached.config = map.config
        cached.configString = configString
        apply(cached)
    })
}


window.addEventListener("load", () => {
    const maps = findMaps()
    initMaps(maps)
    const observer = new MutationObserver(() => updateMaps(findMaps()))
    observer.observe(document.body, {
        subtree: true,
        // Mutation observer does not fire on new attributes! The only way to detect
        // new attributes is to observe the whole childList.
        childList: true,
        // We only care about these attributes currently
        attributes: true,
        attributeFilter: [
            "data-hl-center",
            "data-hl-zoom",
            "data-hl-render",
            "data-hl-popup"
        ]
    })
})

/**
 * Synchronize a maps center, zoom and bounds with the given values
 */
function syncMove(element: HTMLElement, event: HlMapMoveEndEvent) {
    // Update the element
    element.setAttribute("data-hl-center", JSON.stringify(event.center))
    element.setAttribute("data-hl-zoom", JSON.stringify(event.zoom))
    element.setAttribute("data-hl-bounds", JSON.stringify(event.bounds))
    // Update the cache
    const cache = mapCache[element.id]
    if (cache === undefined) return
    cache.config = {
        ...cache.config,
        hlCenter: event.center,
        hlZoom: event.zoom
    }
    cache.configString = JSON.stringify(cache.config)
}

export default {
    findMaps,
    initMaps,
    updateMaps,
    mapCache,
    apply,
    syncMove
}
