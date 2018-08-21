var bodyParser = require('body-parser');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser')

module.exports = function(app, express) {
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
    app.use(express.static(path.join(__dirname, '../../client/')));
    app.use(cors({'origin': 'http://localhost:3000'}));
    app.use(cookieParser());
};
