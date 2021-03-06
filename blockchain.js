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
}

var msgClass;
function loadProtobuf() {
	protobuf.load(protoFile, function(err, root) {
		console.log('loading protobuf');
		if (err) {
			console.log('error', err);
		}
		msgClass = root.lookupType("TM25.Transaction");
		// console.log(msgClass);
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

const {Items} = require('./db/models/Items.js');
methods.createEntry = function createEntry(owner_id, recipient_id, transaction_type, num, lastHash, callback) {
	console.log("create entry");
	console.log(owner_id, recipient_id, transaction_type, num);
	var payload = {
		ownerid: owner_id,
		recipientid: recipient_id,
		item: "",
		points: "",
		miles: "",
		lastHash: lastHash || ""
	};
	if (transaction_type == "item") {
		payload.item = num;
	} else if (transaction_type == "points") {
		payload.points = num;
	} else if (transaction_type == "miles") {
		payload.miles = num;
	} else {
		console.log('wrong transaction type');
	}

	var err = msgClass.verify(payload);
	if (err) {
		console.log(msgClass, err);
		callback(err);
	} else {
		var message = msgClass.create(payload);
		var encoded = msgClass.encode(message).finish().toString(encoding);
		var decoded = msgClass.decode(new Buffer(encoded, encoding));
		// console.log(decoded);
		// console.log(message);
		blockchain.TransactionEntry.create({
			"app": appID,
			"encoding": encoding,
			"value": encoded
		}, function(err, result) {
			if (err) {
				// console.log('error', err);
				console.log('error');
				callback(err);
			} else {
				// console.log(result);
				console.log('result');
				callback(null, result);
			}
		});
	}
}

methods.getLastConfirmedBlock = function(callback) {
	var requestData = {};
	blockchain.Block.list(requestData, function (error, data) {
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
	blockchain.Block.read(id, requestData, function (error, data) {
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
	blockchain.TransactionEntry.read("", requestData, function (error, data) {
		if (error) {
			console.error("HttpStatus: "+error.getHttpStatus());
			console.error("Message: "+error.getMessage());
			console.error("ReasonCode: "+error.getReasonCode());
			console.error("Source: "+error.getSource());
			console.error(error);
			callback(error);
		}
		else {
			console.log("decoded:");
			var decoded = msgClass.decode(new Buffer(data.value, 'hex'))
			console.log(decoded);
			var object = msgClass.toObject(decoded, {
				longs: String,
				enums: String,
				bytes: String
			});
			console.log(object);
			// console.log(data.hash);     //Output-->1e6fc898c0f0853ca504a29951665811315145415fa5bdfa90253efe1e2977b1
			// console.log(data.slot);     //Output-->1503594631
			// console.log(data.status);     //Output-->confirmed
			// console.log(data.value);     //Output-->0a0f4d41393920446f63756d656e742031
			callback(null, object);
		}
	});
}

methods.checkOwner = function(item_id) {
	var i = Items.findOne({'id': num}, 'lastHash ownerID', function(err, item) {
		return item;
	});
	if (i.lastHash) {
		methods.getEntry(hash, function(err, data) {
			return data.recipientpk;
		});
	} else {
		return i.ownerID; // company ID s
	}
};


initAPI();

module.exports = methods;
