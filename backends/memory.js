var LRU = require('lru-cache')
var hydration = require('hydration')
var globToRegex = require('../globToRegex')

function MemoryBackend (options) {
  this._cache = LRU({
    max: options.max || 5000,
    maxAge: (options.ttl * 1000) || (1000 * 60 * 60 * 24)
  })
  this._tags = {}
  this.ttl = options.ttl || (1000 * 60 * 60 * 24)
}

MemoryBackend.prototype.set = function (options, cb) {
  var backend = this
  var item = {
    key: options.key,
    data: options.data,
    ttl: (typeof options.ttl !== 'undefined') ? options.ttl : this.ttl,
    timestamp: Date.now(),
    tags: options.tags || []
  }
  backend.checksum(item.tags, function (err, checksum) {
    if (err) return cb(err)
    item.checksum = checksum

    var data
    try {
      data = JSON.stringify(hydration.dehydrate(item))
    } catch (e) {
      return cb(e)
    }

    backend._cache.set(item.key, data, (item.ttl * 1000))
    cb()
  })
}

MemoryBackend.prototype.get = function (key, cb) {
  var backend = this
  var data = backend._cache.get(key)
  if (data) {
    var item
    try {
      item = hydration.hydrate(JSON.parse(data))
    } catch (e) {
      return cb(e)
    }

    backend.validate(item, function (err, valid) {
      if (err) return cb(err)
      if (valid) {
        cb(null, item)
      } else {
        backend._cache.del(key)
        cb(null, null)
      }
    })
  } else {
    cb(null, null)
  }
}

MemoryBackend.prototype.invalidate = function (tags, cb) {
  var backend = this
  tags.forEach(function (tag) {
    if (backend._tags[tag]) {
      backend._tags[tag]++
    } else {
      backend._tags[tag] = 1
    }
  })
  cb()
}

MemoryBackend.prototype.clear = function (pattern, cb) {
  var backend = this

  if (pattern === '*') {
    backend._cache.reset()
    return cb(null)
  }

  var reg = null
  if (pattern.indexOf('*') < 0) {
    reg = new RegExp(pattern)
  } else {
    reg = globToRegex(pattern)
  }
  backend._cache.forEach(function (value, key, cache) {
    if (key.match(reg)) {
      cache.del(key)
    }
  })
  cb(null)
}

MemoryBackend.prototype.checksum = function (tags, cb) {
  var backend = this
  if (tags && tags.length) {
    cb(null, tags.reduce(function (sum, tag) {
      return sum + (backend._tags[tag] || 0)
    }, 0))
  } else {
    cb(null, 0)
  }
}

MemoryBackend.prototype.validate = function (item, cb) {
  var backend = this
  if (!item) {
    return cb(null, false)
  }
  if (item.ttl && ((item.ttl * 1000) < (Date.now() - item.timestamp))) {
    return backend.clear(item.key, function () {
      cb(null, false)
    })
  }
  backend.checksum(item.tags, function (err, checksum) {
    if (err) return cb(err)
    if (item.checksum < checksum) {
      return cb(null, false)
    }
    cb(null, true)
  })
}

module.exports = MemoryBackend
