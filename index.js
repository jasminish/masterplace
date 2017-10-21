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

// users 
var users = JSON.parse(fs.readFileSync('./JSON/Users.json', 'utf8'))
var NodeRSA = require('node-rsa');
users.forEach(function(user) {
	// generate RSA keypair 
	var key = new NodeRSA({b: 256});
	user.rsakey = key; // stored just for testing
});



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
}

var msgClass; 
function loadProtobuf() {
	protobuf.load(protoFile, function(err, root) {
		console.log('loading protobuf');
		if (err) {
			console.log('error', err);
		}
		msgClass = root.lookupType("TM25.Transaction");
		console.log(msgClass);
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

initAPI(); 

function createEntry() {
	console.log("create entry"); 
	var payload = {
		reference: "EXAMPLE MESSAGE", 
		owner_pk: users[0].rsakey.exportKey('public'), 
		recipient_pk: users[1].rsakey.exportKey('public'), 
		type: 0
	}; 
	var err = msgClass.verify(payload);
	if (err) {
		console.log(msgClass, err);
	} else {
		var message = msgClass.create(payload);
		blockchain.TransactionEntry.create({
			"app": appID,
			"encoding": encoding,
			"value": msgClassDef.encode(message).finish().toString(encoding)
		}, function(err, result) {
			if (err) {
				console.log('error', err);
			} else {
				console.log(result);
			}
		});
	}
	
}

function getProperties(obj) {
    var ret = [];
    for (var name in obj) {
        if (obj.hasOwnProperty(name)) {
            ret.push(name);
        }
    }
    return ret;
}

createEntry();
