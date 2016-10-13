'use strict';

const fs = require('fs');
const fileType = require('file-type');

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

const logMessage = (file) => {
  console.log(`${filename} is ${file.data.length} bytes long and is of mimetype ${file.mime}`);
};

// now we have to call our function
readFile(filename)
  .then(parseFile)
  .then(logMessage)
  .catch(console.error);
