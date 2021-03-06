var moment = require('moment');
var request = require('request');

exports.get_access_token = function(auth_options) {
  var promise = new Promise(function(resolve, reject) {
    request.post(auth_options, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        resolve({access_token: body.access_token});
      } else {
        reject(err);
      }
    });
  });
  return promise;
};

exports.get_user = function(access_token) {
  var promise = new Promise(function(resolve, reject) {
    var options = {
      url: 'https://api.spotify.com/v1/me/',
      headers: { Authorization: 'Bearer ' + access_token },
      json: true,
    };
    request.get(options, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        resolve({user: body, access_token: access_token});
      } else {
        reject(new Error(err.message));
      }
    });
  });
  return promise;
};

exports.get_songs = function(access_token, songs, before) {
  songs = songs || [];
  var promise = new Promise(function(resolve, reject) {
    var options = {
      url: 'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      headers: { Authorization: 'Bearer ' + access_token },
      json: true,
    };
    if (before) {
      options.url = options.url.concat('&before=' + before);
    }
    request.get(options, function(err, res, body) {
      if (!err && res.statusCode === 200) {
        if (songs.length === 0 && body.items.length === 0) {
          resolve(songs);
        }
        songs = songs.concat(body.items);
        var before = (((body || {}).cursors || {}).before || false);

        if (songs.length < 50 && before) {
          exports.get_songs(access_token, songs, before).then(function(data) {
            resolve(data.length > 50 ? data.slice(49) : data);
          }, function(err) {
            reject(err);
          });
        } else {
          resolve(songs.length > 50 ? songs.slice(0, 50) : songs);
        }
      } else {
        reject(err);
      }
    });
  });
  return promise;
};

exports.sort_by_album_track = function(songs) {
  var track_sort = function(a, b) {
    if (a.track.track_number < b.track.track_number) {
      return -1;
    } else if (a.track.track_number > b.track.track_number) {
      return 1;
    }
    return 0;
  };

  var sorted_songs = [];
  var previous_album_uri = '';
  var tracks_of_album = [];
  var descending_tracks = false;

  for (var i = 0; i < songs.length; i++) {
    if (songs[i].track.album && songs[i].track.album.uri && songs[i].track.track_number) {
      if (songs[i].track.album.uri !== previous_album_uri) {
        sorted_songs = sorted_songs.concat(tracks_of_album.sort(track_sort));
        tracks_of_album = [songs[i]];
      } else {
        if (tracks_of_album.length === 0) {
          tracks_of_album.push(songs[i]);
        } else if (tracks_of_album.length === 1) {
          descending_tracks =
            (tracks_of_album[tracks_of_album.length - 1].track.track_number - songs[i].track.track_number === 1);
          tracks_of_album.push(songs[i]);
        } else if (descending_tracks) {
          if (tracks_of_album[tracks_of_album.length - 1].track.track_number - songs[i].track.track_number === 1) {
            tracks_of_album.push(songs[i]);
          } else {
            sorted_songs = sorted_songs.concat(tracks_of_album.reverse());
            tracks_of_album = [songs[i]];
          }
        } else {
          if (tracks_of_album[tracks_of_album.length - 1].track.track_number - songs[i].track.track_number === 1) {
            sorted_songs = sorted_songs.concat(tracks_of_album.slice(0, tracks_of_album.length - 1).sort(track_sort));
            tracks_of_album = [tracks_of_album[tracks_of_album.length - 1]].concat(songs[i]);
          } else {
            tracks_of_album.push(songs[i]);
          }
        }
      }
      previous_album_uri = songs[i].track.album.uri;
    } else {
      sorted_songs = sorted_songs.concat(tracks_of_album.sort(track_sort));
      sorted_songs.push(songs[i]);
      tracks_of_album = [];
      previous_album_uri = '';
    }
  }
  return sorted_songs.concat(tracks_of_album.sort(track_sort));
};

exports.make_playlist = function(access_token, user) {
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
        var playlist_id = (((res || {}).body || {}).id || false);
        var href_URL = ((((res || {}).body || {}).external_urls || {}).spotify || false);
        resolve({playlist_id: playlist_id, href_URL: href_URL});
      }
    });
  });
  return promise;
};

exports.populate_playlist = function(access_token, playlist_id, songs) {
  var promise = new Promise(function(resolve, reject) {
    var track_list = songs.map(function(song) { return song.track.uri; });

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

exports.make_last_50_playlist = function(auth_options) {
  var promise = new Promise(function(resolve, reject) {
    var access_token, user, songs;
    exports.get_access_token(auth_options).then(function(data) {
      access_token = data.access_token;
      return exports.get_user(access_token);
    }).then(function(data) {
      user = data.user;
      return exports.get_songs(access_token);
    }).then(function(data) {
      songs = exports.sort_by_album_track(data);
      if (songs.length > 0) {
        return exports.make_playlist(access_token, user);
      } else {
        reject('Not enough songs to make a playlist out of.');
      }
    }).then(function(data) {
      var playlist = data.playlist_id;
      var href_URL = data.href_URL;
      exports.populate_playlist(access_token, playlist, songs).then(function() {
        resolve(href_URL);
      }, function(err) {
        reject(err);
      });
    });

  });
  return promise;
};
