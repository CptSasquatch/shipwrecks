// create the icons
let myIcon = L.icon({
    iconUrl: 'static/images/shipwreck_yellow.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
});
// create the tile layers that will be the background of the map
let satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let black = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});
// create the map object with a center and zoom level
let map = L.map('map', {
    center: [39.5, -98.5],
    zoom: 4,
    layers: [satellite]
});
// create a base layer that holds the maps
let baseMaps = {
    "Satellite": satellite,
    "Street": street,
    "Black": black
};
// create the layer control
L.control.layers(baseMaps).addTo(map);
// add scale to the map
L.control.scale().addTo(map);
// add mouse position to the map
L.Control.MousePosition = L.Control.extend({
    options: {
      text: '#fff',
      position: 'bottomleft',
      separator: ' : ',
      emptyString: 'Unavailable',
      lngFirst: false,
      numDigits: 5,
      lngFormatter: undefined,
      latFormatter: undefined,
      prefix: ""
    },
  
    onAdd: function (map) {
      this._container = L.DomUtil.create('div', 'leaflet-control-mouseposition');
      L.DomEvent.disableClickPropagation(this._container);
      map.on('mousemove', this._onMouseMove, this);
      this._container.innerHTML=this.options.emptyString;
      return this._container;
    },
  
    onRemove: function (map) {
      map.off('mousemove', this._onMouseMove)
    },
  
    _onMouseMove: function (e) {
      var lng = this.options.lngFormatter ? this.options.lngFormatter(e.latlng.lng) : L.Util.formatNum(e.latlng.lng, this.options.numDigits);
      var lat = this.options.latFormatter ? this.options.latFormatter(e.latlng.lat) : L.Util.formatNum(e.latlng.lat, this.options.numDigits);
      var value = this.options.lngFirst ? lng + this.options.separator + lat : lat + this.options.separator + lng;
      var prefixAndValue = this.options.prefix + ' ' + value;
      this._container.innerHTML = prefixAndValue;
    }
  
  });
  
  L.Map.mergeOptions({
      positionControl: false
  });
  
  L.Map.addInitHook(function () {
      if (this.options.positionControl) {
          this.positionControl = new L.Control.MousePosition();
          this.addControl(this.positionControl);
      }
  });
  
  L.control.mousePosition = function (options) {
      return new L.Control.MousePosition(options);
  };
L.control.mousePosition().addTo(map);

// create a function to add a heatmap layer to the map
function createHeatmap() {
    // import the data from the json file
    d3.json("static/data/shipwreck.json").then(function (wreckData) {
        // create a variable that is an array of the lat and long of the shipwrecks
        let wreckLocations = wreckData.map(wreck => [wreck.lat, wreck.lng]);
        // create a variable that is a heat layer with the wreck locations
        let heat = L.heatLayer(wreckLocations, {
            radius: 20,
            blur: 25,
            useLocalExtrema: true,
            minOpacity: 0.5
        });
        // add the heat layer to the map
        heat.addTo(map);
    });
}
// create a function to select a random wreck from the data
function selectRandom(array) {
    // create a variable that is a random number between 0 and the length of the wreck data
    let randomWreck = Math.floor(Math.random() * wreckData.length);
    // create a variable that is the wreck data at the random index
    let yourWreck = wreckData[randomWreck];
    // create a variable that is the lat and long of the wreck
    let wreckLocation = [yourWreck.lat, yourWreck.lng];
    return wreckLocation;
}
// create a function that produces a map that shows a random selection of 150 shipwrecks
function createMap() {
    // import the data from the json file
    d3.json("static/data/shipwreck.json").then(function (wreckData) {
        // create a variable that is a random number between 0 and the length of the wreck data minus 150
        let randNum = wreckData.sort(function () { return 0.5 - Math.random() }).slice(0, 50);
        // create a layer group for the wrecks
        let wrecks = L.layerGroup();
        // loop through the wreck locations and add a marker to the layer group
        randNum.forEach(function (location) {
            wrecks.addLayer(L.marker(location, {icon:myIcon}).bindPopup(`<h3>Name: ${location.name}</h3><hr><p>Type: ${location.type}<br><br>History: ${location.history}</p>`));
        }
        );
        // add the layer group to the map
        wrecks.addTo(map);
        // add a mouse click event that returns the lat and long of the click
        map.on('click', function (e) {
        // create a variable that is the lat and long of the click
        let clickLocation = [e.latlng.lat, e.latlng.lng];
        // find the closest wreck to the click
        let closestWreck = findClosestWreck(clickLocation, wreckData);
        // add marker to the map at the closest wreck
        L.marker(closestWreck, {icon:myIcon}).addTo(map).bindPopup(`<h3>Name: ${closestWreck.name}</h3><hr><p>Type: ${closestWreck.type}<br><br>History: ${closestWreck.history}</p>`);
    });
    });
}
// create a function that finds the closest wreck to the click
function findClosestWreck(clickLocation, wreckData) {
    // convert the wreck data to geojson
    let wreckGeojson = turf.featureCollection(wreckData);
    // create a variable that is the click location converted to geojson
    let clickGeojson = turf.point(clickLocation);
    // create a variable that is the closest wreck to the click
    let closestWreck = turf.nearestPoint(clickGeojson, wreckGeojson);
    // return the closest wreck
    return closestWreck;
}

// add a button to the map that will call the createMap function
let button = L.easyButton({
    states: [{
        stateName: 'add-wrecks',
        icon: 'myIcon',
        title: 'Add Shipwrecks',
        onClick: function (btn, map) {
            createMap();
        }
    }]
});
button.addTo(map);
// add a button to remove the wrecks from the map
let removeButton = L.easyButton({
    states: [{
        stateName: 'remove-wrecks',
        icon: 'fa-trash',
        title: 'Remove Shipwrecks',
        onClick: function (btn, map) {
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
        }
    }]
});
removeButton.addTo(map);
// add a button to reveal the heatmap
let heatmapButton = L.easyButton({
    states: [{
        stateName: 'add-heatmap',
        icon: 'fa-fire',
        title: 'Add Heatmap',
        onClick: function (btn, map) {
            createHeatmap();
        }
    }]
});
heatmapButton.addTo(map);
// add a button to remove the heatmap
let removeHeatmapButton = L.easyButton({
    states: [{
        stateName: 'remove-heatmap',
        icon: 'fa-trash',
        title: 'Remove Heatmap',
        onClick: function (btn, map) {
            map.eachLayer(function (layer) {
                if (layer instanceof L.HeatLayer) {
                    map.removeLayer(layer);
                }
            });
        }
    }]
});
removeHeatmapButton.addTo(map);









