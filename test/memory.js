/* eslint-env node, mocha */
/* global testBackend, stow, assert */
describe('Memory Backend', function () {
  var Backend = require('../backends/memory')

  Backend.prototype._length = function (cb) {
    return cb(null, this._cache.length)
  }

  // Test generic backend features.
  testBackend(Backend)

  // Test memory-specific features.
  describe('Memory-only Features', function () {
    var cache

    beforeEach(function () {
      cache = stow.createCache(Backend, {
        max: 3
      })
    })

    it('respsect the max cache size', function (done) {
      cache.set('one', 'One', function () {
        cache.set('two', 'Two', function () {
          cache.set('three', 'Three', function () {
            cache.set('four', 'Four', function () {
              cache._length(function (err, length) {
                assert.ifError(err)
                assert.equal(length, 3)
                cache.get('one', function (err, item) {
                  assert.ifError(err)
                  assert.equal(item, null)
                  cache.get('four', function (err, item) {
                    assert.ifError(err)
                    assert.equal(item.data, 'Four')
                    done()
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
