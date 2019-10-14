var Keys = require('./../services/helpers/keys.js');
var Promise = require('bluebird');
var moment = require('moment');

var helpers = require('./../services/helpers/helpers.js');
var querystring = require('querystring');
var request = require('request');

// var redirect_uri = 'http://10.68.212.70:3000/';
var redirect_uri = 'http://localhost:3000/';
var stateKey = 'spotify_auth_state';


var get_user = function(auth_options) {
  promise = new Promise(function(resolve, reject) {
    request.post(auth_options, function(err, res, body) {

      if (!err && res.statusCode === 200) {
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me/',
          headers: { Authorization: 'Bearer ' + access_token },
          json: true,
        };
        request.get(options, function(err, res, body) {
          if (err) {
            reject(err);
          } else {
            resolve({user: body, access_token: access_token});
          }
        });
      } else {
        reject(err);
      }
    });
  });
  return promise;
};

var get_songs = function(access_token, songs, before) {
  promise = new Promise(function(resolve, reject) {
    var options = {
      url: 'https://api.spotify.com/v1/me/player/recently-played',
      headers: { Authorization: 'Bearer ' + access_token },
      params: {
        limit: 20,
      },
      json: true,
    };

    if (before) {
      options.url = options.url.concat('?before=' + before);
    };

    request.get(options, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        var result = songs ? songs.concat(body.items) : body.items;
        var before = (((body || {}).cursors || {}).before || false);
        if (result.length < 51 && before) {
          get_songs(access_token, result, before).then(function(data) {
            resolve(data.length > 50 ? data.slice(49) : data);
          }, function(err) {
            reject(err);
          });
        } else {
          resolve(result.length > 50 ? result.slice(0, 50) : result);
        }
      } else {
        reject(err);
      }
    });
  });
  return promise;
};

var make_playlist = function(access_token, user) {
  var promise = new Promise(function(resolve, reject) {

    var options = {
      url: 'https://api.spotify.com/v1/users/' + user.id + '/playlists',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json' },
      body: {
        name: 'MyLast50: ' + moment(Date.now()).format('LL'),
        public: false,
        collaborative: false,
        description: 'The last 50 songs I listened to.  Try it at mylast50.com',
      },
      json: true,
    };
    request.post(options, function(err, res) {
      if (err) {
        reject(err);
      } else {
        playlist_id = (((res || {}).body || {}).id || false);
        resolve(playlist_id);
      }
    });
  });
  return promise;
};

var populate_playlist = function(access_token, playlist_id, songs, user) {
  var promise = new Promise(function(resolve, reject) {
    track_list = songs.map(function(song) { return song.track.uri; });

    var options = {
      url: 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks',
      headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json' },
      body: {
        uris: track_list,
      },
      json: true,
    };
    request.post(options, function(err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
  return promise;
};

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
      get_user(auth_options).then(function(data) {
        user = data.user;
        access_token = data.access_token;
        get_songs(access_token).then(function(data) {
          songs = data;
          make_playlist(access_token, user).then(function(data) {
            var playlist = data;
            populate_playlist(access_token, data, songs, user).then(function(){
              res.redirect('https://open.spotify.com/user/spotify/playlist/' + playlist);
            }, function(error) {
              res.status(500).send(error);
            });
          }, function(error) {
            res.status(500).send(error);
          });
        }, function(error) {
          res.status(500).send(error);
        });
      }, function(error) {
        res.status(500).send(error);
      });
    }
  });
};
