require('/server.js');

var blockchain = require('mastercard-blockchain');
var MasterCardAPI = blockchain.MasterCardAPI;
var config = require('./config.json');



var consumerKey = config.CONSUMER_KEY;   // You should copy this from "My Keys" on your project page e.g. UTfbhDCSeNYvJpLL5l028sWL9it739PYh6LU5lZja15xcRpY!fd209e6c579dc9d7be52da93d35ae6b6c167c174690b72fa
var keyStorePath = config.KEYSTORE_PATH; // e.g. /Users/yourname/project/sandbox.p12 | C:\Users\yourname\project\sandbox.p12
var keyAlias = config.KEY_ALIAS;   // For production: change this to the key alias you chose when you created your production key
var keyPassword = config.KEY_PASSWORD;   // For production: change this to the key alias you chose when you created your production key

// You only need to do initialize MasterCardAPI once
var authentication = new MasterCardAPI.OAuth(consumerKey, keyStorePath, keyAlias, keyPassword);
MasterCardAPI.init({
	sandbox: true,
	debug: true,
	authentication: authentication
});


var requestData = {};
blockchain.Status.query(requestData
, function (error, data) {
	if (error) {
		console.error("HttpStatus: "+error.getHttpStatus());
		console.error("Message: "+error.getMessage());
		console.error("ReasonCode: "+error.getReasonCode());
		console.error("Source: "+error.getSource());
		console.error(error);

	}
	else {
		console.log(data.applications[0]);     //Output-->MA99
		console.log(data.current.ref);     //Output-->3ee7d7608368f4133da7c45d7d5f0518d89d540891849b35cfe5ec08e298755d
		console.log(data.current.slot);     //Output-->1503661406
		console.log(data.genesis.ref);     //Output-->92510aeb361b62e982cfabafc56d5b666f29107fb0c5309030b883f702916e80
		console.log(data.genesis.slot);     //Output-->1503599076
		console.log(data.network);     //Output-->1513115205
		console.log(data.version);     //Output-->0.5.0
	}
});
