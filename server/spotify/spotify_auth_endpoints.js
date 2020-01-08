var spotify_API_service = require('./spotify_API_service.js');
var helpers = require('./../helpers/helpers.js');
var querystring = require('querystring');

if (process.env.NODE_ENV !== 'production') {
  var Keys = require('./../helpers/keys.js');
}

// var callback_url = 'http://10.68.212.70:3000/';
var callback_url = process.env.CALLBACK_URL || 'http://localhost:1337/';
var client_id = process.env.CLIENT_ID || Keys.client_id;
var client_secret = process.env.CLIENT_SECRET || Keys.client_secret;
var stateKey = 'spotify_auth_state';

module.exports = function(app) {
  app.get('/login', function(req, res) {
    var state = helpers.generate_random_string(16);
    res.cookie(stateKey, state);

    // Add the ability to read and write playlists.
    var scope = 'playlist-modify-private user-read-recently-played';

    res.setHeader('Access-Control-Allow-Origin', callback_url);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: process.env.CLIENT_ID || client_id,
      scope: scope,
      redirect_uri: callback_url + 'callback',
      state: state,
    }));
  });

  app.get('/callback', function(req, res) {
    // your application requests refresh and access tokens
    // after checking the state parameter
    var code = req.query.code || null;
    var state = req.query.state || null;
    var stored_state = req.cookies ? req.cookies[stateKey] : null;
    if (state === null || state !== stored_state) {
      res.redirect('/#' + querystring.stringify({
        error: 'state_mismatch',
      }));
    } else {
      res.clearCookie(stateKey);
      var auth_options = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: callback_url + 'callback',
        },
        headers: {
          Authorization: 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
        },
        json: true,
      };
      spotify_API_service.make_last_50_playlist(auth_options, res)
        .then(function(href_URL) {
          res.redirect(href_URL);
        }, function(error) {
          res.status(500).send(error);
        });
    }
  });
};
