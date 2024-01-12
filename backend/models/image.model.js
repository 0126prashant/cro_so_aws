const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    required: true,
  },
  screenshotsData: {
    type: Object, 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Image = mongoose.model('image', imageSchema);

module.exports = {Image};
