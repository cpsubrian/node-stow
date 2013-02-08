var redis = require('haredis')
  , hydration = require('hydration');

function RedisBackend (options) {
  this.ttl = options.ttl;
  this.prefix = options.prefix || 'stow:';
  if (options.client) {
    this.client = options.client;
  }
  else if (options.nodes) {
    this.client = redis.createClient(options.nodes, options);
  }
  else {
    this.client = redis.createClient(['localhost:6379'], options);
  }
  if (options.db) {
    this.client.select(db);
  }
}

RedisBackend.prototype.key = function () {
  return this.prefix + Array.prototype.slice.call(arguments, 0 ).join(':');
};

RedisBackend.prototype.set = function (options, cb) {
  var backend = this;
  var item = {
    key: options.key,
    data: options.data,
    ttl: (typeof options.ttl !== 'undefined') ? options.ttl : this.ttl,
    timestamp: Date.now(),
    tags: options.tags || []
  };
  backend.checksum(item.tags, function (err, checksum) {
    if (err) return cb(err);
    item.checksum = checksum;
    var data;
    try {
      data = JSON.stringify(hydration.dehydrate(item));
    }
    catch (e) {
      return cb(e);
    }
    if (item.ttl) {
      backend.client.setex(backend.key(item.key), item.ttl, data, cb);
    }
    else {
      backend.client.set(backend.key(item.key), data, cb);
    }
  });
};

RedisBackend.prototype.get = function (key, cb) {
  var backend = this;
  backend.client.get(backend.key(key), function (err, result) {
    if (err) return cb(err);
    if (!result) return cb(null, null);
    var item;
    try {
      item = hydration.hydrate(JSON.parse(result));
    }
    catch (e) {
      return cb(e);
    }
    backend.validate(item, function (err, valid) {
      if (valid) {
        cb(null, item);
      }
      else {
        cb(null, null);
      }
    });
  });
};

RedisBackend.prototype.invalidate = function (tags, cb) {
  var backend = this;
  if (tags && tags.length) {
    var multi = backend.client.multi();
    tags.forEach(function (tag) {
      multi.incr(backend.key('tags', tag));
    });
    multi.exec(cb);
  }
  else {
    cb();
  }
};

RedisBackend.prototype.clear = function (pattern, cb) {
  var backend = this;
  backend.client.keys(backend.key(pattern), function (err, keys) {
    if (err) return cb(err);
    if (!keys || !keys.length) return cb();
    // Batching delete calls. Should do more research here on what limits
    // make sense.
    var batch, multi = backend.client.multi();
    while (keys.length) {
      multi.del(keys.splice(0, 500));
    }
    multi.exec(cb);
  });
};

RedisBackend.prototype.checksum = function (tags, cb) {
  var backend = this;
  if (tags && tags.length) {
    var multi = backend.client.multi();
    tags.forEach(function (tag) {
      multi.get(backend.key('tags', tag));
    });
    multi.exec(function (err, result) {
      if (err) return cb(err);
      cb(null, result.reduce(function (sum, count) {
        count = count ? parseInt(count, 10) : 0;
        return sum + count;
      }, 0));
    });
  }
  else {
    cb(null, 0);
  }
};

RedisBackend.prototype.validate = function (item, cb) {
  var backend = this;
  if (item.tags) {
    backend.checksum(item.tags, function (err, checksum) {
      if (err) return cb(err);
      if (item.checksum < checksum) {
        return cb(null, false);
      }
      cb(null, true);
    });
  }
  else {
    cb(null, true);
  }
};

module.exports = RedisBackend;