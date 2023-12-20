import L from "leaflet"

const mapCache = {} as Record<string, HlMap>

type HlMapConfig = {
    hlRender: string,
    hlCenter: string,
    hlZoom: string,
    markers: HlMarkerConfig[]
}

type HlMarkerConfig = {
    hlCenter?: string,
    hlPopup?: string,
}

type HlMap = {
    config: HlMapConfig
    configElement: HTMLElement,
    renderElement: HTMLElement | null,
    map?: L.Map,
    configString?: string,
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
            hlCenter: dataset.hlCenter ?? "[0,0]",
            hlZoom: dataset.hlZoom ?? "10",
            markers: [] as HlMarkerConfig[]
        }

        // Detect markers
        els(map.querySelectorAll(".hl-marker")).forEach((marker) => {
            const markerData = marker.dataset as HlMarkerConfig
            data.markers.push({
                hlCenter: markerData.hlCenter,
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

    lMap.setView(JSON.parse(center), parseInt(zoom))

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
        const markerLayer = L.marker(JSON.parse(center))
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
            const center = lMap.getCenter()
            const zoom = lMap.getZoom()
            const event = new CustomEvent("hl-leaflet-moveend", {
                detail: {
                    center: [center.lat, center.lng],
                    zoom: zoom
                }
            })
            renderElement.dispatchEvent(event)
        })

        lMap.on("popupopen", (e) => {
            const event = new CustomEvent("hl-leaflet-popupopen", {
                detail: {
                    popup: e.popup.getElement()
                }
            })
            renderElement.dispatchEvent(event)
        })
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
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: [
            "data-hl-center",
            "data-hl-zoom",
            "data-hl-render",
            "data-hl-popup"
        ]
    })
})

export default {
    findMaps,
    initMaps,
    updateMaps,
    mapCache,
    apply
}
