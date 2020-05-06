const expect = require('chai').expect;
const nock = require('nock');

const spotify_API_service = require('./spotify_API_service');

const songs1 = [
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
];

const unsorted_songs_album_non_collation = [
  {track: {album: {uri: 1}, track_number: 5, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 6, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 9, uri: 1}},
];

const sorted_songs_album_non_collation = [
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 5, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 6, uri: 1}},
  {track: {album: {uri: 1}, track_number: 9, uri: 1}},
];

const unsorted_songs_album_non_collation_2 = [
  {track: {album: {uri: 1}, track_number: 5, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 9, uri: 1}},
];

const sorted_songs_album_non_collation_2 = [
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 5, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 9, uri: 1}},
];


const unsorted_songs = [
  {track: {album: {uri: 1}, track_number: 5, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 6, uri: 1}},
  {track: {album: {uri: 1}, track_number: 9, uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 2}, track_number: 1, uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
];

const sorted_songs = [
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 5, uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 4, uri: 1}},
  {track: {album: {uri: 1}, track_number: 6, uri: 1}},
  {track: {album: {uri: 1}, track_number: 9, uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 2, uri: 1}},
  {track: {album: {uri: 1}, track_number: 3, uri: 1}},
  {track: {album: {uri: 2}, track_number: 1, uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
  {track: {uri: 1}},
  {track: {album: {uri: 1}, track_number: 1, uri: 1}},
];

describe('Spotify API Service', () => {

  describe('Sorting Tracks', () => {
    it('Properly sorts a list of songs', (done) => {
      var result = spotify_API_service.sort_by_album_track(unsorted_songs);
      expect(result).to.eql(sorted_songs);
      done();
    });

    it('Properly orders album tracks, not collating songs', (done) => {
      var result = spotify_API_service.sort_by_album_track(unsorted_songs_album_non_collation);
      expect(result).to.eql(sorted_songs_album_non_collation);
      result = spotify_API_service.sort_by_album_track(unsorted_songs_album_non_collation_2);
      expect(result).to.eql(sorted_songs_album_non_collation_2);
      done();
    });
  });

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
        .get('/v1/me/player/recently-played?limit=50')
        .reply(200, {items: []});
      spotify_API_service.get_songs('123', []).then((result) => {
        expect(result.length === 0).to.be.true;
      }).catch((msg) => {
        expect(false).to.be.true;
      }).then(done);
    });

    it('works if there are less than 50 songs', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played?limit=50')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?limit=50&before=true')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?limit=50&before=true')
        .reply(200, {items: []});
      spotify_API_service.get_songs('123').then((result) => {
        expect(result.length === 40).to.be.true;
      }).catch((msg) => {
        expect(false).to.equal(true);
      }).then(done);
    });

    it('never returns more than 50 songs', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played?limit=50')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?limit=50&before=true')
        .reply(200, {items: songs1, cursors: {before: true}})
        .get('/v1/me/player/recently-played?limit=50&before=true')
        .reply(200, {items: songs1, cursors: {before: true}});
      spotify_API_service.get_songs('123').then((result) => {
        expect(result.length === 50).to.be.true;
      }).catch((msg) => {
        expect(false).to.equal(true);
      }).then(done);
    });

    it('works when spotify cannot be reached', (done) => {
      nock('https://api.spotify.com/')
        .get('/v1/me/player/recently-played')
        .replyWithError({message: "Spotify doesn't exist", code: 500});
      spotify_API_service.get_songs('123').then((result) => {
        expect(false).to.be.true;
      }).catch((msg) => {
        expect(true).to.be.true;
      }).then(done);
    });
  });
});
