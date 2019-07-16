var _ = require('underscore')
/**
 * Demo code from the spotify API auth guide
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string,
 */
exports.generate_random_string = function(length) {
  var result = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    result += chars.charAt(_.random(0, chars.length - 1));
  }
  return result;
};
