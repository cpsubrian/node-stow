describe('Redis Backend', function () {
  var client = redis.createClient(['localhost:6379']);
  var options = {
    client: client,
    prefix: 'stow:test:' + Date.now() + ':'
  };

  after(function (done) {
    client.keys(options.prefix + '*', function (err, keys) {
      if (err) return done(err);
      client.del(keys, done);
    });
  });

  testBackend(stow.backends.Redis, options);
});