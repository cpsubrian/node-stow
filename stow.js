// Export the createCache function and the Cache constructor
module.exports = {
  createCache: (Backend, options) => new Cache(Backend, options),
  Cache,
};

// Cache constructor
function Cache(Backend, options = {}) {
  // Set default options and merge with provided options
  const opts = {
    ttl: 0,
    ...options,
  };
  // Initialize backend with options
  this.backend = new Backend(opts);
}

// Set method for the Cache prototype
Cache.prototype.set = function (key, data, ttl, tags, cb) {
  let options = {};

  // If the first argument is an object, copy its properties to options
  if (typeof key !== "string") {
    options = { ...key };
    cb = data;
  } else {
    // Otherwise, set options based on the provided arguments
    options.key = key;
    options.data = data;
    if (typeof ttl === "function") {
      cb = ttl;
    } else if (typeof tags === "function") {
      cb = tags;
      if (typeof ttl === "number") {
        options.ttl = ttl;
      } else {
        options.tags = ttl;
      }
    } else {
      options.ttl = ttl;
      options.tags = tags;
    }
  }

  // Validate options and call the callback with an error if necessary
  if (typeof options.key === "undefined") {
    return cb(new Error("No key passed to cache.set()"));
  }
  if (typeof options.data === "undefined") {
    return cb(new Error("No data passed to cache.set()"));
  }

  // Flatten tags if they exist
  if (options.tags) {
    options.tags = this.flattenTags(options.tags);
  }

  // Call the backend set method with the options and callback
  this.backend.set(options, cb);
};

// Get method for the Cache prototype
Cache.prototype.get = function (key, cb) {
  this.backend.get(key, cb);
};

// Invalidate method for the Cache prototype
Cache.prototype.invalidate = function (tags, cb) {
  this.backend.invalidate(this.flattenTags(tags), cb);
};

// Clear method for the Cache prototype
Cache.prototype.clear = function (pattern, cb) {
  if (typeof pattern === "function") {
    cb = pattern;
    pattern = "*";
  }
  this.backend.clear(pattern, cb);
};

// Flatten tags helper method
Cache.prototype.flattenTags = function (tags) {
  // If tags is already an array, return it
  if (Array.isArray(tags)) {
    return tags;
  }
  // Use a Set to store unique flattened tags
  const norm = new Set();
  // Iterate through tag keys and values, flatten them, and add to the Set
  Object.keys(tags).forEach((key) =>
    (Array.isArray(tags[key]) ? tags[key] : [tags[key]]).forEach((tag) =>
      norm.add(`${key}:${tag}`)
    )
  );
  // Convert the Set back to an array and return it
  return Array.from(norm);
};
