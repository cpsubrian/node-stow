module.exports = {
  createCache: function createCache (options) {
    return new Cache(options);
  },
  MemoryBackend: require('./backends/memory'),
  RedisBackend: require('./backends/redis')
};

function Cache (options) {
  options = options || {};
}

Cache.prototype.set = function () {

};

