const dotenv = require('dotenv')

dotenv.config();

module.exports = {
    port: process.env.PORT,
    accessToken: {
        secret: process.env.ACCESS_TOKEN_SECRET,
        lifeInSeconds: process.env.ACCESS_TOKEN_LIFE_IN_SECONDS
    },
    refreshToken: {
        secret: process.env.REFRESH_TOKEN_SECRET,
        lifeInSeconds: process.env.REFRESH_TOKEN_LIFE_IN_SECONDS
    },
    firebaseConfig: JSON.parse(process.env.FIREBASE_CONFIG)

}