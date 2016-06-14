var globToRegex = require('../globToRegex')

function MemoryBackend (options) {
  this._cache = {}
  this._tags = {}
  this.ttl = options.ttl
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
    backend._cache[item.key] = item
    cb()
  })
}

MemoryBackend.prototype.get = function (key, cb) {
  var backend = this
  var item = backend._cache[key]
  backend.validate(item, function (err, valid) {
    if (err) return cb(err)
    if (valid) {
      cb(null, item)
    } else {
      cb(null, null)
    }
  })
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
    backend._cache = {}
  } else if (pattern.indexOf('*') < 0) {
    delete backend._cache[pattern]
  } else {
    var reg = globToRegex(pattern)
    Object.keys(backend._cache).filter(RegExp.prototype.test.bind(reg)).forEach(function (tag) {
      delete backend._cache[tag]
    })
  }
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
