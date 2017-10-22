const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rewardSchema = new mongoose.Schema({
	user: {
		type: String
	},
	userID:{
		type: Number
	},
	bank: {
		type: String
	},
	item: {
		type: String
	},
	hash: {
		type: String
	},
	slotNumber: {
		type: String
	}
});


var Rewards = mongoose.model('Rewards',rewardSchema);


// var Rewards = mongoose.model('Rewards',{
// 	user:{
// 		type: String,
// 		required: true
// 	},
// 	bank: {
// 		type: String,
// 		required: true
// 	},
// 	item:{
// 		type: String,
// 		required: true,
// 	},
// 	hash:{
// 		type: String,
// 		required: true
// 	},
// 	slotNumber:{
// 		type: String,
// 		required: true
// 	}
	
// })

module.exports = {Rewards};
