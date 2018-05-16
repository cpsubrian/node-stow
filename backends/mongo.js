var async = require('async')
var globToRegex = require('../globToRegex')

function MongoBackend (options) {
  this.ttl = options.ttl
  this.db = options.db
  this.coll = this.db.collection(options.coll || 'stow')
  this.tagsColl = this.db.collection((options.coll || 'stow') + '_tags')

  // Setup indexes.
  this.coll.createIndex({expireAt: 1}, {expireAfterSeconds: 0})
  this.coll.createIndex({tags: 1})
}

// Mongo does not remove documents until the TTLMonitor runs (~60 seconds).
MongoBackend.prototype._expiresImmediately = false

MongoBackend.prototype.key = function () {
  return Array.prototype.slice.call(arguments, 0).join(':')
}

MongoBackend.prototype.set = function (options, cb) {
  var backend = this
  var item = {
    _id: options.key,
    key: options.key,
    data: options.data,
    ttl: (typeof options.ttl !== 'undefined') ? options.ttl : this.ttl,
    timestamp: Date.now(),
    tags: options.tags || []
  }
  backend.checksum(item.tags, function (err, checksum) {
    if (err) return cb(err)
    item.checksum = checksum
    if (item.ttl) {
      item.expireAt = new Date(item.timestamp + (item.ttl * 1000))
    } else {
      item.expireAt = null
    }
    backend.coll.replaceOne({_id: item.key}, item, {upsert: true}, cb)
  })
}

MongoBackend.prototype.get = function (key, cb) {
  var backend = this
  backend.coll.findOne({_id: key}, function (err, item) {
    if (err) return cb(err)
    if (!item) return cb(null, null)
    backend.validate(item, function (err, valid) {
      if (err) return cb(err)
      if (valid) {
        // Manually check for expiration because mongo seems to be slow at
        // clearing stuff.
        if (item.ttl && item.expireAt < Date.now()) {
          return cb(null, null)
        }
        cb(null, item)
      } else {
        cb(null, null)
      }
    })
  })
}

MongoBackend.prototype.invalidate = function (tags, cb) {
  var backend = this
  if (tags && tags.length) {
    async.each(tags, function (tag, done) {
      backend.tagsColl.update({_id: tag}, {$inc: {invalidations: 1}}, {upsert: true}, done)
    }, cb)
  } else {
    cb()
  }
}

MongoBackend.prototype.clear = function (pattern, cb) {
  var backend = this
  backend.coll.deleteMany({_id: {$regex: globToRegex(pattern)}}, cb)
}

MongoBackend.prototype.checksum = function (tags, cb) {
  var backend = this
  if (tags && tags.length) {
    backend.tagsColl.find({_id: {$in: tags}}).toArray(function (err, items) {
      if (err) return cb(err)
      if (!items || !items.length) return cb(null, 0)
      var checksum = items.reduce(function (prev, next) {
        return prev + next.invalidations
      }, 0)
      cb(null, checksum)
    })
  } else {
    cb(null, 0)
  }
}

MongoBackend.prototype.validate = function (item, cb) {
  var backend = this
  if (item.tags) {
    backend.checksum(item.tags, function (err, checksum) {
      if (err) return cb(err)
      if (item.checksum < checksum) {
        cb(null, false)
      } else {
        cb(null, true)
      }
    })
  } else {
    cb(null, true)
  }
}

module.exports = MongoBackend
