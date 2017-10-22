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
	var key = new NodeRSA({b: 1024});
	user.rsakey = key; // stored just for testing
});



// protobuf
var protobuf = require('protobufjs');
var protoFile = 'message.proto';
var encoding = 'base64';

var methods = {};

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

methods.createEntry = function createEntry(owner_id, recipient_id, object_id, callback) {
	console.log("create entry");
	var payload = {
		reference: object_id,
		owner_pk: users[owner_id].rsakey.exportKey('public'),
		recipient_pk: users[recipient_id].rsakey.exportKey('public'),
		type: 0,
		signature: users[owner_id].rsakey.sign(object_id, 'base64')
	};
	var err = msgClass.verify(payload);
	if (err) {
		console.log(msgClass, err);
		callback(err);
	} else {
		var message = msgClass.create(payload);
		blockchain.TransactionEntry.create({
			"app": appID,
			"encoding": encoding,
			"value": msgClass.encode(message).finish().toString(encoding)
		}, function(err, result) {
			if (err) {
				console.log('error', err);
				callback(err);
			} else {
				console.log(result);
				callback(null, result);
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

methods.getLastConfirmedBlock = function(callback) {
	var requestData = {};
	blockchain.Block.list(requestData
		, function (error, data) {
			if (error) {
				console.error("HttpStatus: "+error.getHttpStatus());
				console.error("Message: "+error.getMessage());
				console.error("ReasonCode: "+error.getReasonCode());
				console.error("Source: "+error.getSource());
				console.error(error);
				callback(error);
			}
			else {
				console.log("Lastest block:")
				console.log(data[0]);
				callback(null, data[0]);
				// console.log(data[0].authority);     //Output-->PegupZdN96Kqe1GWgqEqLMkzeA4PotbUv2wiKZZqqqKDH3sDA9cozcEakAsmJxYRv8zHCHuuFujTRxUgYxrNA6Fw
				// console.log(data[0].hash);     //Output-->87d97de8c553381adc735439762396355fe54322d580b7da642035a2c5b917bc
				// console.log(data[0].nonce);     //Output-->13465573658468563000
				// console.log(data[0].previous_block);     //Output-->f106b05908504960a5a5d47422cbb47a3ad138f6bbbb40e0af00d7750d04f0fb
				// console.log(data[0].signature);     //Output-->AN1rKryh8muZCbtqPu7gFmahvx9N6emWyqMNgTDXGcomHSWQK9Tt7J3CUY1yDCFU7bTH7jD3qCyyta4GX8RBYtVVNif8X8kx4
				// console.log(data[0].slot);     //Output-->1503572680
				// console.log(data[0].version);     //Output-->1
			}
		});
	}

	methods.getBlock = function(id, callback) { //Id can be the slot or the hash of the block to retrieve
		var requestData = {};
		blockchain.Block.read(id, requestData
		, function (error, data) {
			if (error) {
				console.error("HttpStatus: "+error.getHttpStatus());
				console.error("Message: "+error.getMessage());
				console.error("ReasonCode: "+error.getReasonCode());
				console.error("Source: "+error.getSource());
				console.error(error);
				callback(error);
			}
			else {
				console.log(data);
				// console.log(data.authority);     //Output-->PkvgjbWm7FuWrFaRCyX8HToHtLwJZqzTNi2qYz7tPRiXkogZ59DXR11rbJ7fvrUNx8ogHzSQXSFt2eVnGi5ipHrJ
				// console.log(data.nonce);     //Output-->18016650688634213912
				// console.log(data.partitions[0].application);     //Output-->1160851504
				// console.log(data.partitions[0].entries[0]);     //Output-->50cbc906b2d5e4e795b9aa79ad35e7b9989839a0a0fc95b2ecd063529db365fd
				// console.log(data.partitions[0].entry_count);     //Output-->1
				// console.log(data.partitions[0].merkle_root);     //Output-->50cbc906b2d5e4e795b9aa79ad35e7b9989839a0a0fc95b2ecd063529db365fd
				// console.log(data.previous_block);     //Output-->72af7cf7953f59ef2d2bda2de0028793abd6124c5efdd18a4eddccb5edbeaace
				// console.log(data.signature);     //Output-->iKx1CJLjCuUynDdZbxdqEuaJvhyMmUigSdsChHVQWiovi2WcC3Lv5REWtwRo8C6N1FNik32V3umBHzEi6VLVsoMNKjiN7nAfV5
				// console.log(data.slot);     //Output-->1503574734
				// console.log(data.version);     //Output-->1
				callback(null, data);
			}
		});
	}

	initAPI();

	module.exports = methods;
