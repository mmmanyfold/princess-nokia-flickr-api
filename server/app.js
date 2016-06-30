import express from 'express';
// import R from 'ramda';
import bodyParser from 'body-parser';
import Flickr from 'flickr-sdk';

const app = express();
const port = process.env.PORT || 5000;
const api = express.Router();

const flickr = new Flickr({
	"apiKey": process.env.FLICKR_CONSUMER_KEY,
	"apiSecret": process.env.FLICKR_CONSUMER_SECRET,
	"accessToken": process.env.FLICKR_ACCESS_TOKEN,
	"accessTokenSecret": process.env.FLICKR_ACCESS_TOKEN_SECRET
});

app.use(bodyParser.json());

// https://www.flickr.com/services/api/misc.urls.html
// https://farm8.staticflickr.com/7443/27623501851_1df7d7efcc_m.jpg
function getUserAlbums() {
	return flickr
		.request()
		// .galleries('72157667142546453') // Album ID
		.people("143341792@N05")
		// .media("27623501851")
		.albums()
		.get();
}


api.get('/photos', async function (req, res) {
	try {
		let {_, body} = await getUserAlbums();
		res.send(body);
	} catch (err) {
		res.status(404).send(err);
	}
});

app.use('/api', api);

app.listen(port, () => console.log(`now running on port ${port}`));

export default app;