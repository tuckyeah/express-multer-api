'use strict';

const fs = require('fs');

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

const logMessage = (data) => {
  console.log(`${filename} is ${data.length} bytes long`);
};

// now we have to call our function
readFile(filename)
  .then(logMessage)
  .catch(console.error);
