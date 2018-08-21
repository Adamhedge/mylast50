var Keys = require('./../services/helpers/keys.js');
var Promise = require('bluebird');

var helpers = require('./../services/helpers/helpers.js');
var querystring = require('querystring');
var request = require('request');

var redirect_uri = 'http://localhost:3000/callback';
var stateKey = 'spotify_auth_state';

var getSongs = function(authOptions) {
    promise = new Promise(function(resolve, reject) {
        request.post(authOptions, function(err, res, body) {

            if (!err && res.statusCode === 200) {
                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

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
                        resolve(body);
                    }
                });

            } else {
                reject('invalid token')
            }
        });
    });
    return promise;
};

module.exports = function(app) {
    app.get('/login', function(req, res) {
        var state = helpers.generateRandomString(16);
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

        var storedState = req.cookies ? req.cookies[stateKey] : null;

        if (state === null || state !== storedState) {
            res.redirect('/#' + querystring.stringify({
                error: 'state_mismatch'
            }));
        } else {
            res.clearCookie(stateKey);
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(Keys.client_id + ':' + Keys.client_secret).toString('base64'))
                },
                json: true
            };
            getSongs(authOptions).then(function(songs) {
                res.status(200).send(songs);

            }, function(error) {
                res.status(500).send(error);
            });
        }
    });

    // app.get('/refresh_token', function(req, res) {
    //     // requesting access token from refresh token
    //     var refresh_token = req.query.refresh_token;
    //     var authOptions = {
    //         url: 'https://accounts.spotify.com/api/token',
    //         headers: {
    //             'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    //         },
    //         form: {
    //             grant_type: 'refresh_token',
    //             refresh_token: refresh_token
    //         },
    //         json: true
    //     };
    //
    //     request.post(authOptions, function(err, res, body) {
    //         if (!err && res.statusCode === 200) {
    //             var access_token = body.access_token;
    //             res.send({
    //                 'access_token': access_token
    //             });
    //         }
    //     });
    // });
};
