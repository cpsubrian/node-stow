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

