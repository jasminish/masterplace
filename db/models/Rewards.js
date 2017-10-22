const mongoose = require('mongoose');

var Rewards = mongoose.model('Rewards',{
	owner:{
		type: String,
		required: true
	},
	bank: {
		type: String,
		required: true
	},
	rewards:{
		type: String,
		required: true,
	}
	
})

module.exports = {Rewards};
