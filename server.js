const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

app.use(express.static('public'));

const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function (req, file, cb) {
    	cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

const upload = multer({
	storage: storage,
}).single('image');

app.post('/upload', (req, res) => {
	upload(req, res, (err) => {
	if (err) {
		res.send('Error uploading file.');
	} else {
		res.send('File uploaded successfully.');
    }
	});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
