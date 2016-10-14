'use strict';

const multer = require('multer');
const storage = multer.memoryStorage(); // don't do this with real apps
// this is fine for now, but it will break things if someone tries to upload a bunch
// this should be set up for us as Junior Developers... or at least we'll need
// to take some time to figure out other storage options in Multer documentation

module.exports = multer({ storage });
