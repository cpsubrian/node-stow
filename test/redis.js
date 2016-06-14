/* eslint-env node, mocha */
/* global testBackend */
var redis = require('haredis')

describe('Redis Backend', function () {
  var Backend = require('../backends/redis')
  var client = redis.createClient(['localhost:6379'])
  var options = {
    client: client,
    prefix: 'stow:test:' + Date.now() + ':'
  }

  after(function (done) {
    client.keys(options.prefix + '*', function (err, keys) {
      if (err) return done(err)
      client.del(keys, done)
    })
  })

  Backend.prototype._length = function (cb) {
    this.client.keys(this.key('*'), function (err, keys) {
      if (err) return cb(err)
      cb(null, keys.length)
    })
  }
  testBackend(Backend, options)
})
