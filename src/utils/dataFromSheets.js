const { google } = require('googleapis');
const keys = require('../../config/keys.json');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
	'https://www.googleapis.com/auth/spreadsheets',
]);

const regExp = new RegExp(/^[A-Z]{4}/, 'g');

let date = async function dayFetch(cl) {
	const gsapi = google.sheets({ version: 'v4', auth: cl });
	const opt = {
		spreadsheetId: '1f5AVKAXjVkLgaJbOCWwFz7i63uz0gKgD0hBJHuGG-hM',
		range: 'Data!B60',
	};
	const rawData = await gsapi.spreadsheets.values.get(opt);
	const mediumData = rawData.data.values;

	return mediumData[0][0];
};

let run = async function gsrun(cl) {
	const gsapi = google.sheets({ version: 'v4', auth: cl });

	const opt = {
		spreadsheetId: '1f5AVKAXjVkLgaJbOCWwFz7i63uz0gKgD0hBJHuGG-hM',
		range: 'Data!B1:F55',
	};

	const rawData = await gsapi.spreadsheets.values.get(opt);
	const mediumData = rawData.data.values;
	// const lettersOnlyCodesFromSheet = mediumData.map(function (data) {
	//   let tmp = data[0];
	//   return tmp.match(regExp)[0];
	// });
	return mediumData;
};

module.exports = { run, date };
