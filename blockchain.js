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

initAPI();

module.exports = methods;
