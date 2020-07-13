const admin = require('firebase-admin');
const { google } = require('googleapis');
const keys = require('../../config/keys.json');
const firebaseKeys = require('../../config/firebaseKeys.json');
const { run, date } = require('./dataFromSheets.js');
const fetchPrName = require('./fetchPrName');
const moment = require('moment-timezone');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
	'https://www.googleapis.com/auth/spreadsheets',
]);

admin.initializeApp({
	credential: admin.credential.cert(firebaseKeys),
});

const db = admin.firestore();

async function uploadTVGuide() {
	const regExp = new RegExp(/^[A-Z]{4}/, 'g');
	let dateFromSheet = await date(client); // fetching date from Sheet (2020-07-13)
	let data = await run(client); // fetching all necessary data from Sheet
	data.map(async function (e) {
		try {
			let documentName = dateFromSheet + 'T' + e[1] + ':00';
			let letters = e[0].match(regExp)[0]; // extract only letters (EPLU03219 => EPLU)
			let prDate = moment.tz(dateFromSheet + 'T' + e[1] + ':00', 'Europe/Kiev').toDate();

			if (e[2] === 'Episode not found') {
				const fetchedData = await fetchPrName(letters);
				e[2] = fetchedData.title;
				e[3] = fetchedData.description.short;
				e[4] = null;
			}
			ref = await db
				.collection('entities')
				.doc(documentName)
				.set({
					id: documentName, //uses id: for avoid duplicates and rewrites entity when same
					date: prDate,
					show: { uid: letters, title: e[2], description: { short: e[3] }, code: letters },
					episode: { uid: e[0], title: e[4], description: e[3], language: null, code: e[0] },
				});
		} catch (e) {
			if (e) console.log(e);
		}
	});
}

module.exports = { uploadTVGuide, db };
