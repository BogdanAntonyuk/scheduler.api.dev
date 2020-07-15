const { google } = require('googleapis');
const keys = require('../config/keys.json');
const getEpisode = require('./utils/getEpisode.js');
const updateDescription = require('./utils/updateDescription.js');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

const gsapi = google.sheets({ version: 'v4', auth: client });
const regExp = new RegExp(/^[A-Z]{4}/, 'g');

async function insertDataFromDB2YourHopeIntoSpreadSheet(sheetID, sheetName) {
  const opt = {
    spreadsheetId: sheetID,
    range: sheetName + '!B1:B55',
  };
  let prNames = [];
  let fetchedData = [];
  let commercialBr = [];
  let descr = [];

  const rawData = await gsapi.spreadsheets.values.get(opt);
  const mediumData = rawData.data.values;
  const lettersOnlyCodesFromSheet = mediumData.map(function (str1) {
    return str1.map(function (str2) {
      return str2.match(regExp)[0];
    });
  });

  for (i = 0; i < mediumData.length; i++) {
    fetchedData.push(await getEpisode(mediumData[i])); // fetching object from http://db2.yourhope.tv/api/episodes/'
    descr.push(await updateDescription(lettersOnlyCodesFromSheet[i])); // fetching object from http://db2.yourhope.tv/api/shows/
  }
  for (j = 0; j < fetchedData.length; j++) {
    if (fetchedData[j].error) {
      prNames.push(new Array(fetchedData[j].error.message));
      commercialBr.push(new Array());
    } else if (descr[j].error) {
      descr[j].error.message;
    } else if (!fetchedData[j].timeline_break) {
      commercialBr.push(new Array());
      prNames.push(
        new Array(
          fetchedData[j].show.title,
          descr[j].description.short,
          fetchedData[j].title,
          fetchedData[j].duration
        )
      );
    } else {
      commercialBr.push(new Array(fetchedData[j].timeline_break));
      prNames.push(
        new Array(
          fetchedData[j].show.title,
          descr[j].description.short,
          fetchedData[j].title,
          fetchedData[j].duration
        )
      );
    }
  }

  const updateOptionsForPrNames = {
    spreadsheetId: sheetID,
    range: sheetName + '!D1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: prNames },
  };

  const updateOptionsForCommercialBr = {
    spreadsheetId: sheetID,
    range: sheetName + '!A1',
    valueInputOption: 'USER_ENTERED',
    resource: { values: commercialBr },
  };

  await gsapi.spreadsheets.values.update(updateOptionsForPrNames);
  await gsapi.spreadsheets.values.update(updateOptionsForCommercialBr);
}

async function fetchAfterEdit(sheetID, sheetName, range) {
  const opt = {
    spreadsheetId: sheetID,
    range: sheetName + '!' + range,
  };
  const row = range.slice(1);
  let prNames = [];
  let fetchedData = [];
  let commercialBr = [];
  let descr = [];

  const rawData = await gsapi.spreadsheets.values.get(opt);
  const mediumData = rawData.data.values;
  const lettersOnlyCodesFromSheet = mediumData.map(function (str1) {
    return str1.map(function (str2) {
      return str2.match(regExp)[0];
    });
  });

  for (i = 0; i < mediumData.length; i++) {
    fetchedData.push(await getEpisode(mediumData[i])); // fetching object from http://db2.yourhope.tv/api/episodes/'
    descr.push(await updateDescription(lettersOnlyCodesFromSheet[i])); // fetching object from http://db2.yourhope.tv/api/shows/
  }
  for (j = 0; j < fetchedData.length; j++) {
    if (fetchedData[j].error) {
      prNames.push(new Array(fetchedData[j].error.message));
      commercialBr.push(new Array());
    } else if (descr[j].error) {
      descr[j].error.message;
    } else if (!fetchedData[j].timeline_break) {
      commercialBr.push(new Array());
      prNames.push(
        new Array(
          fetchedData[j].show.title,
          descr[j].description.short,
          fetchedData[j].title,
          fetchedData[j].duration
        )
      );
    } else {
      commercialBr.push(new Array(fetchedData[j].timeline_break));
      prNames.push(
        new Array(
          fetchedData[j].show.title,
          descr[j].description.short,
          fetchedData[j].title,
          fetchedData[j].duration
        )
      );
    }
  }

  const updateOptionsForPrNames = {
    spreadsheetId: sheetID,
    range: sheetName + '!D' + row,
    valueInputOption: 'USER_ENTERED',
    resource: { values: prNames },
  };

  const updateOptionsForCommercialBr = {
    spreadsheetId: sheetID,
    range: sheetName + '!A' + row,
    valueInputOption: 'USER_ENTERED',
    resource: { values: commercialBr },
  };

  await gsapi.spreadsheets.values.update(updateOptionsForPrNames);
  await gsapi.spreadsheets.values.update(updateOptionsForCommercialBr);
}

module.exports = { insertDataFromDB2YourHopeIntoSpreadSheet, fetchAfterEdit };
