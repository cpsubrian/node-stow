stow = require('../');
assert = require('assert');
util = require('util');
clone = require('clone');

// Test a backend.
testBackend = function (Backend, options) {
  options = options || {};

  var cache;

  beforeEach(function () {
    cache = stow.createCache(Backend, options);
  });

  it('should be able to set and get data', function (done) {
    var key = 'test';
    var data = 'foo';
    cache.set(key, data, function (err) {
      assert.ifError(err);
      cache.get(key, function (err, result) {
        assert.ifError(err);
        assert.equal(result.data, data);
        done();
      });
    });
  });

  it('should respect TTL', function (done) {
    var key = 'test';
    var data = 'foo';
    cache.set(key, data, 2, function (err) {
      assert.ifError(err);
      setTimeout(function () {
        cache.get(key, function (err, result) {
          assert.ifError(err);
          assert.equal(result.data, data);
          setTimeout(function () {
            cache.get(key, function (err, result) {
              assert.ifError(err);
              assert.strictEqual(result, false);
              done();
            });
          }, 1000);
        });
      }, 1250);
    });
  });

  it('should respect TTL 0 (unlimited)', function (done) {
    var key = 'test';
    var data = 'foo';
    cache.set(key, data, 0, function (err) {
      assert.ifError(err);
      setTimeout(function () {
        cache.get(key, function (err, result) {
          assert.ifError(err);
          assert.equal(result.data, data);
          done();
        });
      }, 1250);
    });
  });

  it('should respect cache invalidations', function (done) {
    var options = {
      key: 'test',
      data: 'foo',
      tags: {bar: 'baz'}
    };
    cache.set(clone(options), function (err) {
      assert.ifError(err);
      cache.invalidate({bar: 'baz'}, function (err) {
        assert.ifError(err);
        cache.get(options.key, function (err, result) {
          assert.ifError(err);
          assert.strictEqual(result, false);
          cache.set(clone(options), function (err) {
            assert.ifError(err);
            cache.get(options.key, function (err, result) {
              assert.ifError(err);
              assert.equal(result.data, options.data);
              cache.invalidate({bar: 'baz'}, function (err) {
                assert.ifError(err);
                cache.get(options.key, function (err, result) {
                  assert.ifError(err);
                  assert.strictEqual(result, false);
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should ignore non-matching cache invalidations', function (done) {
    var options = {
      key: 'test',
      data: 'foo',
      tags: {bar: 'baz'}
    };
    cache.set(options, function (err) {
      assert.ifError(err);
      cache.invalidate({hax: 'uber'}, function (err) {
        assert.ifError(err);
        cache.get(options.key, function (err, result) {
          assert.ifError(err);
          assert.equal(result.data, options.data);
          done();
        });
      });
    });
  });

  it('should clear by key', function (done) {
    var options = {
      key: 'test',
      data: 'foo',
      tags: {bar: 'baz'}
    };
    cache.set(options, function (err) {
      assert.ifError(err);
      cache.clear(options.key, function (err) {
        assert.ifError(err);
        cache.get(options.key, function (err, result) {
          assert.ifError(err);
          assert.strictEqual(result, false);
          done();
        });
      });
    });
  });
  it('should clear by wildcard pattern', function (done) {
    var options = {
      key: 'test:1',
      data: 'foo',
      tags: {bar: 'baz'}
    };
    cache.set(options, function (err) {
      assert.ifError(err);
      cache.clear('test:*', function (err) {
        assert.ifError(err);
        cache.get(options.key, function (err, result) {
          assert.ifError(err);
          assert.strictEqual(result, false);
          done();
        });
      });
    });
  });
};