import express from 'express';
import R from 'ramda';
import bodyParser from 'body-parser';
import Flickr from 'flickr-sdk';
import cors from 'cors';

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
function getUserAlbums() {
	return flickr
		.request()
		.people("143341792@N05")
		.albums()
		.get();
}

function getPhotosByAlbumId(id) {
	return flickr
		.request()
		.albums(id)
		.media()
		.get();
}

api.get('/photos', cors(), async function (req, res) {
	try {
		let size= req.query.size || 'm';
		let {_, body} = await getUserAlbums();
		let albumTitles = R.pluck('_content')(R.pluck('title')(body.photosets.photoset));
		let albumIds = R.pluck('id')(body.photosets.photoset);
		let urls = albumIds.map(async function (_id, i) {
			try {
				let {_, body} = await getPhotosByAlbumId(_id);
				let {photo} = body.photoset;
				let urls = photo.map(photo => {
					let {farm, server, id, secret} = photo;
					return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}_${size}.jpg`;
				});
				return {
					name: albumTitles[i],
					photos: urls
				};
			} catch (err) {
				res.status(404).send(err);
			}
		});
		return Promise.all(urls)
			.then(responses => res.send(responses))
			.catch(err => res.status(404).send(err));
	} catch (err) {
		res.status(404).send(err);
	}
});

app.use('/api', api);

app.listen(port, () => console.log(`now running on port ${port}`));

export default app;