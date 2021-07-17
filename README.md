# Serverless InMemory Redis

### Initial Goals:

- Create an inmemory temporal redis server, which can be run from a serverless function for zero-persistence Redis needs. I'm not sure if there is a true Production use-case here, but you never know.
    - I'm writing this to:
        - Work out if I can
        - Use it for a shared BottleneckJs queue until I bother to add real Redis to the project (I may never replace this, since Bottleneck queues functions, so they cannot be persisted on Redis anyway)
- Works in Vercel NextJS serverless functions
    - Inspo: [https://github.com/vercel/next.js/blob/canary/examples/with-passport-and-next-connect/pages/api/users.js](https://github.com/vercel/next.js/blob/canary/examples/with-passport-and-next-connect/pages/api/users.js)
    - Potentially possible to export a total custom handler, which awaits and accepts a redis protocol connection
    - Concerns:
        - Will it work in NextJS?
        - Will it work on Vercel or other similar hosting provider? What requirements do they have to accept and create a serverless function? Possibly they just attempt to build and host the code??
- Listens for a `redis:` protocol connection with username/password auth
    - [https://nodejs.org/dist/latest-v14.x/docs/api/net.html#net_server_listen](https://nodejs.org/dist/latest-v14.x/docs/api/net.html#net_server_listen)
    - [https://redis.io/topics/protocol](https://redis.io/topics/protocol)
    - [https://rohitpaulk.com/articles/redis-0](https://rohitpaulk.com/articles/redis-0)
    - [https://www.charlesleifer.com/blog/building-a-simple-redis-server-with-python/](https://www.charlesleifer.com/blog/building-a-simple-redis-server-with-python/)
- Wraps a JS array of objects in a set of basic functions which provide the needed functionality of `GET`, `SET`, `TAKE`, `FLUSH`, ttl, expiry, etc

### Phase 2:

- Upgrade the "redis" array into WASM Rust code which handles this in a much more concurrent and performant manner.
    - Many questions here about how.
    - [https://nodejs.org/dist/latest-v14.x/docs/api/wasi.html](https://nodejs.org/dist/latest-v14.x/docs/api/wasi.html)
- C++ node addons instead of Rust?
    - [https://nodejs.org/dist/latest-v14.x/docs/api/addons.html](https://nodejs.org/dist/latest-v14.x/docs/api/addons.html)
- Threading in NET module