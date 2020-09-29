const config = require('../../src/config/index.js')
const admin = require('firebase-admin');

admin.initializeApp({
    databaseURL: "https://draw-37e3c.firebaseio.com",
    credential: admin.credential.cert(config.firebaseConfig)
});

module.exports = {
    auth: admin.auth
}