'use strict';
// this has to come before everything else!
require('dotenv').config();
// this is the same as doing:
//    const throwaway = require('dotenv');
//    throwaway.config();
// but we don't need to do this because we don't need this variable, we just
// need to execute config

const fs = require('fs');
const fileType = require('file-type');
// this is how amazon refers to it, so that's why it's all caps
const AWS = require('aws-sdk');

const filename = process.argv[2] || '';


const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        // reject causes the promise to be 'fulfilled' so it will still exit the function
        reject(error);
      }
      resolve(data);
    });
  });
};

// return a default object in the case that fileType is given an unsupported
// file type to read.
const mimeType = (data) => {
  // this runs fileType(data) and adds it to the object literal
  // we set a default file type here, the most basic type of all files (binary)
  // it will be overwritten with the fileType data if the file actually has data (isn't null)
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

// this is an instance of the S3 manager that will be authenticated
const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const upload = (file) => {
  const options = {
    // get bucket name from AWS console
    Bucket: 'tucker-rosebrock-wdi',
    // attach fileBuffer as stream to send to Amazon
    Body: file.data,
    // allow anyone to access the URL of the uploaded file
    ACL: 'public-read',
    // tell Amazon what the mime-type is
    ContentType: file.mime,
    // pick a filename for S3 to use for the upload
    Key: `test/test.${file.ext}`
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
  console.log(`the response from AWS was ${JSON.stringify(response)}`);
};

// now we have to call our function
readFile(filename)
  .then(parseFile)
  .then(upload)
  .then(logMessage)
  .catch(console.error);
