'use strict';

// this has to come before anything else
require('dotenv').config();-// this is the same as doing:
//    const throwaway = require('dotenv');
//    throwaway.config();
// but we don't need to do this because we don't need this variable, we just
// need to execute config

const fs = require('fs');
const crypto = require('crypto');

const fileType = require('file-type');
// breaking convention here, because Amazon requires it
const AWS = require('aws-sdk');

const filename = process.argv[2] || '';

const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      // reject causes the promise to be 'fulfilled' so it will still exit the function
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
};

// return a default object in the case that fileType is given an unsupported
// filetype to read
const mimeType = (data) => {
  return Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream',
  }, fileType(data));
};

// combines the file contents from readFile and the mimetype in one object
// and returns it
const parseFile = (fileBuffer) => {
  let file = mimeType(fileBuffer);
  file.data = fileBuffer;
  return file;
};

const randomHexString = (length) => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (error, buffer) => {
      if (error) {
        reject(error);
      }

      resolve(buffer.toString('hex'));
    });
  });
};

// mini promise chain inside here - so it returns a Promise
// but also does its little promise resolve chain in here
const nameFile = (file) => {
  // this outer return is what gets us back to the original promise chain
  return randomHexString(16)
  .then((val) => {
    // we have to return _inside_ the promise chain
    // so it doesn't break
    file.name = val;
    return file;
  });
};

const nameDirectory = (file) => {
  // this doesn't have to return a promise because it's not nested
  // inside another promise (like nameFile is)
  file.dir = new Date().toISOString().split('T')[0];
  return file;
};

-// this is an instance of the S3 upload manager that will be authenticated
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const upload = (file) => {
  const options = {
    // get the bucket name from your AWS S3 console
    Bucket: 'tucker-rosebrock-wdi',
    // attach the fileBuffer as a stream to send to S3
    Body: file.data,
    // allow anyone to access the URL of the uploaded file
    ACL: 'public-read',
    // tell S3 what the mime-type is
    ContentType: file.mime,
    // pick a filename for S3 to use for the upload
    Key: `${file.dir}/${file.name}.${file.ext}`
  };

  return new Promise((resolve, reject) => {
    s3.upload(options, (error, data) => {
      if (error) {
        reject(error);
      }

      resolve(data);
    });
  });
};

const logMessage = (response) => {
  // turn the pojo into a string so I can see it on the console
  console.log(`the response from AWS was ${JSON.stringify(response)}`);
};

readFile(filename)
.then(parseFile)
.then(nameFile)
.then(nameDirectory)
.then(upload)
.then(logMessage)
.catch(console.error)
;
