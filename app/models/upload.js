'use strict';

const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  // what about validating update size?
  comment: {
    type: String,
    required: true,
  },
  location: {
      type: String,
      required: true
  }
},  {
  timestamps: true,
});

UploadSchema.virtual('length').get(function() {
  // what is this.text?
  return this.text.length;
});

// this is super important, and how mongoose relates things to Upload
const Upload = mongoose.model('Upload', UploadSchema);

module.exports = Upload;
