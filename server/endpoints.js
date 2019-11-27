module.exports = function(app) {
  require('./spotify/spotify_auth_endpoints.js')(app);
};
