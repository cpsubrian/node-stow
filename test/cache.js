describe('Cache class', function () {

  describe('cache.set()', function () {
    var cache;
    var test = {
      key: 'test',
      data: 'data',
      ttl: 1337
    };

    function Backend() {}

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

  describe('cache.flattenTags()', function () {
    var cache;
    function Backend() {}

    beforeEach(function () {
      cache = new stow.Cache(Backend);
    });

    it('should with with primatives', function () {
      var tags = {
        foo: 'bar'
      };
      var flat = cache.flattenTags(tags);
      assert.equal(flat.length, 1);
      assert.equal(flat[0], 'foo:bar');
    });

    it('should work with arrays', function () {
      var tags = {
        foo: ['bar', 'baz']
      };
      var flat = cache.flattenTags(tags);
      assert.equal(flat.length, 2);
      assert.equal(flat[0], 'foo:bar');
      assert.equal(flat[1], 'foo:baz');
    });

    it('should work with multiple keys', function () {
      var tags = {
        foo: 1,
        bar: [2, 3, 4]
      };
      var flat = cache.flattenTags(tags);
      assert.equal(flat.length, 4);
      assert.equal(flat[0], 'foo:1');
      assert.equal(flat[3], 'bar:4');
    });
  });

  describe('cache.clear()', function () {
    function Backend() {}
    Backend.prototype.clear = function (pattern, cb) {
      assert.equal(pattern, '*');
      cb(null);
    };
    var cache = new stow.Cache(Backend);
    it('should default the pattern to "*"', function (done) {
      cache.clear(done);
    });
  });

});