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
var cache = stow.createCache(stow.backends.redis, {
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

Full API here.

Backends
--------

Document cache backends (memory, redis, etc.) here.

Credits
-------

**Stow** is based on the excellent Drupal cache module: [CacheTags](http://drupal.org/project/cachetags).
The invalidation strategy used in CacheTags has been in successful,
high-traffic production deployments with millions of objects for more than 2 years.

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
