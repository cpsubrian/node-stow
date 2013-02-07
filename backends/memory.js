function MemoryBackend (options) {
  this._cache = {};
  this._tags = {};
  this.ttl = options.ttl;
}

MemoryBackend.prototype.set = function (options, cb) {
  options.ttl = options.ttl || this.ttl;
  options.tags = options.tags || [];
  var backend = this;
  var item = {
    key: options.key,
    data: options.data,
    ttl: options.ttl,
    timestamp: Date.now(),
    tags: options.tags || []
  };
  backend.checksum(item.tags, function (err, checksum) {
    item.checksum = checksum;
    backend._cache[item.key] = item;
    process.nextTick(cb);
  });
};

MemoryBackend.prototype.get = function (key, cb) {
  var backend = this;
  process.nextTick(function () {
    var item = backend._cache[key];
    backend.validate(item, function (err, valid) {
      if (valid) {
        cb(null, item);
      }
      else {
        cb(null, false);
      }
    });
  });
};

MemoryBackend.prototype.invalidate = function (tags, cb) {
  var backend = this;
  tags.forEach(function (tag) {
    if (backend._tags[tag]) {
      backend._tags[tag]++;
    }
    else {
      backend._tags[tag] = 1;
    }
  });
  process.nextTick(cb);
};

MemoryBackend.prototype.clear = function (pattern, cb) {

};

MemoryBackend.prototype.checksum = function (tags, cb) {
  var backend = this;
  if (tags && tags.length) {
    cb(null, tags.reduce(function (sum, tag) {
      return sum + (backend._tags[tag] || 0);
    }, 0));
  }
  else {
    cb(null, 0);
  }
};

MemoryBackend.prototype.validate = function (item, cb) {
  var backend = this;
  process.nextTick(function () {
    if (!item) {
      return cb(null, false);
    }
    if (item.ttl && ((item.ttl * 1000) < (Date.now() - item.timestamp))) {
      return cb(null, false);
    }
    backend.checksum(item.tags, function (err, checksum) {
      if (item.checksum < checksum) {
        return cb(null, false);
      }
      cb(null, true);
    });
  });
};

module.exports = MemoryBackend;