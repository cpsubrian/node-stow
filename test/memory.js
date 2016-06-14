/* eslint-env node, mocha */
/* global testBackend */
describe('Memory Backend', function () {
  var Backend = require('../backends/memory')

  Backend.prototype._length = function (cb) {
    return cb(null, Object.keys(this._cache).length)
  }

  testBackend(Backend)
})
