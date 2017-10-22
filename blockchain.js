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
		ownerpk: users[owner_id].rsakey.exportKey('public'),
		recipientpk: users[recipient_id].rsakey.exportKey('public'),
		type: 0,
		signature: users[owner_id].rsakey.sign(object_id, 'base64')
	};
	var err = msgClass.verify(payload);
	if (err) {
		console.log(msgClass, err);
		callback(err);
	} else {
		var message = msgClass.create(payload);
		var encoded = msgClass.encode(message).finish().toString(encoding);
		console.log(encoded);
		var decoded = msgClass.decode(new Buffer(encoded, encoding));
		console.log(decoded);
		console.log(message);
		blockchain.TransactionEntry.create({
			"app": appID,
			"encoding": encoding,
			"value": encoded
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
					callback(null, data);
				}
			});
		}

		methods.getEntry = function (hash, callback) {
			var requestData = {
				"hash": hash
			};
			blockchain.TransactionEntry.read("", requestData
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
					console.log(data.hash);     //Output-->1e6fc898c0f0853ca504a29951665811315145415fa5bdfa90253efe1e2977b1
					console.log(data.slot);     //Output-->1503594631
					console.log(data.status);     //Output-->confirmed
					console.log(data.value);     //Output-->0a0f4d41393920446f63756d656e742031
					callback(null, data);
				}
			});
		}

		initAPI();

		module.exports = methods;
