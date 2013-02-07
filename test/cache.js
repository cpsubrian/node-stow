describe('Cache class', function () {

  describe('set() argument parsing', function () {
    var cache;
    var test = {
      key: 'test',
      data: 'data',
      ttl: 1337
    };

    function Backend() {}
    Backend.prototype = {};

    beforeEach(function () {
      cache = new stow.Cache(Backend);
    });

    it('should support the (options, cb) call style', function (done) {
      cache.backend.set = function (options, cb) {
        assert.deepEqual(options, test);
        assert.equal(typeof options.tags, 'undefined');
        cb(null);
      };
      cache.set(test, done);
    });

    it('should support the (key, data, cb) call style', function (done) {
      cache.backend.set = function (options, cb) {
        assert.equal(options.key, test.key);
        assert.equal(options.data, test.data);
        assert.equal(typeof options.ttl, 'undefined');
        assert.equal(typeof options.tags, 'undefined');
        cb(null);
      };
      cache.set(test.key, test.data, done);
    });

    it('should support the (key, data, ttl, cb) call style', function (done) {
      cache.backend.set = function (options, cb) {
        assert.deepEqual(options, test);
        assert.equal(typeof options.tags, 'undefined');
        cb(null);
      };
      cache.set(test.key, test.data, test.ttl, done);
    });

    it('should support the (key, data, tags, cb) call style', function (done) {
      var tags = {foo: 'bar'};
      cache.backend.set = function (options, cb) {
        assert.equal(options.key, test.key);
        assert.equal(options.data, test.data);
        assert.equal(typeof options.ttl, 'undefined');
        assert.deepEqual(options.tags, cache.flattenTags(tags));
        cb(null);
      };
      cache.set(test.key, test.data, tags, done);
    });

    it('should support the (key, data, ttl, tags, cb) call style', function (done) {
      var tags = {foo: 'bar'};
      cache.backend.set = function (options, cb) {
        assert.equal(options.key, test.key);
        assert.equal(options.data, test.data);
        assert.equal(options.ttl, test.ttl);
        assert.deepEqual(options.tags, cache.flattenTags(tags));
        cb(null);
      };
      cache.set(test.key, test.data, test.ttl, tags, done);
    });
  });

});