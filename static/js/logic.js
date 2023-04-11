let satellite = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
// create the map object with a center and zoom level
let map = L.map('map', {
    center: [39.5, -98.5],
    zoom: 4,
    layers: [satellite]
});
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
            wrecks.addLayer(L.marker(location).bindPopup(`<h3>${location.name}</h3><hr><p>Lat: ${location.lat}<br>Lng: ${location.lng}</p>`));
        }
        );
        // add the layer group to the map
        wrecks.addTo(map);

    });
}
// add a button to the map that will call the createMap function
let button = L.easyButton({
    states: [{
        stateName: 'add-wrecks',
        icon: 'fa-ship',
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









