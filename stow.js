const Cache = (function() {
  function Cache(backend, options) {
    this.backend = backend;
    this.options = options || {};
  }

  Cache.prototype.set = function(key, data, ttl, tags, cb) {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type');
    }

    const options = {
      key,
      data,
      ttl,
      tags
    };

    if (typeof cb !== 'function') {
      throw new Error('Invalid callback type');
    }

    this.backend.set(options, cb);
  };

  Cache.prototype.get = function(key, cb) {
    if (typeof key !== 'string') {
      throw new Error('Invalid key type');
    }

    const options = {
      key
    };

    if (typeof cb !== 'function') {
      throw new Error('Invalid callback type');
    }

    this.backend.get(options, cb);
  };

  Cache.prototype.invalidate = function(tags, cb) {
    if (typeof tags !== 'object') {
      throw new Error('Invalid tags type');
    }

    const options = {
      tags: this.flattenTags(tags)
    };

    if (typeof cb !== 'function') {
      throw new Error('Invalid callback type');
    }

    this.backend.invalidate(options, cb);
  };

  Cache.prototype.clear = function(pattern, cb) {
    if (typeof pattern !== 'string') {
      throw new Error('Invalid pattern type');
    }

    const options = {
      pattern
    };

    if (typeof cb !== 'function') {
      throw new Error('Invalid callback type');
    }

    this.backend.clear(options, cb);
  };

  Cache.prototype.flattenTags = function(tags) {
    if (!tags) {
      return [];
    }

    const norm = [];

    for (const key in tags) {
      if (tags.hasOwnProperty(key)) {
        const tag = tags[key];

        if (Array.isArray(tag)) {
          for (const t of tag) {
            norm.push(key + ':' + t);
          }
        } else {
          norm.push(key + ':' + tag);
        }
      }
    }

    return norm;
  };

  return Cache;
})();

module.exports = {
  createCache: function createCache(Backend, options) {
    return new Cache(Backend, options);
  },
  Cache: Cache
};
