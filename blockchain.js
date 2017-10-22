const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;

const userData = require('./JSON/Users.json');
const rewardsCat = require('./JSON/RewardsCat.json');
const owners = require('./JSON/Owners.json');

console.log(userData);
console.log(rewardsCat);
console.log(owners);

// users
var users = JSON.parse(fs.readFileSync('./JSON/Users.json', 'utf8'))
var NodeRSA = require('node-rsa');
users.forEach(function(user) {
	// generate RSA keypair
	var key = new NodeRSA({b: 256});
	user.rsakey = key; // stored just for testing
});

//Home Page
app.get('/',(req,res)=>{
	console.log('hi');
	res.sendFile(path.join(__dirname+'/test.html'));
})

app.post('/login',(req,res)=>{
	console.log(req.body.username);
	console.log(req.body.password);
	console.log('Logging in');
	res.send()
})

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

methods.createEntry = function createEntry() {
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
			"value": msgClass.encode(message).finish().toString(encoding)
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

methods.getLastConfirmedBlock = function() {
	var requestData = {};
	blockchain.Block.list(requestData
		, function (error, data) {
			if (error) {
				console.error("HttpStatus: "+error.getHttpStatus());
				console.error("Message: "+error.getMessage());
				console.error("ReasonCode: "+error.getReasonCode());
				console.error("Source: "+error.getSource());
				console.error(error);

			}
			else {
				console.log("Lastest block:")
				console.log(data[0]);
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

	initAPI();

	module.exports = methods;
