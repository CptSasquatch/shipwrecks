// create the icon variable
var wreckIcon
var wreckType
// declare number of wrecks variable
var numWrecks
// create a function that returns the correct icon for the wreck type
function getIcon(wreckType) {
    // create a switch statement that will return the correct icon for the wreck type
    switch (wreckType) {
        case "Not Charted":
            wreckIcon = L.icon({
                iconUrl: "static/images/marker_uncharted.svg",
                iconSize: [70, 70],
                iconAnchor: [35, 70],
                popupAnchor: [0, -70]
            });
            return wreckIcon;
        case "Wreck - Submerged, dangerous to surface navigation":
            wreckIcon = L.icon({
                iconUrl: "static/images/marker_danger.svg",
                iconSize: [70, 70],
                iconAnchor: [35, 70],
                popupAnchor: [0, -70]
            });
            return wreckIcon;
        case "Wreck - Submerged, nondangerous":
            wreckIcon = L.icon({
                iconUrl: "static/images/marker_safe.svg",
                iconSize: [70, 70],
                iconAnchor: [35, 70],
                popupAnchor: [0, -70]
            });
            return wreckIcon;
        case "Wreck - Visible":
            wreckIcon = L.icon({
                iconUrl: "static/images/marker_vis.svg",
                iconSize: [70, 70],
                iconAnchor: [35, 70],
                popupAnchor: [0, -70]
            });
            return wreckIcon;
    }
}
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
    layers: [street]
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
// create an array to populate the dropdown menu
var amounts = ['--Select Amount--', 50, 200, 350, 500, 650, 800, 950, 1100, 1350, 1500];
// create a function to set number of wrecks to display
function setNumWrecks() {
    var dropdownMenu = L.DomUtil.create("select", "dropdown");
    dropdownMenu.id = "wreckNum";
    // set the default number of wrecks to display
    numWrecks = 50;
    // on initial load, create the map with the default number of wrecks
    createMap();
    dropdownMenu.onchange = function () {
        numWrecks = dropdownMenu.value;
        createMap();
        button.state('remove-wrecks');
    };
    amounts.forEach(function (amount) {
        var option = L.DomUtil.create("option", "option");
        option.value = amount;
        option.innerHTML = amount;
        dropdownMenu.appendChild(option);
    });
    L.DomUtil.get("map").appendChild(dropdownMenu);
    // set the default number of wrecks to display

}
setNumWrecks();
// allow the user to set the number of wrecks to display

// create a function that produces a map that shows a random selection of 150 shipwrecks
function createMap() {
    // import the data from the json file
    d3.json("static/data/shipwreck.json").then(function (wreckData) {
        // create a variable that is a random number between 0 and the length of the wreck data minus variable value
        let randNum = wreckData.sort(function () { return 0.5 - Math.random() }).slice(0, numWrecks);
        // create a layer group for the wrecks
        let wrecks = L.layerGroup();
        // loop through the wreck locations and add a marker to the layer group
        randNum.forEach(function (location) {
            // call the getIcon function to get the correct icon for the wreck type
            wreckIcon = getIcon(location.type);
            // add a marker to the layer group
            wrecks.addLayer(L.marker(location, {icon:wreckIcon}).bindPopup(`<h3>Name: ${location.name}</h3><hr><p>Type: ${location.type}<br><br>History: ${location.history}</p>`));
        }
        );                
        // add the layer group to the map
        wrecks.addTo(map);
        // add an event listener that will add a marker of the closest wreck to the map where the map is clicked
        map.on('click', function (e) {
            // create a variable that is the lat and long of the click and convert it to a turf point   
            let clickLocation = turf.point([e.latlng.lng, e.latlng.lat]);
            // create a variable that is an array of the lat and long of the shipwrecks in geojson format
            let wreckLocations = wreckData.map(wreck => turf.point([wreck.lng, wreck.lat]));
            // create a variable that is a feature collection of the wreck locations
            let wreckCollection = turf.featureCollection(wreckLocations);
            // create a variable that is the closest wreck to the click location
            let closestWreck = turf.nearestPoint(clickLocation, wreckCollection);
            // find the wreck in the wreck data that matches the closest wreck
            let wreck = wreckData.find(wreck => wreck.lat === closestWreck.geometry.coordinates[1] && wreck.lng === closestWreck.geometry.coordinates[0]);
            // call the getIcon function to get the correct icon for the wreck type
            wreckIcon = getIcon(wreck.type);
            // use the wreck data to create a marker for the closest wreck
            let wreckMarker = L.marker([wreck.lat, wreck.lng], {icon:wreckIcon}).bindPopup(`<h3>Name: ${wreck.name}</h3><hr><p>Type: ${wreck.type}<br><br>History: ${wreck.history}</p>`);
            // add the marker to the map
            wreckMarker.addTo(map);
        });
    });
}
// add a button to the map that will call the createMap function
let button = L.easyButton({
    states: [
    {
        stateName: 'remove-wrecks',
        icon: 'fa-trash',
        title: 'Remove Shipwrecks',
        onClick: function (btn, map) {
            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            btn.state('add-wrecks');
        }
    },
    {
        stateName: 'add-wrecks',
        icon: 'fa-sailboat',
        title: 'Add Shipwrecks',
        onClick: function (btn, map) {
            createMap();
            btn.state('remove-wrecks');
        }
    }]
});
button.addTo(map);
// add a button to reveal the heatmap
let heatmapButton = L.easyButton({
    // make the background of the button green when user hovers over it
    buttonStyle: {
        'background-color': 'green'
    },
    states: [{
        stateName: 'add-heatmap',
        icon: 'fa-pepper-hot',
        title: 'Add Heatmap',
        onClick: function (btn, map) {
            createHeatmap();
            btn.state('remove-heatmap');
        }
    },
    {
        stateName: 'remove-heatmap',
        icon: 'fa-trash',
        title: 'Remove Heatmap',
        onClick: function (btn, map) {
            map.eachLayer(function (layer) {
                if (layer instanceof L.HeatLayer) {
                    map.removeLayer(layer);
                }
            });
            btn.state('add-heatmap');
        }
    }]
});
heatmapButton.addTo(map);