stow - Backend Spec
===================

Backends are responsible for storage, retrieval and invalidation.
Stow ships with a memory backend for testing and a Redis backend for
production use. If you wish to create another backend please follow this
spec.

Backend (Class)
--------------------

Backends are constructor functions with prototypes implementing ALL the required
caching methods. Your backend module should export a single 'class'.

```js
function MyBackend (options) {
  options = options || {};
  // ...
}

// Prototype methods ...

module.exports = MyBackend.
```

### Constructor

The constructor accepts an options hash. All backends should support a default
`ttl` option. The rest of the options will depend on the details of the
backend and what datasources it interfaces with.

### Required Methods

The stow `Cache` class will make calls to you backend. The absolute bare minimum
implemention must include the following methods:

#### MyBackend.prototype.set = function (options, cb)

Should save items to the cache.

Options:

- `key`: The key used identify the cached item.
- `data`: The data to cache. Should support all primative types as well as
  Arrays and Objects. The recommended storage technique is to serialize with
  [hydration](https://github.com/carlos8f/hydration).
- `ttl`: Optional. The number of seconds until the cached item should expire.
- `tags`: Optional. A flattened array of tags to associate with the cached item.


#### MyBackend.prototype.get = function (key, cb)

#### MyBackend.prototype.invalidate = function (tags, cb)

#### MyBackend.prototype.clear = function (pattern, cb)


MORE DOCUMENTATION COMING SOON