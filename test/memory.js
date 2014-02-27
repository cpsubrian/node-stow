describe('Memory Backend', function () {
  stow.backends.Memory.prototype._length = function (cb) {
    return cb(null, Object.keys(this._cache).length);
  };
  testBackend(stow.backends.Memory);
});