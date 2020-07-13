require('@google-cloud/debug-agent').start({ serviceContext: { enableCanary: false } });
const express = require('express');
const { google } = require('googleapis');
const keys = require('../config/keys.json');
const run = require('./app.js');
const { uploadTVGuide, db } = require('./utils/db.js');

const app = express();

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
	'https://www.googleapis.com/auth/spreadsheets',
]);

app.get('/', async (req, res) => {
	res.send('Created by Antonyuk Bogdan for HopeUA');
});

app.post('/fetchFromArchive', async (req, res) => {
	await run(client);
	res.send('Success!');
});

app.post('/upload', async (req, res) => {
	await uploadTVGuide();
	res.status(200).send();
});

app.get('/events', async (req, res) => {
	let startDate = new Date(req.query.date);
	let endDate = new Date(req.query.dateEnd);
	const completeData = { data: [] };
	if (!req.query.date && !req.query.dateEnd) {
		const snapshot = await db
			.collection('entities')
			.where('date', '>=', new Date())
			.limit(50)
			.orderBy('date')
			.get();
		snapshot.forEach((doc) => {
			let item = doc.data();
			item.date = item.date.toDate();
			completeData.data.push(item);
		});
		res.send(completeData);
	} else if (!req.query.date && req.query.dateEnd) {
		const snapshot = await db
			.collection('entities')
			.where('date', '<=', endDate)
			.limit(50)
			.orderBy('date')
			.get();
		snapshot.forEach((doc) => {
			let item = doc.data();
			item.date = item.date.toDate();
			completeData.data.push(item);
		});
		res.send(completeData);
	} else if (req.query.date && !req.query.dateEnd) {
		const snapshot = await db
			.collection('entities')
			.where('date', '>=', startDate)
			.limit(50)
			.orderBy('date')
			.get();
		snapshot.forEach((doc) => {
			let item = doc.data();
			item.date = item.date.toDate();
			completeData.data.push(item);
		});
		res.send(completeData);
	} else {
		const snapshot = await db
			.collection('entities')
			.where('date', '>=', startDate)
			.where('date', '<=', endDate)
			.orderBy('date')
			.get();
		snapshot.forEach((doc) => {
			let item = doc.data();
			item.date = item.date.toDate();
			completeData.data.push(item);
		});
		res.send(completeData);
	}
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}...`);
});
