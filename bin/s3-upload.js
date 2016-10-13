#!/usr/bin/env node
// we need this to make it run correctly

'use strict';

const fs = require('fs');

// pass file path to this script as argument
// if we don't pass it a file name, give it a blank string
const filename = process.argv[2] || '';
// readLine takes a string as a first argument, so it'll tell us that it needs
// a pathname, not a string

fs.readFile(filename, (error, data) => {
  // handle errors first
  if (error) {
    // this 'return' forces the function to exit if we get an error
    // so it doesn't try to run the below log statement
    return console.error(error);
  }

  console.log(`${filename} is ${data.length} bytes long`);
});
