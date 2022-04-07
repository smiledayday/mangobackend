var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/', function(req, res, next) {
  res.header({'Access-Control-Allow-Origin': 'http://localhost:3000'})
  res.header({'Access-Control-Allow-Credentials': true})
  res.render('index', { title: 'Express' });
  res.send('register')
});

module.exports = router;
