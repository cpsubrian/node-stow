module.exports = {
  createCache: function createCache (options) {
    return new Cache(options);
  },
  Cache: Cache,
  backends: {
    Memory: require('./backends/memory'),
    Redis: require('./backends/redis')
  }
};

function Cache (Backend, options) {
  options = options || {};
  options.ttl = options.ttl || 0;
  this.backend = new Backend(options);
}

Cache.prototype.set = function (key, data, ttl, tags, cb) {
  var options = {};

  // Support set(options, cb) style calling.
  if (typeof key !== 'string') {
    options = key;
    cb = data;
  }
  // Parse arguments.
  else {
    options.key = key;
    options.data = data;
    if (typeof ttl === 'function') {
      cb = ttl;
    }
    else if (typeof tags === 'function') {
      cb = tags;
      if (typeof ttl === 'number') {
        options.ttl = ttl;
      }
      else {
        options.tags = ttl;
      }
    }
    else {
      options.ttl = ttl;
      options.tags = tags;
    }
  }

  if (options.tags) {
    options.tags = this.flattenTags(options.tags);
  }

  if (typeof options.key === 'undefined') {
    throw new Error('No key passed to cache.set()');
  }
  if (typeof options.data === 'undefined') {
    throw new Error('No data passed to cache.set()');
  }
  if (typeof cb !== 'function') {
    throw new Error('No callback passed to cache.set()');
  }

  this.backend.set(options, cb);
};

Cache.prototype.get = function (key, cb) {
  this.backend.get(key, cb);
};

Cache.prototype.invalidate = function (tags, cb) {
  this.backend.invalidate(this.flattenTags(tags), cb);
};

Cache.prototype.clear = function (pattern, cb) {
  if (typeof pattern === 'function') {
    cb = pattern;
    pattern = '*';
  }
  this.backend.clear(pattern, cb);
};

Cache.prototype.flattenTags = function (tags) {
  var norm = [];
  Object.keys(tags).forEach(function (key) {
    if (!Array.isArray(tags[key])) {
      tags[key] = [tags[key]];
    }
  });
  Object.keys(tags).forEach(function (key) {
    tags[key].forEach(function (tag) {
      var flat = key + ':' + tag;
      if (norm.indexOf(flat) < 0) {
        norm.push(flat);
      }
    });
  });
  return norm;
};
