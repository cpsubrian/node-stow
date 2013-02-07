stow = require('../');
assert = require('assert');
util = require('util');
redis = require('haredis');

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
              assert.strictEqual(result, null);
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
      key: 'testString',
      data: 'foo',
      tags: {bar: 'baz'}
    };
    testInvalidate(options, {bar: 'baz'}, done);
  });

  it('should respect numeric tags', function (done) {
    var options = {
      key: 'testNumeric',
      data: 'foo',
      tags: {lorem: 1}
    };
    testInvalidate(options, {lorem: 1}, done);
  });

  it('should respect arrays of tags', function (done) {
    var options = {
      key: 'testArray',
      data: 'foo',
      tags: {
        nums: [1, 2, 7],
        letters: ['a', 'b', 'c', 'd']
      }
    };
    testInvalidate(options, {nums: 2}, done);
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

  it('should handle multiple items with multiple tags', function (done) {
    cache.set('coke', 'coke', {id: 4, terms: ['drink', 'soda']}, function (err) {
      assert.ifError(err);
      cache.set('sprite', 'sprite', {id: 5, terms: ['drink', 'soda', 'clear']}, function (err) {
        assert.ifError(err);
        cache.set('burger', 'burger', {id: 6, terms: ['food', 'beef', 'cheese']}, function (err) {
          assert.ifError(err);
          cache.invalidate({terms: 'soda'}, function (err) {
            assert.ifError(err);
            cache.get('coke', function (err, result) {
              assert.ifError(err);
              assert.strictEqual(result, null);
              cache.get('sprite', function (err, result) {
                assert.ifError(err);
                assert.strictEqual(result, null);
                cache.get('burger', function (err, result) {
                  assert.ifError(err);
                  assert.strictEqual(result.data, 'burger');
                  done();
                });
              });
            });
          });
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
          assert.strictEqual(result, null);
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
          assert.strictEqual(result, null);
          done();
        });
      });
    });
  });

  // Test helpers:
  function testInvalidate (options, tags, done) {
    cache.set(options, function (err) {
      assert.ifError(err);
      cache.invalidate(tags, function (err) {
        assert.ifError(err);
        cache.get(options.key, function (err, result) {
          assert.ifError(err);
          assert.strictEqual(result, null);
          cache.set(options, function (err) {
            assert.ifError(err);
            cache.get(options.key, function (err, result) {
              assert.ifError(err);
              assert.equal(result.data, options.data);
              cache.invalidate(tags, function (err) {
                assert.ifError(err);
                cache.get(options.key, function (err, result) {
                  assert.ifError(err);
                  assert.strictEqual(result, null);
                  done();
                });
              });
            });
          });
        });
      });
    });
  }

};