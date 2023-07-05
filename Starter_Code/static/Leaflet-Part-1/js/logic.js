// Create initial tile layers, a layerGroup for the earthquakes and a layer control
// Create the base layers.
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Create a baseMaps object.
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};

// Create an empty (new) leaflet layerGroup for earthquakes.
let earthquakes = new L.LayerGroup();

// Create an overlay object to hold our overlay.
let overlayMaps = {
    Earthquakes: earthquakes
};

// Create our map, giving it the streetmap and earthquakes layers to display on load.
let myMap = L.map("map", {
    center: [
        37.09, -95.71
    ],
    zoom: 3.5,
    layers: [street, earthquakes]
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);

// Get earthquake data from USGS
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson"

// Perform a d3.json AJAX request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    //createFeatures(data.features);
    console.log(data.features[0]);

    // Create function for markerSize
    function markerSize(magnitude) {
        return magnitude * 4
    }

    // create a function for markerColor using depth(km)
    function markerColor(depth) {
        return depth > 150 ? '#d73027' :
            depth > 100 ? '#f46d43' :
                depth > 50 ? '#fdae61' :
                    depth > 25 ? '#fee08b' :
                        depth > 10 ? '#d9ef8b' :
                            depth > 5 ? '#a6d96a' :
                                depth > 2 ? '#66bd63' :
                                    '#1a9850';

    }

    // Create a GeoJSON layer using data
    function styleInfo(feature) {
        return {
            radius: markerSize(feature.properties.mag),
            fillColor: markerColor(feature.geometry.coordinates[2]),
            color: "black",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.7
        };
    }

    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },

        // Use styleInfo to define circleMarker style
        style: styleInfo,

        // Use onEachFeature to add a popup with location, time and magnitude and depth
        onEachFeature: function onEachFeature(feature, layer) {
            layer.bindPopup(`
            <h3>${feature.properties.place}</h3>
            <hr>
            <p>${new Date(feature.properties.time)}</p>
            <h3>Magnitude:${feature.properties.mag.toLocaleString()}</h3>
            <h3>Depth:${feature.geometry.coordinates[2].toLocaleString()}</h3>
              `);
        }
    }).addTo(earthquakes);

    // Add legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        let div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 2, 5, 10, 25, 50, 100, 150],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        div.innerHTML += 'Depth(km) <br>'
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

    // Info control
    var info = L.control();

    info.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>USGS Live Earthquake Feed For 7 days </h4>' + 
        'Circle Radius is a function of Magnitude'+
        '<br>'+
        'Circle color is a function of Depth';
    };

    info.addTo(myMap);







});