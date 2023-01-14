const config = require("../../src/config/index.js");
import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(config.firebaseConfig),
});

export default { auth: admin.auth, firestore: admin.firestore };
