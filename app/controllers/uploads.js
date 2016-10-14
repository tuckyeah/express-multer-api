'use strict';

// express runs in the root of the file so we don't have to worry about
// relative file paths from the controllers folder
const controller = require('lib/wiring/controller');
const multer = require('app/middleware').multer;

const models = require('app/models');
const Upload = models.upload;

const upload = require('lib/s3-upload').upload;


// const authenticate = require('./concerns/authenticate');

const index = (req, res, next) => {
  Upload.find()
    .then(uploads => res.json({ uploads }))
    .catch(err => next(err));
};

const show = (req, res, next) => {
  Upload.findById(req.params.id)
    .then(upload => upload ? res.json({ upload }) : next())
    .catch(err => next(err));
};

const create = (req, res, next) => {
  upload(req.file.buffer) // use a stream instead of req.file
  .then((response)=> {
    return {
      location: response.Location, // from S3
      comment: req.body.upload.comment // from our Client
    };
  })
  .then((upload) => {
    return Upload.create(upload); // send upload to mongo through mongoose
  })
  .then(upload => res.json({ upload }))
  .catch(error => next(error)) // send errors down the chain (since we're in express)
  ;
};

// what does it mean to update an upload? We'd likely only be
// uploading metadata... however, it's more likely a user
// will just make a new upload rather than updating, so we're
// not going to worry about this right now.
const update = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Upload.findOne(search)
    .then(upload => {
      if (!upload) {
        return next();
      }

      delete req.body._owner;  // disallow owner reassignment.
      return upload.update(req.body.upload)
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

// also not worrying about this right now.
const destroy = (req, res, next) => {
  let search = { _id: req.params.id, _owner: req.currentUser._id };
  Upload.findOne(search)
    .then(upload => {
      if (!upload) {
        return next();
      }

      return upload.remove()
        .then(() => res.sendStatus(200));
    })
    .catch(err => next(err));
};

module.exports = controller({
  index,
  show,
  create,
  // destroy,
  // update,
}, { before: [
  { method: multer.single('upload[file]'), only: ['create']}
], });
