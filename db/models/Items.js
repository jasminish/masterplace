const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemsSchema = new mongoose.Schema({
	itemID: {
		type: Number
	},
	ownerID:{
		type: Number, 
	},
	lastHash: {
		type: String
	}
});


var Items = mongoose.model('Items',itemsSchema);
module.exports = {Items};
