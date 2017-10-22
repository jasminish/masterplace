const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new mongoose.Schema({
	userID: {
		type: Number
	},
	userName:{
		type: String
	},
	bankInfo:[{
			cardNO: {type: Number},
			rewardPoints: {type: Number, default: 0}
		}],
	currentMileage: {
		type: Number,
		default: 0
	}
});


var Users = mongoose.model('Users',usersSchema);

module.exports = {Users};
