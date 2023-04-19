document.addEventListener("DOMContentLoaded", () => {
    const body = document.getElementsByTagName('body')[0];
    
    // Create the feature selector
    const featureSelector = document.createElement('select');
    featureSelector.setAttribute('id', 'feature-selector');
    body.appendChild(featureSelector);
    
    // Add options to the feature selector
    const features = ['accuracy', 'type'];
    features.forEach(feature => {
        const option = document.createElement('option');
        option.setAttribute('value', feature);
        if(feature == 'accuracy')option.textContent = 'Location Accuracy';
        if(feature == 'type')option.textContent = 'Type';
        featureSelector.appendChild(option);
    });

    // Create the scatter plot div
    const scatterPlotDiv = document.createElement('div');
    scatterPlotDiv.setAttribute('id', 'scatter-plot');
    scatterPlotDiv.setAttribute('style', 'width: 100%; height: 100vh;');
    body.appendChild(scatterPlotDiv);
  
    const API_URL = 'http://127.0.0.1:5000/api/v1.0/shipwreck';
  
    function updateScatterPlot(shipwrecksData) {
        const selectedFeature = featureSelector.value;

        // Filter the data for year_sunk > 0
        const filteredData = shipwrecksData.filter(d => d.year_sunk > 0);

        let trace;
        trace = [{
            x: filteredData.map(d => d.year_sunk),
            y: filteredData.map(d => d[selectedFeature]),
            text: filteredData.map(d => `Name: ${d.name}<br>Year Sunk: ${d.year_sunk}<br>Location: ${d.lng},${d.lat}<br>Type: ${d.type}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            textposition: 'bottom left',
        }];

        let title;
        let y_axis_title;
        if (selectedFeature === 'accuracy') {
            title = 'Shipwrecks: Location Accuracy vs Year Sunk';
            y_axis_title = 'Location Accuracy'
        } else {
            title = `Shipwrecks: ${selectedFeature.charAt(0).toUpperCase() + selectedFeature.slice(1)} vs Year Sunk`;
            y_axis_title = selectedFeature.charAt(0).toUpperCase() + selectedFeature.slice(1)
        }

        const layout = {
            title: title,
            xaxis: {title: {text: 'Year Sunk', standoff: 10}, automargin: true},
            yaxis: {title: y_axis_title},
            hovermode: 'closest',
        };
    
        Plotly.newPlot('scatter-plot', trace, layout);
    }
    
    // Use d3.json() to make a GET request to the Flask API
    d3.json(API_URL).then((shipwrecksData) => {
        // Call updateScatterPlot() with the shipwrecks data
        updateScatterPlot(shipwrecksData);
    
        // Add an event listener to the feature selector to call updateScatterPlot() with the updated feature
        featureSelector.addEventListener('change', () => {
            updateScatterPlot(shipwrecksData);
        });
    }).catch((error) => {
        console.log(error);
    });
})();
