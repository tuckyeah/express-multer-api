// bin/s3-upload.js
'use strict';

const fs = require('fs');

const AWSUpload = require('../lib/s3-upload').upload;

const mongoose = require('../app/middleware/mongoose');
const Upload = require('../app/models/upload');

const filename = process.argv[2] || '';
const comment = process.argv[3] || 'No comment';

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
};

// wrapper function to talk to Mongo, which will receive a response from AWS
const createUpload = (response) => {
  // this where we build what we send to Mongoose
  let upload = {
    location: response.Location,
    comment: comment
  };
  // returns a promise
  return Upload.create(upload);
};

const logMessage = (upload) => {
  // turn the pojo into a string so I can see it on the console
  console.log(`the upload instance looks like: ${JSON.stringify(upload)}`);
};

readFile(filename)
.then(AWSUpload)
.then(createUpload)
.then(logMessage)
.catch(console.error)
.then(()=> mongoose.connection.close())
;
