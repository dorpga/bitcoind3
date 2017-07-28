var express = require('express')
var app = express()
var request = require('request');

// Fixes error with AJAX in the browser
app.get('/coin/:coin', (req, res) => {
  request(`https://api.cryptowat.ch/markets/kraken/${req.params.coin}usd/sparkline`, function(err, response, body) {
    if (err) {
      throw err;
    } else {
      console.log(body)
      var r = JSON.parse(body);
      res.send(r.result);
    }
  })
})

app.use(express.static('public'))

app.listen(8001)
