const config = require('../../src/config/index.js')
import admin from 'firebase-admin'

admin.initializeApp({
    databaseURL: "https://draw-37e3c.firebaseio.com",
    credential: admin.credential.cert(config.firebaseConfig)
});

export default { auth: admin.auth }