var Keys = require('./../services/helpers/keys.js');
var Promise = require('bluebird');

var helpers = require('./../services/helpers/helpers.js');
var querystring = require('querystring');
var request = require('request');

var redirect_uri = 'http://localhost:3000/callback';
var stateKey = 'spotify_auth_state';


var get_user = function (auth_options) {
    promise = new Promise(function(resolve, reject) {
        request.post(auth_options, function(err, res, body) {

            if (!err && res.statusCode === 200) {
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me/',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                request.get(options, function(err, res, body) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({user: body, access_token: access_token});
                    }
                });
            } else {
                reject('invalid token at refreshing from getSongs')
            }
        });
    });
    return promise;
};

var get_songs = function(access_token) {
    promise = new Promise(function(resolve, reject) {
        var options = {
            url: 'https://api.spotify.com/v1/me/player/recently-played',
            headers: { 'Authorization': 'Bearer ' + access_token },
            params: {
                'limit': 50
            },
            json: true
        };

        request.get(options, function(err, res, body) {
            if (err) {
                reject(err);
            } else {
                resolve({songs: body, access_token: access_token});
            }
        });
    });
    return promise;
};

var make_playlist = function(access_token, user) {
    var promise = new Promise(function(resolve, reject) {
        //var now = Date().toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});
        var options = {
            url: 'https://api.spotify.com/v1/users/' + user.id + '/playlists',
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json' },
            body: {
                'name': "MyLast50: ",// + now,
                'public': false,
                'collaborative': false,
                'description': 'The last 50 songs I listened to.  Try it at mylast50.com'
            },
            json: true
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
        var scope = 'playlist-read-private playlist-modify-private user-read-email user-read-recently-played';

        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
        res.setHeader('Access-Control-Allow-Credentials', true); // If needed

        res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({
            response_type: 'code',
            client_id: Keys.client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
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
                error: 'state_mismatch'
            }));
        } else {
            res.clearCookie(stateKey);
            var auth_options = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: redirect_uri
                },
                headers: {
                    'Authorization': 'Basic ' + (Buffer.from(Keys.client_id + ':' + Keys.client_secret).toString('base64'))
                },
                json: true
            };

            get_user(auth_options).then(function(data) {
                user = data.user;
                access_token = data.access_token;
    
                get_songs(access_token).then(function(data) {
        
                    songs = data.songs;
        
        

                    make_playlist(access_token, user).then(function(data) {
            
                        res.status(200).send(songs);
                        // populate_playlist(auth_options, data.playlist, songs, user);
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
