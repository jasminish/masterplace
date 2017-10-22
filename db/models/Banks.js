const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var banksSchema = new mongoose.Schema({
	bankID: {
		type: Number
	},
	bankName:{
		type: String
	}
});

var Banks = mongoose.model('Banks',banksSchema);
module.exports = {Banks};
