const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;

const {mongoose} = require('./db/mongoose.js');
const {Rewards} = require('./db/models/Rewards.js')

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

app.post('/block', (req, res) => {
	console.log('creating transaction entry');
	console.log(req.body);
	owner_id = req.body.owner_id;
	recipient_id = req.body.recipient_id;
	object_id = req.body.object_id;

	blockchain.createEntry(owner_id, recipient_id, object_id, (err, data) => {
		if (err) return res.send('Unable to create entry');
		res.send(data);
	});
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

app.post('/login',(req,res)=>{
	console.log(req.body.username);
	console.log(req.body.password);
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

	createEntry(owner_id, recipient_id, object_id);x

})



app.listen(port,()=>{
	console.log(`Node server started on Port ${port} at `, Date());
});

function retrieveSearchResults (){
}
