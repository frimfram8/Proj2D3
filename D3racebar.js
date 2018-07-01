// Tutorial: http://frameworkish.com/html/2016/05/04/grouped-dynamic-bar-chart-d3.html
var data = [
  {
    year: '2011',
    deaths: [459, 1043, 2241, 35775, 2588]
  },
  {
    year: '2012',
    deaths: [485, 1152, 2357, 36606, 2729]
  },
  {
    year: '2013',
    deaths: [521, 1121, 2353, 37154, 2746]
  },
  {
    year: '2014',
    deaths: [489, 1188, 2426, 38723, 3102]
  },
  {
    year: '2015',
    deaths: [577, 1316, 2504, 39796, 3180]
  },
  {
    year: '2016',
    deaths: [629, 1402, 2770, 40164, 3497]
  }
];

var ids = ['indian', 'asian', 'black', 'white', 'hispanic'];
var raceNames = ['American Indian or Alaska native', 'Asian or Pacific Islander', 'Black or African American', 'White', 'Hispanic or Latino'];

// Let's populate the categoeries checkboxes
d3.select('.categories').selectAll('.checkbox')
  .data(ids)
  .enter()
  .append('div')
  .attr('class', 'checkbox')
  .append('label').html(function(id, index) {
    var checkbox = '<input id="' + id + '" type="checkbox" class="category">';
    return checkbox + raceNames[index];
  });

// some variables declarations
var margin = {top: 20, right: 300, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// the scale for the state age value
var x = d3.scale.linear().range([0, width]);

// the scale for each state
var y0 = d3.scale.ordinal().rangeBands([0, height], .1);
// the scale for each state age
var y1 = d3.scale.ordinal();

// just a simple scale of colors
var color = d3.scale.ordinal()
    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

//
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.format(".2s"));

var yAxis = d3.svg.axis()
    .scale(y0)
    .orient("left");

var svg = d3.select(".graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select('.categories').selectAll('.category').on('change', function() {
  var x = d3.select('.categories').selectAll('.category:checked');
  var ids = x[0].map(function(category) {
    return category.id;
  });
  updateGraph(ids);
});
renderGraph();

function renderGraph() {
  x.domain([0, 0]);
  // y0 domain is all the state names
  y0.domain(data.map(function(d) { return d.year; }));
  // y1 domain is all the age names, we limit the range to from 0 to a y0 band
  y1.domain(raceNames).rangeRoundBands([0, y0.rangeBand()]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
}

function updateGraph(selectedIds) {

  var yearsData = data.map(function(data) {
    return {
      year: data.year,
      races: selectedIds.map(function(selectedId) {
        var index = ids.findIndex(function(id) {
          return selectedId === id;
        });
        return {
          id: ids[index],
          name: raceNames[index],
          value: data.deaths[index]
        };
      })
    }
  });


  // x domain is between 0 and the maximun value in any ages.value
  x.domain([0, d3.max(yearsData, function(d) { return d3.max(d.races, function(d) { return d.value }); })]);
  // y0 domain is all the state names
  y0.domain(yearsData.map(function(d) { return d.year; }));
  // y1 domain is all the age names, we limit the range to from 0 to a y0 band
  y1.domain(ids).rangeRoundBands([0, y0.rangeBand()]);

  svg.selectAll('.axis.x').call(xAxis);
  svg.selectAll('.axis.y').call(yAxis);

  var year = svg.selectAll(".state")
    .data(yearsData);

  year.enter().append("g")
    .attr("class", "state")
    .attr("transform", function(d) { return "translate(0, " + y0(d.year) + ")"; });

  var race = year.selectAll("rect")
    .data(function(d) { return d.races; });

  // we append a new rect every time we have an extra data vs dom element
  race.enter().append("rect")
    .attr('width', 0);

  // this updates will happend neither inserting new elements or updating them
  race
    .attr("x", 0)
    .attr("y", function(d, index) { return y1(ids[index]); })
    .attr("id", function(d) { return d.id; })
    .style("fill", function(d) { return color(d.name); })
    .text(function(d) { return d.name })
    .transition()
    .attr("width", function(d) { return x(d.value); })
    .attr("height", y1.rangeBand());

  race.exit().transition().attr("width", 0).remove();

  var legend = svg.selectAll(".legend")
      .data(yearsData[0].races.map(function(race) { return race.name; }));

  legend.enter().append("g");
  legend
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(300," + (200 + i * 20) + ")"; });

  var legendColor = legend.selectAll('.legend-color').data(function(d) { return [d]; });
  legendColor.enter().append("rect");
  legendColor
    .attr('class', 'legend-color')
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", color);

  var legendText = legend.selectAll('.legend-text').data(function(d) { return [d]; });;

  legendText.enter().append("text");
  legendText
    .attr('class', 'legend-text')
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

  legend.exit().remove();
}