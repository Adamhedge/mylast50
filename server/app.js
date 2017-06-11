var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));


app.use(express.static(path.join(__dirname, '../client')));


module.exports = app.listen(3000);