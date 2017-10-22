const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const objectID = require('objectid');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;

const {mongoose} = require('./db/mongoose.js');
const {Rewards} = require('./db/models/Rewards.js');
const {Items} = require('./db/models/Items.js');
const {Users} = require('./db/models/Users.js');
const {Banks} = require('./db/models/Banks.js');

// data hardcoded for demo
const userData = require('./JSON/Users.json');
const rewardsCat = require('./JSON/RewardsCat.json');
const owners = require('./JSON/Owners.json');

const blockchain = require('./blockchain');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//Home Page
app.get('/',(req,res)=>{
	console.log('hi');
	res.sendFile(path.join(__dirname+'/test.html'));
})

// Get latest confirmed block
app.get('/blockchain', (req, res) => {
	blockchain.getLastConfirmedBlock((err, data) => {
		res.send(data);
	});
})

app.get('/block/:id', (req, res) => {
	var id = req.params.id;
	blockchain.getBlock(id, (err, data) => {
		if (err) return res.send(404);
		res.send(data);
	});
})

app.get('/entry/:id', (req, res) => {
	var id = req.params.id;
	blockchain.getEntry(id, (err, data) => {
		if (err) return res.send(404);
		res.send(data);
	});
})

app.post('/entry', (req, res) => {
	console.log(req.body);
	var owner_id = req.body.owner_id;
	var recipient_id = req.body.recipient_id;
	var num = null;
	var type = '';

	if (req.body.object_id) {
		type = 'item';
		num = req.body.object_id;
	} else if (req.body.points) {
		type = 'points';
		num = req.body.points;
	} else if (req.body.miles) {
		type = 'miles';
		num = req.body.miles;
	} else {
		return res.send(400);
	}
	console.log('creating transaction entry: ', type);
	blockchain.createEntry(owner_id, recipient_id, type, num, (err, data) => {
		if (err) return res.send(400);
		res.send(data);
	})
})

app.post('/redeem', (req, res) => {
	console.log('redeeming item from points', req.body);
	owner_id = req.body.owner_id;
	recipient_id = owner_id;
	object_id = req.body.object_id;

	blockchain.createEntry(owner_id, recipient_id, object_id, (err, data) => {
		if (err) return res.send('Unable to create entry');
		res.send(data);
	});
})

//POST /gifting to handle the gift feature
app.post('/gift',(req,res)=>{

	//Need current user and recipeint IDs + hash + slotNumber

	var currentUser_id = req.body.user_id;
	var recipient_id = req.body.recipient_id;
	var giftHash = req.body.hash;
	var currentUserInfo = retrieveUserInfo(currentUser_id);
	var recipientUserInfo = retrieveUserInfo(recipient_id);

	console.log(currentUser_id);
	console.log(recipient_id);
	console.log(giftHash);

	//----- ADD Block Chain Code Here -----
	// need newHash and newSlotNumber

	//Update DB with the new owner credentials

	// var conditions = {hash: giftHash};
	// var update = {user: recipientUserInfo.name, userID: recipientUserInfo.id, hash: newHash, slotNumber: newSlotNumber};

	// Rewards.update(conditions,update,{multi: false},(err)=>{
	// 	if(err){
	// 		console.log(err);
	// 	} else {
	// 		console.log("Updated Successfully!");
	// 	}
	// })
})


app.post('/login',(req,res)=>{

	var rewards2 = Rewards({
		username: 'Krittin',
		userID: 2,
		bank: 'Bank 1',
		item: 'iPhone X',
		hash: 'hiodfhoiew',
		slotNumber: '73678126378921'
	});

	// save the user
	rewards2.save(function(err) {
		if (err) throw err;

		console.log('User created!');
	});

	console.log('Logging in');
	res.send()
})

//Search
app.get('/search',(req,res)=>{
	console.log('Loading a search page.');
	console.log(userData);
})

app.post('/postEntry',(req,res)=>{
	var owner_id = req.body.owner_id;
	var recipient_id = req.body.recipient_id;
	var object_id = req.body.object_id;

	createEntry(owner_id, recipient_id, object_id);

})



app.listen(port,()=>{
	console.log(`Node server started on Port ${port} at `, Date());
});

function retrieveUserInfo(user_id){
	return userData[user_id-1];
}
