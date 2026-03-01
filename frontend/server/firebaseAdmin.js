const admin = require("firebase-admin");

/*
  Render environment variable la
  FIREBASE_SERVICE_ACCOUNT nu full JSON string store panniruppa
*/

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Firebase initialize (once only)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;