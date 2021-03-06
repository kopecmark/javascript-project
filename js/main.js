var flag = true;
var formattedData;
var barChart;
var lineChart;
var formattedDataYearly = [];
var allYears = [];
var maxSnow = 0;
var maxRain = 0;
var selectedDataLineChart;
var selectedDataBarChart;

d3.csv("data/ll_monthly_snow.csv").then(function (data) {
  formattedData = data.map((month) => {

    const newMonth = {};
    newMonth.totalSnow = Number(month['Total Snow (cm)']);
    newMonth.Month = +month.Month;
    newMonth.Year = +month.Year;
    newMonth.totalRain = Math.round(Number(month['Total Rain (mm)']) / 10);
    var parseTime = d3.timeParse("%Y-%m");
    newMonth.monthText = parseTime(month['Date/Time']);

    // Develop an array that includes all years available in the data
    if (!allYears.includes(newMonth.Year)) {
      allYears.push(newMonth.Year);
    }

    return newMonth;
  });


  // format data for use in a line graph
  allYears.forEach(year => {
    var singleYear = { year: year, values: [] };
    var parseTime = d3.timeParse("%m");

    var allMonths = formattedData.filter(month => {
      return month.Year === year;
    });

    allMonths.forEach(month => {
      singleYear.values.push({ month: parseTime(month.Month), totalSnow: month.totalSnow, totalRain: month.totalRain, monthText: month.monthText });
      if (month.totalSnow > maxSnow) maxSnow = month.totalSnow;
      if (month.totalRain > maxRain) maxRain = month.totalRain;

    });

    formattedDataYearly.push(singleYear);
  });
  
  // Parse data for a single year
  selectedData = formattedData.filter((d) => {
    return d.Year === parseInt(slider.noUiSlider.get());
  });
  // Create line and bar chart
  lineChart = new LineChart("#chart-area-line", formattedDataYearly);
  barChart = new BarChart("#chart-area-bar", selectedData);

});


// Function to switch between snow and rain
let buttons = document.querySelector(".button-container");
let rainButton = document.getElementById("rain-button");
let snowButton = document.getElementById("snow-button");
let clickedButton;

buttons.addEventListener("click", switchData, false);

function switchData(e) {
  if (e.target !== e.currentTarget) {
    clickedButton = e.target.id;
  }

  e.stopPropagation();
  
  if (clickedButton === "rain-button" && flag === true) {
    flag = !flag;
    switchButtonStyle();
    updateCharts();
  } else if(clickedButton === "snow-button" && flag === false) {
    flag = !flag;
    switchButtonStyle();
    updateCharts();
  }
}

function switchButtonStyle() {
  if (flag){
    snowButton.setAttribute('data-selected', 'true');
    rainButton.setAttribute('data-selected', 'false');
  } else {
    rainButton.setAttribute('data-selected', 'true');
    snowButton.setAttribute('data-selected', 'false');

  }
}

function updateCharts() {
  selectedDataBarChart = formattedData.filter((d) => {
    return d.Year === parseInt(slider.noUiSlider.get());
  });

  if (selectedDataLineChart) {
    lineChart.wrangleData(selectedDataLineChart);
  } else {
    lineChart.wrangleData(formattedDataYearly);
  }
  barChart.wrangleData(selectedDataBarChart);
}


// Update bar chart using the slider
slider.noUiSlider.on('change', yearValue => {
  selectedDataBarChart = formattedData.filter((d) => {
    return d.Year === parseInt(yearValue[0]);
  });
  barChart.wrangleData(selectedDataBarChart);
});

// Update the line chart using range slider input 
rangeSlider.noUiSlider.on('change', yearValues => {
  selectedDataLineChart = formattedDataYearly.filter((d) => {
    return d.year >= parseInt(yearValues[0]) && d.year <= parseInt(yearValues[1]);
  });
  lineChart.wrangleData(selectedDataLineChart);
});