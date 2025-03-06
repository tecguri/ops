const Redis = require("ioredis");

const redis = new Redis({
    host: "127.0.0.1",  
    port: 6380,         
    connectTimeout: 10000,
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});

console.log("Redis client connected");

module.exports = redis;
