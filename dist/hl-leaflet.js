function e(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var t=/*#__PURE__*/e(require("leaflet"));function n(){return n=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},n.apply(this,arguments)}var o={};function r(e){var t=e.getCenter(),n=e.getZoom(),o=e.getBounds().getNorthWest(),r=e.getBounds().getSouthEast();return new CustomEvent("hl-leaflet-moveend",{detail:{center:[t.lat,t.lng],zoom:n,bounds:[[o.lat,o.lng],[r.lat,r.lng]]}})}function i(e){return Array.prototype.slice.call(e)}function a(){return i(document.body.querySelectorAll(".hl-map")).map(function(e){var t,n,o,r,a=e.dataset,l={hlRender:null!=(t=a.hlRender)?t:"",hlCenter:JSON.parse(null!=(n=a.hlCenter)?n:"[0,0]"),hlZoom:JSON.parse(null!=(o=a.hlZoom)?o:"10"),hlPreserve:JSON.parse(null!=(r=a.hlPreserve)?r:"false"),markers:[]};return i(e.querySelectorAll(".hl-marker")).forEach(function(e){var t,n=e.dataset;l.markers.push({hlCenter:JSON.parse(null!=(t=n.hlCenter)?t:"[0,0]"),hlPopup:n.hlPopup})}),{config:l,configElement:e,renderElement:document.querySelector(l.hlRender)}})}function l(e){var n,o=e.map;void 0!==o&&(o.setView(e.config.hlCenter,e.config.hlZoom),(null==(n=o.options.layers)?void 0:n.find(function(e){return"© OpenStreetMap contributors"===e.options.attribution}))||t.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(o),o.eachLayer(function(e){e instanceof t.default.Marker&&e.removeFrom(o)}),e.config.markers.forEach(function(n){var r,i,a=null!=(r=n.hlCenter)?r:e.config.hlCenter,l=null!=(i=n.hlPopup)?i:"",u=t.default.marker(a);u.setIcon(t.default.icon({iconUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34]})),""!==l&&u.bindPopup(l),u.addTo(o)}))}function u(e){e.forEach(function(e){var i=e.configElement,a=e.renderElement,u=e.config;if(null!==a){var c=t.default.map(a);e.map=c,l(e),o[i.id]=n({},e,{configString:JSON.stringify(u)}),c.on("moveend",function(){a.dispatchEvent(r(c))}),c.on("popupopen",function(e){var t={popup:e.popup.getElement()},n=new CustomEvent("hl-leaflet-popupopen",{detail:t});a.dispatchEvent(n)}),a.dispatchEvent(r(c))}})}function c(e){e.forEach(function(e){var t=o[e.configElement.id];if(void 0!==t&&void 0!==t.map){var n=JSON.stringify(e.config);n!=t.configString&&(t.config=e.config,t.configString=n,l(t))}})}window.addEventListener("load",function(){u(a()),new MutationObserver(function(){return c(a())}).observe(document.body,{subtree:!0,childList:!0,attributes:!0,attributeFilter:["data-hl-center","data-hl-zoom","data-hl-render","data-hl-popup"]})}),module.exports={findMaps:a,initMaps:u,updateMaps:c,mapCache:o,apply:l,syncMove:function(e,t){e.setAttribute("data-hl-center",JSON.stringify(t.center)),e.setAttribute("data-hl-zoom",JSON.stringify(t.zoom)),e.setAttribute("data-hl-bounds",JSON.stringify(t.bounds));var r=o[e.id];void 0!==r&&(r.config=n({},r.config,{hlCenter:t.center,hlZoom:t.zoom}),r.configString=JSON.stringify(r.config))}};
//# sourceMappingURL=hl-leaflet.js.map
