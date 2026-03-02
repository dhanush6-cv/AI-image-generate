const admin = require("firebase-admin");

function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  // ✅ if env missing, throw clear error
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT env missing. Render/Local .env la set pannu."
    );
  }

  // ✅ sometimes env has \n as \\n
  const fixed = raw.replace(/\\n/g, "\n");

  try {
    return JSON.parse(fixed);
  } catch (e) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON. Single-line JSON correct ah paste pannu."
    );
  }
}

const serviceAccount = loadServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

module.exports = { admin, db };