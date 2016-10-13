'use strict';

const fs = require('fs');
const fileType = require('file-type');
// this is how amazon refers to it, so that's why it's all caps
const AWS = require('aws-sdk');

const filename = process.argv[2] || '';


const readFile = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        // reject causes the promise to 'fulfilled' so it will still exit the function
        reject(error);
      }
      resolve(data);
    });
  });
};

// return a default object in the case that fileType is given an unsupported
// file type to read.
const mimeType = (data) => {
  // this runs fileType(data) and add it to the object literal
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

const s3 = new AWS.S3({
  credentials: {
    accessKeyId:,
    secretAccessKey,
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
  // don't actually upload yet, just pass the data down the Promise chain
  return Promise.resolve(options);
};

const logMessage = (upload) => {
  // get rid of the stream (for now) so we can log the rest of the options
  // in the terminal w/o seeing the stream
  delete upload.Body;
  // turn POJO into a stream so we can see it in the console
  console.log(`The upload options are: ${JSON.stringify(upload)}`);
};

// now we have to call our function
readFile(filename)
  .then(parseFile)
  .then(upload)
  .then(logMessage)
  .catch(console.error);
