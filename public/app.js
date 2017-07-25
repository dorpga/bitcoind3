function $(s) {
  return document.querySelector(s);
}

var socket = io.connect('http://localhost:8001');

var data = {};

socket.on('update', update)

function update(d) {
  console.log('update')
  data = d
  updateGraph()
}


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

  var _data = data.btc.coinbase;

  _data.forEach(function(d) { d.time = new Date(d.time * 1000).toISOString(); });

  // format the data
  _data.forEach(function(d) {
    d.date = parseTime(d.time);
    d.price = +d.price;
  });

  // set the ranges
  var x = d3.scaleTime().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  // define the line
  var valueline = d3.line()
    .x(function(d) {
      console.log(d)
      return x(d.date);
    })
    .y(function(d) {
      return y(d.price);
    });

  // Scale the range of the data
  x.domain(d3.extent(_data, function(d) {
    return d.date;
  }));
  y.domain([0, d3.max(_data, function(d) {
    return d.price;
  })]);
  // Add the valueline path.
  svg.append("path")
    .data([_data])
    .attr("class", "line")
    .attr("d", valueline);
  // Add the X Axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));
}
