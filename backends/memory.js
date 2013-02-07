

function MemoryBackend (options) {
  this._cache = {};
  this._tags = {};
}

MemoryBackend.prototype.set = function (options, cb) {

};

MemoryBackend.prototype.get = function (key, cb) {

};

MemoryBackend.prototype.invalidate = function (tags, cb) {

};

MemoryBackend.prototype.clear = function (pattern, cb) {

};

module.exports = MemoryBackend;