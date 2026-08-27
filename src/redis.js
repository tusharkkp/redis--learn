const { createClient } = require("redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

async function connectRedis() {
  await redisClient.connect();
}

module.exports = {
  redisClient,
  connectRedis,
};
