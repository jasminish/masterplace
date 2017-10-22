const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/masterPlace');

module.exports = {mongoose};