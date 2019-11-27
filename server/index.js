var express = require('express');
var app = express();

require('./config/node_config.js')(app, express);
require('./endpoints.js')(app);

app.set('port', process.env.PORT || 5050);
app.listen(app.get('port'));

console.log('Listening to port ' + app.get('port'));

module.exports = app;
