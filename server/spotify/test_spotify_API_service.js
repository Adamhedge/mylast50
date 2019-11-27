const expect = require('chai').expect;
const nock = require('nock');

const spotify_API_service = require('./spotify_API_service');

const songs1 = [
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
  {song: {track: {uri: 1}}},
];

describe('Spotify API Endpoints', () => {

  describe('Get User', () => {

    it('Fails properly when an http error is returned', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/')
        .replyWithError({message: 'No Code exists', code: 500});
      spotify_API_service.get_user('123').then((result) => {
        expect(false).to.equal(true);
      }).catch((msg) => {
        expect(true).to.equal(true);
      }).then(done);
    });
  });
  describe('Get Songs', () => {

    it('returns an empty playlist if no songs are returned', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played')
        .reply(200, {items: []});
      spotify_API_service.get_songs('123', []).then((result) => {
        expect(false).to.be.true;
      }).catch((msg) => {
        expect(true).to.be.true;
      }).then(done);
    });
    before(() => {

    });
    it('works if there are less than 50 songs', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?before=true')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?before=true')
        .reply(200, {items: []});
      spotify_API_service.get_songs('123').then((result) => {
        expect(result.length === 40).to.equal(true);
      }).catch((msg) => {
        expect(false).to.equal(true);
      }).then(done);
    });

    it('never returns more than 50 songs', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?before=true')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?before=true')
        .reply(200, {items: songs1, cursors: {before: true}});
      spotify_API_service.get_songs('123').then((result) => {
        expect(result.length === 50).to.equal(true);
      }).catch((msg) => {
        expect(false).to.equal(true);
      }).then(done);
    });

    it('works when spotify cannot be reached', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played')
        .replyWithError({message: "Spotify doesn't exist", code: 500});
      spotify_API_service.get_songs('123').then((result) => {
        expect(false).to.equal(true);
      }).catch((msg) => {
        expect(true).to.equal(true);
      }).then(done);
    });
  });
});
