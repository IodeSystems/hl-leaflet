function e(){return e=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o])}return e},e.apply(this,arguments)}const n={};function t(e){return Array.prototype.slice.call(e)}function o(){return t(document.body.querySelectorAll(".hl-map")).map(e=>{var n,o,r;const i=e.dataset,l={hlRender:null!=(n=i.hlRender)?n:"",hlCenter:null!=(o=i.hlCenter)?o:"[0,0]",hlZoom:null!=(r=i.hlZoom)?r:"10",markers:[]};return t(e.querySelectorAll(".hl-marker")).forEach(e=>{const n=e.dataset;l.markers.push({hlCenter:n.hlCenter,hlPopup:n.hlPopup})}),{config:l,configElement:e,renderElement:document.querySelector(l.hlRender)}})}function r(e){var n;const t=e.map;if(void 0===t)return;const o=e.config.hlZoom;t.setView(JSON.parse(e.config.hlCenter),parseInt(o)),(null==(n=t.options.layers)?void 0:n.find(e=>"© OpenStreetMap contributors"===e.options.attribution))||L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(t),t.eachLayer(e=>{e instanceof L.Marker&&e.removeFrom(t)}),e.config.markers.forEach(n=>{var o,r;const i=null!=(o=n.hlCenter)?o:e.config.hlCenter,l=null!=(r=n.hlPopup)?r:"",c=L.marker(JSON.parse(i));c.setIcon(L.icon({iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34]})),""!==l&&c.bindPopup(l),c.addTo(t)})}window.addEventListener("load",()=>{o().forEach(t=>{const{configElement:o,renderElement:i,config:l}=t;if(null===i)return;const c=L.map(i);t.map=c,r(t),n[o.id]=e({},t,{configString:JSON.stringify(l)}),c.on("moveend",()=>{const e=c.getCenter(),n=c.getZoom(),t=new CustomEvent("hl-leaflet-moveend",{detail:{center:[e.lat,e.lng],zoom:n}});i.dispatchEvent(t)}),c.on("popupopen",e=>{const n=new CustomEvent("hl-leaflet-popupopen",{detail:{popup:e.popup.getElement()}});i.dispatchEvent(n)})}),new MutationObserver(()=>{o().forEach(e=>{const t=n[e.configElement.id];if(void 0===t)return;const{map:o}=t;if(void 0===o)return;const i=JSON.stringify(e.config);i!=t.configString&&(t.config=e.config,t.configString=i,r(t))})}).observe(document.body,{childList:!0,subtree:!0})});
//# sourceMappingURL=hl-leaflet.modern.mjs.map
