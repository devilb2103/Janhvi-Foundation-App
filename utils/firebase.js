const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
	credential: admin.credential.cert(
		require('./janhvi-attendance-app-demo-firebase-adminsdk-bvdgo-bf11d86c1c.json')
	),
	databaseURL: process.env.DATABASE_URL,
});

const db = admin.database();

module.exports = { db };
