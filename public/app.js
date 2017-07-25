function $(s) {
  return document.querySelector(s);
}

var socket = io.connect('http://localhost:8001');

var data = {};

socket.on('update', update)

function update(d) {
  data = d
  console.log(data)
  updateGraph()
}

var color = d3.scaleOrdinal(d3.schemeCategory10);

/* D3 Stuff */

// set the dimensions and margins of the graph
var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  },
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;
// parse the date / time
var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

function updateGraph() {

  // TODO: Make it graph all coins and exchanges

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  // define the line
  var valueline = d3.line()
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.price);
    });

  var lColors = []
      lNames = []

  Object.keys(data).forEach(function(name, c) {
    lColors.push(color(c))
    lNames.push(name)
    var i = data[name].kraken
    i.forEach(function(d) {
      d.time = new Date(d.time * 1000).toISOString();
    });

    // format the data
    i.forEach(function(d) {
      d.date = parseTime(d.time);
      d.price = +d.price;
    });

    // Scale the range of the data
    x.domain(d3.extent(i, function(d) {
      return d.date;
    }));
    y.domain([d3.min(i, function(d) {
      return d.price
    }), d3.max(i, function(d) {
      return d.price;
    })]);
    // Add the valueline path.
    svg.append("path")
      .data([i])
      .attr("class", "line")
      .attr("d", valueline)
      .attr("fill", "none")
      .attr("stroke", color(c))

    svg.append("text")
      .datum(function(d) {
        return {
          name: name,
          value: i[i.length - 1]
        };
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.price) + ")";
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function(d) {
        return d.name;
      });
  })

  var ordinal = d3.scaleOrdinal()
  .domain(lNames)
  .range(lColors);

  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

    svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", `translate(${svg.node().getBBox().width-200},20)`)

  var legendOrdinal = d3.legendColor()
    //d3 symbol creates a path-string, for example
    //"M0,-8.059274488676564L9.306048591020996,
    //8.059274488676564 -9.306048591020996,8.059274488676564Z"
    .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
    .shapePadding(10)
    //use cellFilter to hide the "e" cell
    .cellFilter(function(d){ return d.label !== "e" })
    .scale(ordinal);

  svg.select(".legendOrdinal")
    .call(legendOrdinal);
}
