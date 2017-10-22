const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new mongoose.Schema({
	userID: {
		type: Number
	},
	userName:{
		type: String
	},
	bankA: {type: String},
	bankB: {type: String},
	airlineA: {type: String},
	airlineB: {type: String}
});


var Users = mongoose.model('Users',usersSchema);

module.exports = {Users};
