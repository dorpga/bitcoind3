var express = require('express')
var app = express()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var request = require('request');
var config = require('./config.json');

var data = {}

server.listen(8001)

config.markets.forEach(function(market) {
  if (!data[market.coin]) {
    data[market.coin] = {}
  }
  data[market.coin][market.exchange] = [];
})

function updateData() {
  config.markets.forEach(function(market) {
    request(`${config.api}/markets/${market.exchange}/${market.coin}usd/sparkline`, function(err, res, body) {
      if (err) {
        throw err;
      } else {
        var r = JSON.parse(body);
        data[market.coin][market.exchange] = r.result;
      }
    })
  })
}

function sendUpdate(socket) {
  socket.emit('update', data)

  setInterval(function() {
    socket.emit('update', data)
  }, 10000);
}

updateData()

io.on('connection', function(socket) {
  sendUpdate(socket);
})

app.use(express.static('public'))

app.get('/api/everything', function(req, res) {
  res.json(data);
})
