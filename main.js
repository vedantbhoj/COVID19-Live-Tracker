/*Corona API - Start*/
var settings = {
  "url": "https://vedantbhoj.com/covid19/api.php",
  "async": true,
  "method": "GET",
  "timeout": 0
};


$.ajax(settings).done(function (response) {
    //console.log(JSON.parse(response));
    var covid = JSON.parse(response).countries_stat;
    var main = [];
    var scatter_pop = [];
    var scatter_deaths = [];
    var scatter_countryName = [];
    var scatterMortality = [];
    var TotalCases = 0, Totaldeaths = 0, Totalrecovered = 0;
    var US_Cases;
    var US_Deaths;
    var US_Recovered;
    var US_Critical;
    var US_Active;

    function toNumber(data) {
        if(data=="N/A") 
            return 0;
        else
            return parseInt(data.replace(/,/g, ''), 10);
    }

    for (item in covid) {
        if(covid[item].country_name !=="")
        {
        var jsonobject = [];

        var cases = toNumber(covid[item].cases);
        //cases = parseInt(cases.replace(/,/g, ''), 10);
        TotalCases += cases;

        var deaths = toNumber(covid[item].deaths);
        //deaths = parseInt(deaths.replace(/,/g, ''), 10);
        Totaldeaths += deaths;

        var total_recovered = toNumber(covid[item].total_recovered);
        //total_recovered = parseInt(total_recovered.replace(/,/g, ''), 10);
        Totalrecovered += total_recovered;

        var populationPerCountry = parseInt(cases / parseInt(covid[item].total_cases_per_1m_population.replace(/,/g, ''), 10));
        scatter_pop.push(populationPerCountry * 1000000);
        scatter_deaths.push(deaths);
        scatter_countryName.push(covid[item].country_name);
        
        if(covid[item].country_name == "USA")
            jsonobject.push("US", cases);
        else
            jsonobject.push(covid[item].country_name, cases);

        main.push(jsonobject);
        }
    }

    scatterMortality.push(scatter_pop, scatter_deaths, scatter_countryName);


    var covid_US = covid.filter(function (item) {
        return item.country_name == "USA";
    })

    var top5 = covid.sort(function (a, b) { return toNumber(a.deaths) < toNumber(b.deaths) ? 1 : -1; }).slice(0, 5);
    var top5Recovered = [];
    var top5Deaths = [];
    var top5Critical = [];

    for (item in top5) {
        var jsonobject = [];
        jsonobject.push(covid[item].country_name, toNumber(covid[item].total_recovered));
        top5Recovered.push(jsonobject);
        var jsonobject = [];
        jsonobject.push(covid[item].country_name, toNumber(covid[item].deaths));
        top5Deaths.push(jsonobject);
        var jsonobject = [];
        jsonobject.push(covid[item].country_name, toNumber(covid[item].serious_critical));
        top5Critical.push(jsonobject);
    }

    US_Cases = toNumber(covid_US[0].cases);
    US_Deaths = toNumber(covid_US[0].deaths);
    US_Recovered = toNumber(covid_US[0].total_recovered);
    US_Critical = toNumber(covid_US[0].serious_critical);
    US_Active = toNumber(covid_US[0].active_cases);

    // res.render("./dashboard", {
    //     covid: main = JSON.stringify(main),
    //     totalCases: TotalCases,
    //     totaldeaths: Totaldeaths,
    //     totalrecovered: Totalrecovered,
    //     mortality: JSON.stringify(scatterMortality),
    //     US_Cases: US_Cases,
    //     US_Deaths: US_Deaths,
    //     US_Recovered: US_Recovered,
    //     US_Critical: US_Critical,
    //     US_Active: US_Active,
    //     top5Recovered: JSON.stringify(top5Recovered),
    //     top5Deaths: JSON.stringify(top5Deaths),
    //     top5Critical: JSON.stringify(top5Critical),
    //     name: "Admin"
    // });


$("#TotalCases").html(TotalCases);
$("#Totaldeaths").html(Totaldeaths);
$("#Totalrecovered").html(Totalrecovered);

/*Number Animation - Start*/
$('.animate_number').each(function () {
    $(this).prop('Counter', 0).animate({
        Counter: $(this).text()
    }, {
        duration: 1500,
        easing: 'swing',
        step: function (now) {
            $(this).text(Math.ceil(now));
        }
    });
});
/*Number Animation - End*/


/*Chart Kick Global options - Start*/
Chartkick.options = {
    library: { animation: { easing: 'easeOutQuart' } },
    backgroundColor: 'black'
}
Chart.defaults.global.defaultFontColor = 'white';
/*Chart Kick Global options - end*/


/*Google Geo Chart - Start*/
var options = { displayMode: 'text', backgroundColor: 'black' };
var dataPoints = main;
dataPoints.unshift(["Country", "Cases"]);
google.charts.load('current', { packages: ['corechart'] });
google.charts.setOnLoadCallback(drawRegionsMap);

// google.charts.load('current', {
//     'packages':['geochart'],
//     // Note: you will need to get a mapsApiKey for your project.
//     // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
//   });

function drawRegionsMap() {
    var data = google.visualization.arrayToDataTable(dataPoints);

    var options = {
        backgroundColor: 'black',
        colorAxis: {
            colors: [
                "#b30000",
                "#800000",
                "#660000",
                "#4d0000",
                "#1a0000"]
        },
        datalessRegionColor: '#ffffff',
    };

    var chart = new google.visualization.GeoChart(document.getElementById('geo'));
    chart.draw(data, options);
};
/*Google Geo Chart - End*/


/*ChartJS PIE Chart - Start*/
// var US_Cases = $("#US_Cases").val();
// var US_Deaths = $("#US_Deaths").val();
// var US_Critical = $("#US_Critical").val();
// var US_Recovered = $("#US_Recovered").val();
// var US_Active = $("#US_Active").val();
new Chartkick.PieChart("US_DATA", [["Deaths", US_Deaths], ["Critical", US_Critical], ["Recovered", US_Recovered]], { colors: ["red", "yellow", "green"] })
/*ChartJS PIE Chart - End*/


/*ChartJS BAR Chart - Start*/
// var top5Recovered = JSON.parse($("#top5Recovered").val());
// var top5Deaths = JSON.parse($("#top5Deaths").val());
// var top5Critical = JSON.parse($("#top5Critical").val());
new Chartkick.BarChart("multiple-bar", [{ name: "Recovered", data: top5Recovered }, { name: "Deaths", data: top5Deaths }]);
/*ChartJS BAR Chart - End*/


/*Scatter Chart - Start*/
// var scatterData = JSON.parse($("#mortalityData").val());
var scatterData = scatterMortality;
var trace1 = {
    x: scatterData[0],
    y: scatterData[1],
    mode: 'markers',
    type: 'scatter',
    name: 'Mortality',
    text: scatterData[2],
    textposition: 'top center',
    textfont: {
        family: 'Raleway, sans-serif'
    },
    marker: {
        size: 4,
        color: 'rgb(255, 71, 26)'
    }
};
var layout = {
    autosize: false,
    width: 400,
    height: 280,
    margin: {
        l: 50,
        r: 20,
        b: 30,
        t: 20,
        pad: 2
    },
    plot_bgcolor: '#000',
    paper_bgcolor: '#000',
    xaxis: {
        autorange: true,
        type: 'log',
        tickvals: [0, 1000000, 10000000, 10000000, 100000000, 1000000000],
        color: 'white'
    },
    yaxis: {
        autorange: true,
        type: 'log',
        tickvals: [0, 10, 100, 1000, 10000, 30000],
        color: 'white'
    },
    scatter: { dash: '5000px 10000px' }
};

Plotly.newPlot('mortality', [trace1], layout).then(function () {
    return Plotly.animate('mortality',
        [{ data: [{ 'scatter': '' }] }],
        {
            frame: { duration: 1000, redraw: false },
            transition: { duration: 1000 }
        }
    );
});
/*Scatter Chart - End*/


/*Stacked BAR Chart - Start*/
var stackedXaxis = [];
var stackedYaxis_deaths = [];
var stackedYaxis_critical = [];
for (i in top5Deaths) {
    stackedXaxis.push(top5Deaths[i][0]);
    stackedYaxis_deaths.push(top5Deaths[i][1]);
}
for (i in top5Critical) {
    stackedYaxis_critical.push(top5Critical[i][1]);
}

var trace1a = {
    x: stackedXaxis,
    y: stackedYaxis_deaths,
    name: 'Deaths',
    type: 'bar',
    color: '#FFFF',
    mode: 'markers',
    name: '<span style="color:white">Deaths</span>',
    text: "Deaths",
    textposition: 'top center',
    textfont: {
        family: 'Raleway, sans-serif'
    },
    marker: {
        size: 4,
        color: 'rgb(128, 128, 128)',
        line: {
            color: 'rgb(255, 255, 255)',
            width: 0.5
        }
    }
};

var trace1b = {
    x: stackedXaxis,
    y: stackedYaxis_critical,
    type: 'bar',
    color: '#FFFF',
    mode: 'markers',
    name: '<span style="color:white">Critical</span>',
    text: "Critical",
    textposition: 'top center',
    textfont: {
        family: 'Raleway, sans-serif'
    },
    marker: {
        size: 4,
        color: 'rgb(255, 71, 26)',
        line: {
            color: 'rgb(255, 255, 255)',
            width: 0.5
        }
    }
};

var data = [trace1a, trace1b];
var layout = {
    barmode: 'stack', plot_bgcolor: "black", paper_bgcolor: "#000", color: '#FFFF', xaxis: { color: 'white' },
    yaxis: { color: 'white' },
};

Plotly.newPlot('stacked-bar', data, layout).then(function () {
    return Plotly.animate('stacked-bar',
        [{ data: [{ 'line.dash': '0px 500px' }] }],
        {
            frame: { duration: 1000, redraw: true },
            transition: { duration: 1000 }
        }
    );
});;
/*Stacked BAR Chart - End*/


});
/*Corona API - End*/