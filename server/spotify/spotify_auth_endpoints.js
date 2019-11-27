var Keys = require('./../helpers/keys.js');
var spotify_API_service = require('./spotify_API_service.js');
var helpers = require('./../helpers/helpers.js');
var querystring = require('querystring');

// var redirect_uri = 'http://10.68.212.70:3000/';
var redirect_uri = 'http://localhost:5050/';
var stateKey = 'spotify_auth_state';

module.exports = function(app) {
  app.get('/login', function(req, res) {
    var state = helpers.generate_random_string(16);
    res.cookie(stateKey, state);

    // Add the ability to read and write playlists.
    var scope = 'playlist-modify-private user-read-recently-played';

    res.setHeader('Access-Control-Allow-Origin', redirect_uri);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
    res.setHeader('Access-Control-Allow-Credentials', true); // If needed
    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
      response_type: 'code',
      client_id: Keys.client_id,
      scope: scope,
      redirect_uri: redirect_uri + 'callback',
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
          redirect_uri: redirect_uri + 'callback',
        },
        headers: {
          Authorization: 'Basic ' + (Buffer.from(Keys.client_id + ':' + Keys.client_secret).toString('base64')),
        },
        json: true,
      };
      spotify_API_service.make_last_50_playlist(auth_options, res)
        .then(function(playlist) {
          res.redirect('https://open.spotify.com/user/spotify/playlist/' + playlist);
        }, function(error) {
          res.status(500).send(error);
        });
    }
  });
};
