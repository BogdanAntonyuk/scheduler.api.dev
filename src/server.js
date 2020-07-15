require('@google-cloud/debug-agent').start({ serviceContext: { enableCanary: false } });
const express = require('express');
const { google } = require('googleapis');
const moment = require('moment-timezone');
const keys = require('../config/keys.json');
const db = require('./utils/db.js');
const {
  insertDataFromDB2YourHopeIntoSpreadSheet,
  fetchAfterEdit,
} = require('./insertDataIntoSpreadSheets.js');
const { getYYYmmDD, getDataFromSpreadSheet } = require('./utils/dataFromSheets.js');
const fetchPrName = require('./utils/fetchPrName');

const app = express();

app.use(express.urlencoded({ extended: true }));

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

app.get('/', async (req, res) => {
  res.send('Created by Antonyuk Bogdan for HopeUA');
});

app.post('/fetchFromArchive', async (req, res) => {
  await insertDataFromDB2YourHopeIntoSpreadSheet(req.body.sheetId, req.body.sheetName);

  res.send('Success!');
});

app.post('/upload', async (req, res) => {
  const regExp = new RegExp(/^[A-Z]{4}/, 'g');
  let dateFromSheet = await getYYYmmDD(client, req.body.sheetId, req.body.sheetName); // fetching date from Sheet (2020-07-13)
  let data = await getDataFromSpreadSheet(client, req.body.sheetId, req.body.sheetName); // fetching all necessary data from Sheet
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

  res.status(200).send();
});

app.post('/update', async (req, res) => {
  await fetchAfterEdit(req.body.sheetId, req.body.sheetName, req.body.range);
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
    snapshot.forEach(doc => {
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
    snapshot.forEach(doc => {
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
    snapshot.forEach(doc => {
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
    snapshot.forEach(doc => {
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
