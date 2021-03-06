const fetch = require('node-fetch');

const getEpisode = async (code) => {
	const url = 'http://db2.yourhope.tv/api/episodes/' + code + '?token=' + process.env.TOKEN;
	try {
		const res = await fetch(url);
		const json = await res.json();
		return json;
	} catch (e) {
		console.log(e);
	}
};

module.exports = getEpisode;
