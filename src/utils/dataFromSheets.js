const { google } = require('googleapis');
const keys = require('../../config/keys.json');

const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
  'https://www.googleapis.com/auth/spreadsheets',
]);

// const regExp = new RegExp(/^[A-Z]{4}/, 'g');

let getYYYmmDD = async function dayFetch(cl, sheetID, sheetName) {
  const gsapi = google.sheets({ version: 'v4', auth: cl });

  const opt = {
    spreadsheetId: sheetID,
    range: sheetName + '!A70',
  };
  const rawData = await gsapi.spreadsheets.values.get(opt);
  const mediumData = rawData.data.values;

  return mediumData[0][0];
};

let getDataFromSpreadSheet = async function gsrun(cl, sheetID, sheetName) {
  const gsapi = google.sheets({ version: 'v4', auth: cl });

  const opt = {
    spreadsheetId: sheetID,
    range: sheetName + '!B1:F65',
  };

  const rawData = await gsapi.spreadsheets.values.get(opt);
  const mediumData = rawData.data.values;
  // const lettersOnlyCodesFromSheet = mediumData.map(function (data) {
  //   let tmp = data[0];
  //   return tmp.match(regExp)[0];
  // });
  return mediumData;
};

module.exports = { getYYYmmDD, getDataFromSpreadSheet };
