// shipwrecks in north america plots 
// add endpoints for the different api calls
const yearsunk_url = "http://127.0.0.1:5000/api/v1.0/year_sunk";
const shipwrecks_url = "http://127.0.0.1:5000/api/v1.0/shipwreck";
const danger_url = "http://127.0.0.1:5000/api/v1.0/shipwreck/Wreck%20-%20Submerged,%20dangerous%20to%20surface%20navigation";
const safe_url = "http://127.0.0.1:5000/api/v1.0/shipwreck/Wreck%20-%20Submerged,%20nondangerous";
const visible_url = "http://127.0.0.1:5000/api/v1.0/shipwreck/Wreck%20-%20Visible";
const uncharted_url = "http://127.0.0.1:5000/api/v1.0/shipwreck/Not%20Charted";
const poor_url = "http://127.0.0.1:5000/api/v1.0/accuracy/Poor";
const low_url = "http://127.0.0.1:5000/api/v1.0/accuracy/Low";
const medium_url = "http://127.0.0.1:5000/api/v1.0/accuracy/Med";
const high_url = "http://127.0.0.1:5000/api/v1.0/accuracy/High";
// create a function to get the data
var wreckdata;
d3.json(shipwrecks_url).then(function(data) {
    wreckdata = data;
    init();
});
// create a function to build the plots
function buildPlots(wreckdata) {
    // select the div to put the plot in
    var div = d3.select("#plot");
    // clear the div
    div.html("");
    // filter the data based on the value of the dropdown
    var dropdownMenu = d3.select("#selDataset");
    var dataset = dropdownMenu.property("value");
    var filteredData = wreckdata.filter(wreck => wreck.accuracy === dataset);
    // use the filtered data to build bar chart of types of wrecks
    var wrecktype = filteredData.map(wreck => wreck.type);
    // adjust the wreck type to make it more readable
    wrecktype = wrecktype.map(wreck => wreck.replace("Wreck - ", ""));
    wrecktype = wrecktype.map(wreck => wreck.replace("to surface navigation", ""));
    var wreckcount = wrecktype.reduce(function (acc, curr) {
        if (typeof acc[curr] == 'undefined') {
            acc[curr] = 1;
        } else {
            acc[curr] += 1;
        }
        return acc;
    }
    , {});
    var wrecktype = Object.keys(wreckcount);
    var wreckcount = Object.values(wreckcount);
    var trace1 = {
        x: wrecktype,
        y: wreckcount,
        type: "bar"
    };
    var data = [trace1];
    var layout = {
        title: "Wreck Type",
        xaxis: { title: "Wreck Type" },
        yaxis: { title: "Count" }
    };
    Plotly.newPlot("plot", data, layout);
    // use the filtered data to build a pie chart of the shipwrecks by type
    var wrecktype = filteredData.map(wreck => wreck.type);
    // adjust the wreck type to make it more readable
    wrecktype = wrecktype.map(wreck => wreck.replace("Wreck - ", ""));
    wrecktype = wrecktype.map(wreck => wreck.replace("to surface navigation", ""));
    var wreckcount = wrecktype.reduce(function (acc, curr) {
        if (typeof acc[curr] == 'undefined') {
            acc[curr] = 1;
        } else {
            acc[curr] += 1;
        }
        return acc;
    }
    , {});
    var wrecktype = Object.keys(wreckcount);
    var wreckcount = Object.values(wreckcount);
    var trace2 = {
        values: wreckcount,
        labels: wrecktype,
        type: "pie"
    };
    var data = [trace2];
    var layout = {
        title: "Wreck Type"
    };
    Plotly.newPlot("plot2", data, layout);
    // use the filtered data to build a line chart of the amount of wrecks per year
    // get the years if the year_sunk is greater than 0
    var yearsunk = filteredData.map(wreck => wreck.year_sunk);
    yearsunk = yearsunk.filter(year => year > 0);
    // get the count of wrecks per year
    var yearcount = yearsunk.reduce(function (acc, curr) {
        if (typeof acc[curr] == 'undefined') {
            acc[curr] = 1;
        } else {
            acc[curr] += 1;
        }
        return acc;
    }
    , {});
    var yearsunk = Object.keys(yearcount);
    var yearcount = Object.values(yearcount);
    var trace3 = {
        x: yearsunk,
        y: yearcount,
        type: "line"
    };
    var data = [trace3];
    var layout = {
        title: "Wrecks per Year",
        xaxis: { title: "Year" },
        yaxis: { title: "Count" }
    };
    Plotly.newPlot("plot3", data, layout);
};
// create a function to initialize the page
function init() {
    // create a dropdown menu of the accuracy options
    var dropdownMenu = d3.select("#selDataset");
    var accuracy = ["Poor", "Low", "Med", "High"];
    accuracy.forEach((acc) => {
        dropdownMenu
            .append("option")
            .text(acc)
            .property("value", acc);
    });
    dropdownMenu.property("value", "Low");
    // create the initial plots
    buildPlots(wreckdata);
    console.log("eat my shorts!!");
};
// create a function to update the plots when the dropdown menu is changed
function optionChanged() {
    buildPlots(wreckdata);
}   


