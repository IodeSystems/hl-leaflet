// Fix utf-8 encoding issue
const encodings = require('iconv-lite/encodings');
const iconvLite = require('iconv-lite/lib');
iconvLite.getCodec('UTF-8');


import he from "he";
import express from 'express';
import puppeteer from "puppeteer";

// Fix puppeteer warning
process.env.PUPPETEER_DISABLE_HEADLESS_WARNING = "true";

const htmxServer = () => {
    const app = express();
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))
    app.get("/dist/:file", (req: express.Request, res: express.Response) => {
        res.header("Content-Type", "text/javascript")
        res.sendFile(`/dist/${req.params.file}`, {root: __dirname + "/../"})
    })
    const map = (props?: {
        center: number[],
        zoom: number,
    }) => {
        const center = props?.center || [-33.8650, 151.2094]
        const zoom = props?.zoom || 13

        // Generate 100 markers
        const markers = []
        for (let i = 0; i < 100; i++) {
            markers.push(`
                <div 
                    class="hl-marker"
                    data-hl-center="[${Math.random() * 180 - 90}, ${Math.random() * 360 - 180}]"
                    data-hl-popup="Marker ${i}"
                ></div>
            `)
        }

        return `
            <div 
                id="map-config"
                class="hl-map"
                hx-post="/map" 
                hx-trigger="click from:#map-reload"
                hx-swap="outerHTML"
                hx-vals=${JSON.stringify({center, zoom})}
                data-hl-render="#map-render"
                data-hl-center=${JSON.stringify(center)}
                data-hl-zoom="${zoom}"
            >
                <div 
                    class="hl-marker"
                    data-hl-center="[-33.8650, 151.2094]"
                    data-hl-popup="${he.encode(`
                        <button 
                            hx-trigger="click"
                            hx-swap="outerHTML"
                            hx-target="#map-config"
                            hx-vals=${JSON.stringify({center: [-34.58602826472734, -58.388420463492665], zoom: 13})}
                            hx-post="/map"
                        >Go To Argentinia</button>
                    `)}"
                ></div>
                ${markers.join("\n")}
            </div>
        `
    }

    app.post("/map", (req: express.Request, res: express.Response) => {
        res.send(map(req.body))
    })

    const head = `
        <head>
        <!-- htmx -->
        <script
                src="https://unpkg.com/htmx.org@1.9.9/dist/htmx.min.js"
                crossorigin="anonymous"
        ></script>
        <script
        src="https://unpkg.com/htmx.org@1.9.9/dist/ext/json-enc.js"
        crossorigin="anonymous"
        ></script>

        <!-- leaflet -->
        <script
                src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                crossorigin="anonymous"
        ></script>
        <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
                crossorigin="anonymous"
        />

        <!-- hl-leaflet -->
        <script src="/dist/hl-leaflet.umd.js"></script>

        </head>
    `

    app.get("/", (req: express.Request, res: express.Response) => {
        res.send(`
            <html>
            ${head}
            <body 
                hx-ext="json-enc"
                hx-boost
            >
                <h1>Hello World</h1>
                <a href="/goodbye">Goodbye</a>
                <button id="map-reload"
                >Reload Map</button>
                <button 
                    class="america"
                    hx-trigger="click"
                    hx-swap="outerHTML"
                    hx-target="#map-config"
                    hx-vals=${JSON.stringify({center: [40.7128, -74.0060], zoom: 10})}
                    hx-post="/map"
                    >Go To America</button>
                <div id="map-render"
                    style="height: 600px;"
                    hx-on:hl-leaflet-moveend="htmx.find('#map-config').setAttribute('hx-vals',JSON.stringify(event.detail))"
                    hx-on:hl-leaflet-popupopen="htmx.process(event.detail.popup); console.log(event.detail.popup)"
                    ></div>
                    
                ${map()}
            </body>
            </html>
        `);
    })
    app.get("/goodbye", (req: express.Request, res: express.Response) => {
        res.send(`
            <html>
            ${head}
            <body 
                hx-ext="json-enc"
                hx-boost
            >
                <h1>Goodbye, Cruel World</h1>
                <a href="/">Hello</a>
                <button id="map-reload"
                >Reload Map</button>
                <button 
                    hx-trigger="click"
                    hx-swap="outerHTML"
                    hx-target="#map-config"
                    hx-vals=${JSON.stringify({center: [40.7128, -74.0060], zoom: 10})}
                    hx-post="/map"
                    >Go To America</button>
                <div id="map-render"
                    style="height: 600px;"
                    hx-on:hl-leaflet-moveend="htmx.find('#map-config').setAttribute('hx-vals',JSON.stringify(event.detail))"></div>
                ${map()}
            </body>
            </html>
        `);
    })

    const server = app.listen(0);
    const addr = server.address();
    let port = 0

    if (!addr || typeof addr === "string") {
        throw new Error("server address not found");
    } else {
        port = addr.port
    }

    return {server, url: `http://localhost:${port}/`}
}


describe("index", () => {
    it("sanity", () => {
        expect(1).toBe(1);
    });

    it("complex-htmx", async () => {
        const htmx = htmxServer()
        const browser = await puppeteer.launch(
            {
                headless: true,
                devtools: false,
            }
        )

        const page = await browser.newPage();
        await page.setViewport({width: 1000, height: 1000})
        await page.goto(htmx.url);
        await page.waitForSelector("h1");
        const text = await page.evaluate(() => document.querySelector("h1")?.textContent);
        expect(text).toBe("Hello World");

        // Expect the vals to be the same as the initial vals
        let vals = await page.evaluate(() => {
            const map = document.querySelector("#map-config")
            return map?.getAttribute("hx-vals")
        })
        expect(vals).toBe(JSON.stringify({center: [-33.8650, 151.2094], zoom: 13}))

        // Click the marker
        await page.click(".leaflet-marker-icon")
        await page.waitForSelector(".leaflet-popup-content button");
        await page.click(".leaflet-popup-content button")
        vals = await page.evaluate(() => {
            const map = document.querySelector("#map-config")
            return map?.getAttribute("hx-vals")
        })
        expect(vals).toBe(JSON.stringify({center: [-34.58602826472734, -58.388420463492665], zoom: 13}))


        // Click the button to go to America
        await page.click("button.america")
        // wait for 50ms for the map to load
        await page.waitForTimeout(50)
        vals = await page.evaluate(() => {
            const map = document.querySelector("#map-config")
            return map?.getAttribute("hx-vals")
        })
        expect(vals).toBe(JSON.stringify({center: [40.7128, -74.0060], zoom: 10}))

        // Pan the map
        await page.mouse.move(500, 500)
        await page.mouse.down()
        await page.mouse.move(600, 600)
        await page.mouse.up()
        vals = await page.evaluate(() => {
            const map = document.querySelector("#map-config")
            return map?.getAttribute("hx-vals")
        })
        expect(vals).toBe(JSON.stringify({center: [40.81692723191517, -74.14398193359376], zoom: 10}))

        // Click goodbye
        await page.click("a")
        await page.waitForSelector("h1");
        const text2 = await page.evaluate(() => document.querySelector("h1")?.textContent);
        expect(text2).toBe("Goodbye, Cruel World");

        // Expect the map to be the same as before
        vals = await page.evaluate(() => {
            const map = document.querySelector("#map-config")
            return map?.getAttribute("hx-vals")
        })
        expect(vals).toBe(JSON.stringify({center: [-33.8650, 151.2094], zoom: 13}))

        await browser.close();
        htmx.server.close();
    });
})
