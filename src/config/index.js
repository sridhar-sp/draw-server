const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  appName: process.env.APP_NAME,
  port: process.env.PORT,
  accessToken: {
    secret: process.env.ACCESS_TOKEN_SECRET,
    lifeInSeconds: process.env.ACCESS_TOKEN_LIFE_IN_SECONDS,
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET,
    lifeInSeconds: process.env.REFRESH_TOKEN_LIFE_IN_SECONDS,
  },
  firebaseConfig: JSON.parse(process.env.FIREBASE_CONFIG),
  redisURL: process.env.REDIS_URL ? process.env.REDIS_URL : "",
  rabbitMQUrl: process.env.RABBIT_MQ_URL ? process.env.RABBIT_MQ_URL : "",
};
