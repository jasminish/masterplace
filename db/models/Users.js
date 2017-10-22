const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new mongoose.Schema({
	userID: {
		type: Number
	},
	userName:{
		type: String
	},
	BankInfo:[{
			cardNO: {type: Number},
			rewardPoints: {type: Number}
		}],
	CurrentItems: {
		type: [{
			itemObjectID: {type: Schema.Types.ObjectId }
		}]
	}
});


var Users = mongoose.model('Users',usersSchema);

module.exports = {Users};
