stow
====

Node.js caching with a flexible invalidation strategy.

[![build status](https://secure.travis-ci.org/cpsubrian/node-stow.png)](http://travis-ci.org/cpsubrian/node-stow)

> There are only two hard things in Computer Science: cache invalidation and naming things.
>
> -- Phil Karlton

The oft-tweeted quote above, while mostly just a humorous anecdote, can often
feel like reality. **Stow** aims to solve both problems with an easy-to-remember
name and a caching API built around tag-based invalidation.

Usage
-----

```js
var stow = require('stow');

// Create your cache.
var cache = stow.createCache(stow.backends.Redis, {
  nodes: ['localhost:6379']
});

// Add items to the cache.
cache.set('my:cache:key', 'my data', {'user': 47, 'comment': [4, 82, 199]}, function (err) {

});
// Or use an options hash.
cache.set({
  key: 'my:cache:key',
  data: {my: 'data'},
  ttl: 3600 * 24, // TTL in seconds
  tags: {user: 52}
}, function (err) {

});

// Retreive from the cache.
cache.get('my:cache:key', function (err, result) {
  // result.data contains your data.
  // result is `false` on a cache miss.
});

// Invalidate items based on one or more tag(s).
cache.invalidate({'user': 47}, function (err) {
  // Cached data 'tagged' with user 47 was invalidated.
});

// Clear items (using wildcard)
cache.clear('my:cache:*', function (err) {

});
```

API
---

### stow.createCache ( backend , [options] )

- `backend` - The backend class to use.
- `options` - Constructor options passed to the backend when it is created.
- **returns** an instance of `stow.Cache`.

```js
  var stow = require('stow')
    , cache = stow.createCache(stow.backends.Memory, {ttl: 3600});
```

### stow.backends

An object containing stow's bundled backends classes.

### stow.Cache (Class)

Class that exposes the public cache methods.

#### Instance Properties

##### cache.backend

Reference to the Backend instance for this cache.

#### Instance Methods

##### cache.set ( options , cb )

Add items to the cache.

- `options`
    - `key` - A unique string identifying the cached item.
    - `data` - The data you wish to cache. Will be serialized via [hydration](https://github.com/carlos8f/hydration).
    - `ttl` - Time until cache expires (in seconds). Defaults to 0 (unlimited).
    - `tags` - An Object containing the tags to associate with this cached item.
- `cb (err)` - Called after the item has been cached.

##### cache.set ( key, data, [ttl], [tags], cb)

Add items to the cache (alternative syntax).

- `key` - A unique string identifying the cached item.
- `data` - The data you wish to cache. Will be serialized via [hydration](https://github.com/carlos8f/hydration).
- `ttl` - Time until cache expires (in seconds). Defaults to 0 (unlimited).
- `tags` - An Object containing the tags to associate with this cached item.
- `cb (err)` - Called after the item has been cached.

##### cache.get ( key, cb )

Retrieve items from the cache.

- `key` - A unique string identifying the cached item.
- `cb (err, result)` - Called when the item has been retrieved.
    - `err` - The retrieval error, if any.
    - `result` - The cached item along with cache metadata.
        - `result.data` - Your cached data, unserialized.

##### cache.invalidate ( tags, cb )

Invalidate cached items if they were tagged with ANY of the passed tags.

- `tags` - An Object containing the tags to invalidate.
- `cb (err)` - Called after the invalidation is complete.

##### cache.clear ( [key] , cb)

Clear items from the cache by key or wildcard key pattern.

- `key` - A string identidying the item to clear, or a wildcard pattern that will
  clear multiple cached items. Examples: `my:cache:key`, `users:*`, `*:formatted:*`.
  **WARNING**: Depending on the backend used and the size of your cache, wildcard
  clears can be quite slow and expensive. Use with care.
- `cb (err)` - Called after the clear is complete.


Backends
--------

Backends are responsible for storage, retrieval and invalidation. Stow ships with
a memory backend for testing and a Redis backend for production use.  If
you wish to create another backend please check out the [Backend Spec](https://github.com/cpsubrian/node-stow/blob/master/BACKEND.md).

### Memory Backend

The memory backend stores the cache in your node process' local memory space.
This backend is suitable for testing and development but has not been optimized
for performance or long-term use.

```js
var stow = require('stow')
  , options = {}
  , cache = stow.createCache(stow.backends.Memory, options);
```

Options:

- `ttl` - Default TTL to use for ALL cached items. Can be overriden per cache
  set. Defaults to 0 (unlimited).

### Redis Backend

The Redis backend stores cached items in Redis via [haredis](https://github.com/carlos8f/haredis).
It uses TTL support baked into Redis and is otherwise optimized for production use.

```js
var stow = require('stow')
  , options = {
      nodes: ['localhost:6379']
    }
  , cache = stow.createCache(stow.backends.Redis, options);
```

Options:

- `nodes` - The backend will create a redis client connected these nodes.
  Supports all node formats that haredis does.
- `client` - Overrides `nodes`. The backend will use this redis client.
- `ttl` - Default TTL to use for ALL cached items. Can be overriden per cache
  set. Defaults to 0 (unlimited).
- `prefix` - A string to prefix all redis keys with. Default: 'stow:'.

Credits
-------

**Stow** is based on the excellent Drupal cache module: [CacheTags](http://drupal.org/project/cachetags).
The invalidation strategy used in CacheTags has been in high-traffic production
deployments with millions of objects for more than 2 years.

- - -

### Developed by [Terra Eclipse](http://www.terraeclipse.com)
Terra Eclipse, Inc. is a nationally recognized political technology and
strategy firm located in Aptos, CA and Washington, D.C.

- - -

### License: MIT
Copyright (C) 2013 Terra Eclipse, Inc. ([http://www.terraeclipse.com](http://www.terraeclipse.com))

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
