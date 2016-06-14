/* eslint-env node, mocha */
/* global testBackend */
var MongoClient = require('mongodb').MongoClient

describe('Mongo Backend', function () {
  var Backend = require('../backends/mongo')
  var dbName = 'stow-test-' + Date.now()
  var db
  var options = {}

  Backend.prototype._length = function (cb) {
    this.coll.count(cb)
  }

  before(function (done) {
    MongoClient.connect('mongodb://localhost:27017/' + dbName, function (err, _db) {
      if (err) return done(err)
      db = options.db = _db
      done()
    })
  })

  after(function (done) {
    db.dropDatabase(function (err) {
      if (err) return done(err)
      db.close()
      done()
    })
  })

  testBackend(Backend, options)
})
