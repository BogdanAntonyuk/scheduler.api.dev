const admin = require('firebase-admin');
const firebaseKeys = require('../../config/firebaseKeys.json');

admin.initializeApp({
	credential: admin.credential.cert(firebaseKeys),
});

const db = admin.firestore();

module.exports = db;
