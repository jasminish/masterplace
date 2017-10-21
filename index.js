// require('./server.js');

var blockchain = require('mastercard-blockchain');
var MasterCardAPI = blockchain.MasterCardAPI;
var config = require('./config.json');
var fs = require('fs');


var consumerKey = config.CONSUMER_KEY;   // You should copy this from "My Keys" on your project page e.g. UTfbhDCSeNYvJpLL5l028sWL9it739PYh6LU5lZja15xcRpY!fd209e6c579dc9d7be52da93d35ae6b6c167c174690b72fa
var keyStorePath = config.KEYSTORE_PATH; // e.g. /Users/yourname/project/sandbox.p12 | C:\Users\yourname\project\sandbox.p12
var keyAlias = config.KEY_ALIAS;   // For production: change this to the key alias you chose when you created your production key
var keyPassword = config.KEY_PASSWORD;   // For production: change this to the key alias you chose when you created your production key
var appID = "TM25";


// protobuf 
var protobuf = require('protobufjs');
var protoFile = 'message.proto';
var encoding = 'base64';

function initAPI() {
	console.log("initializing");
	var authentication = new MasterCardAPI.OAuth(consumerKey, keyStorePath, keyAlias, keyPassword);
	MasterCardAPI.init({
		sandbox: true,
		debug: true,
		authentication: authentication
	});
	loadProtobuf();
	//console.log('---------------Loading Data....');
	// loadData();
}

function loadProtobuf() {
	protobuf.load(protoFile, function(err, root) {
		console.log('loading protobuf');
		if (err) {
			console.log('error', err);
		}
		
		blockchain.App.update({
			id: appID,
			name: appID,
			description: "",
			version: 0,
			definition: {
				format: "proto3",
				encoding: encoding,
				messages: fs.readFileSync(protoFile).toString(encoding)
			}
		}, function(error, data) {
			console.log('updated app');
			if (error) {
				console.error("HttpStatus: "+error.getHttpStatus());
				console.error("Message: "+error.getMessage());
				console.error("ReasonCode: "+error.getReasonCode());
				console.error("Source: "+error.getSource());
				console.error(error)
			}
			
		});
	});
}

// function loadData(){
// 	var requestData = {};
// 	blockchain.Node.query(requestData
// 	, function (error, data) {
// 		if (error) {
// 			console.error("HttpStatus: "+error.getHttpStatus());
// 			console.error("Message: "+error.getMessage());
// 			console.error("ReasonCode: "+error.getReasonCode());
// 			console.error("Source: "+error.getSource());
// 			console.error(error);

// 		}
// 		else {
// 			console.log(data.address);     //Output-->CWy4GMxUSSCbWyLGW8F6Wa7c5P64j9AD9T
// 			console.log(data.authority);     //Output-->SdCue1VxBaEALMHSqPcg5FEuheo6FBruGC
// 			console.log(data.chain_height);     //Output-->1503661343
// 			console.log(data.delay);     //Output-->5000
// 			console.log(data.drift);     //Output-->0
// 			console.log(data.peers[0].address);     //Output-->CcTomhnEeWDMZ9B95MKFp8bDrQYg6BQRKw
// 			console.log(data.peers[1].address);     //Output-->ZX4pVQD5ATSiga6jpExeTjjwSMMNBgTDP8
// 			console.log(data.public_key);     //Output-->0485673e58357908980cf4480968570d2fa6b8a4439a8a98d2748e82bfe3945a8a6da0e2a75f603ec24b496e8d9df582592d25692345e0e0805e696584d8d2fdf3
// 			console.log(data.type);     //Output-->customer
// 			console.log(data.unconfirmed);     //Output-->0
// 		}
// 	});
// }


initAPI();

// function createEntry() {
// 	console.log("create entry"); 
// 	var payload = {
// 		reference: , 
// 		owner_pk: , 
// 		recipient_pk: , 
// 		signature: , 
// 		type: , 
// 	}; 
// 	
// }
