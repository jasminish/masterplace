const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const objectID = require('objectid');
const _ = require('lodash');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;
app.use(express.static('views'));


const {mongoose} = require('./db/mongoose.js');
const {Items} = require('./db/models/Items.js');
const {Users} = require('./db/models/Users.js');
const {Banks} = require('./db/models/Banks.js');

// data hardcoded for demo
const userData = require('./JSON/Users.json');
const rewardsCat = require('./JSON/RewardsCat.json');
const owners = require('./JSON/Owners.json');

const blockchain = require('./blockchain');

var loggedInUser = -1; //initiate to not logged in
var loggedInUserData = null;

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('view engine', 'pug');
app.set('views', './views')

//Home Page
app.get('/',(req,res)=>{
	res.render('index');
})

app.get('/mainplace.html',(req,res)=>{
	if (loggedInUser == -1 || !loggedInUserData) {
		return res.render('login');
	}
	res.render('mainplace', {user: loggedInUserData});
})

app.get('/login.html',(req,res)=>{
	res.render('login');
})

app.get('/redeem.html',(req,res)=>{
	if (loggedInUser == -1 || !loggedInUserData) {
		return res.render('login');
	}
	res.render('redeem', {user: loggedInUserData});
})

app.get('/redeemlist.html',(req,res)=>{
	if (loggedInUser == -1 || !loggedInUserData) {
		return res.render('login');
	}
	res.render('redeemlist', {user: loggedInUserData});
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
		if (owner_id != methods.checkOwner(num)) {
			return res.send(400);
		}
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
		if (type == "item") {
			updatingItemsDB(num, data.hash, recipient_id);
		}
		res.send(data);
	})
})

app.post('/redeem', (req, res) => {
	console.log('redeeming items from points', req.body);
	var bank_id = req.body.owner_id;
	var recipient_id = req.body.recipient_id;
	var points = req.body.points;
	var item_id = req.body.item_id;

	Users.findOne({userID: recipient_id}, function(err, document) {
		if (!document) return console.log("user not found");

		// helper
		var deductMiles = function(data) {
			blockchain.createEntry(recipient_id, bank_id, 'points', parseInt(data.points) - points, data.hash, (err, data) => {
				// save last hash back to user
				if (bank_id == 'bankA') {
					Users.findOneAndUpdate({userID: recipient_id}, {$set: {bankA: data.hash.toString()}}, {upsert: true}, (err, data) => {
						console.log(err || data);
					});
				} else {
					Users.findOneAndUpdate({userID: recipient_id}, {$set: {bankB: data.hash.toString()}}, {upsert: true}, (err, data) => {
						console.log(err || data);
					});
				}
			});
		}

		// check points and deduct
		if (bank_id == bankA) {
			blockchain.getEntry(document.bankA, (err, data) => {
				if (parseInt(data.points >= points)) {
					deductMiles(data);
				}
			})
		} else {
			blockchain.getEntry(document.bankB, (err, data) => {
				if (parseInt(data.points >= points)) {
					deductMiles(data);
				}
			})
		}

		// create genesis entry for item
		blockchain.createEntry(bank_id, recipient_id, 'item', item_id, null, (err, data) => {
			if (err) return res.send('Unable to create entry');
			console.log(data);
			var item = Items({
				itemID: item_id,
				ownerID: recipient_id,
				lastHash: data.hash
			});

			// save item movement in db
			item.save((err)=>{
				if(err){
					console.log('Error Adding Item To DB! ',err);
				}else{
					console.log('Adding Item to DB OK!');
				}
			})
		});
	});
})

app.get('/createWallet', (req, res)=>{
	blockchain.createEntry('1', '1', 'miles', '1000', null, (err,data) => {
		console.log(err || data);
	})
})

app.get('/points/:hash', (req, res) => {
	blockchain.getEntry(req.params.hash, (err, data) => {
		res.send(data.points);
	})
})

app.get('/miles/:hash', (req, res) => {
	blockchain.getEntry(req.params.hash, (err, data) => {
		res.send(data.miles);
	})
})

app.post('/transferPoints', (req, res) => {
	console.log('transferring points:', req.body);
	var owner_id = req.body.owner_id;
	var owner_bank = req.body.owner_bank;

	var recipient_id = req.body.recipient_id;
	var recipient_bank = req.body.recipient_bank;

	var transfer_points = req.body.transfer_points;

	// get owner
	Users.findOne({userID: owner_id}, function(err, document) {
		if (!document) return console.log("owner not found");

		// get owner points
		var hash = (owner_bank == 'bankA' ? document.bankA : document.bankB);
		blockchain.getEntry(hash, (err, data) => {
			if (parseInt(data.points) < parseInt(transfer_points)) return console.log('not enough points');
			console.log(data);

			// create next entry
			blockchain.createEntry(owner_id, recipient_id, 'points', (parseInt(data.points) - parseInt(transfer_points)).toString(), hash, (err, data) => {
				if (err) return console.log('err creating entry for owner');
				console.log("Created new entry for owner:", data.hash);
				// update db
				if (owner_bank == 'bankA') {
					Users.findOneAndUpdate({userID: owner_id}, {$set: {bankA: data.hash.toString()}}, {upsert: true}, (err, data) => {
						console.log(err || data);
					});
				} else {
					Users.findOneAndUpdate({userID: owner_id}, {$set: {bankB: data.hash.toString()}}, {upsert: true}, (err, data) => {
						console.log(err || data);
					});
				}

				// get recipient hash
				Users.findOne({userID: recipient_id}, function(err, document) {
					if (!document) return console.log("recipient not found");

					var hash = (recipient_bank == 'bankA' ? document.bankA : document.bankB);
					// get recipient points
					blockchain.getEntry(hash, (err, data) => {
						// add entry to recipient
						blockchain.createEntry(owner_id, recipient_id, 'points', (parseInt(data.points) + parseInt(transfer_points)).toString(), hash, (err, data) => {
							if (err) return console.log('err creating entry for recipient');

							console.log("Created new entry for recipient:", data.hash);
							// update db
							if (recipient_bank == 'bankA') {
								Users.findOneAndUpdate({userID: recipient_id}, {$set: {bankA: data.hash.toString()}}, {upsert: true}, (err, data) =>{
									console.log(err || data);
								});
							} else {
								Users.findOneAndUpdate({userID: recipient_id}, {$set: {bankB: data.hash.toString()}}, {upsert: true}, (err, data) =>{
									console.log(err || data);
								});
							}
						});
					})

				})
			})

		})
	})
})

app.post('/transferMiles', (req, res) => {
	console.log('transferring miles:', req.body);
	var owner_id = req.body.owner_id;
	var owner_airline = req.body.owner_airline;

	var recipient_id = req.body.recipient_id;
	var recipient_airline = req.body.recipient_airline;

	var transfer_miles = req.body.transfer_miles;

	// get owner
	Users.findOne({userID: owner_id}, function(err, document) {
		if (!document) return console.log("owner not found");

		// get owner points
		var hash = (owner_airline == 'airlineA' ? document.airlineA : document.airlineB);
		blockchain.getEntry(hash, (err, data) => {
			if (parseInt(data.miles) < parseInt(transfer_miles)) return console.log('not enough miles');
			console.log(data);

			// create next entry
			blockchain.createEntry(owner_id, recipient_id, 'miles', (parseInt(data.miles) - parseInt(transfer_miles)).toString(), hash, (err, data) => {
				if (err) return console.log('err creating entry for owner');
				console.log("Created new entry for owner:", data.hash);
				// update db
				if (owner_airline == 'bankA') {
					Users.findOneAndUpdate({userID: owner_id}, {$set: {airlineA: data.hash.toString()}}, {upsert: true}, (err, data) => {
						console.log(err || data);
					});
				} else {
					Users.findOneAndUpdate({userID: owner_id}, {$set: {airlineB: data.hash.toString()}}, {upsert: true}, (err, data) => {
						console.log(err || data);
					});
				}

				// get recipient hash
				Users.findOne({userID: recipient_id}, function(err, document) {
					if (!document) return console.log("recipient not found");

					var hash = (recipient_airline == 'airlineA' ? document.airlineA : document.airlineB);
					// get recipient points
					blockchain.getEntry(hash, (err, data) => {
						// add entry to recipient
						blockchain.createEntry(owner_id, recipient_id, 'miles', (parseInt(data.miles) + parseInt(transfer_miles)).toString(), hash, (err, data) => {
							if (err) return console.log('err creating entry for recipient');

							console.log("Created new entry for recipient:", data.hash);
							// update db
							if (recipient_airline == 'airlineA') {
								Users.findOneAndUpdate({userID: recipient_id}, {$set: {airlineA: data.hash.toString()}}, {upsert: true}, (err, data) =>{
									console.log(err || data);
								});
							} else {
								Users.findOneAndUpdate({userID: recipient_id}, {$set: {airlineB: data.hash.toString()}}, {upsert: true}, (err, data) =>{
									console.log(err || data);
								});
							}
						});
					})

				})
			})

		})
	})
})

app.post('/transferItem', (req, res) => {
	console.log('transferring items:', req.body);
	var owner_id = req.body.owner_id;
	var recipient_id = req.body.recipient_id;
	var item_id = req.body.item_id;

	// retrieve item
	Items.findOne({itemID: item_id}, function(err, document) {
		if (!document) return res.send('Item not found');
		blockchain.getEntry(document.lastHash, (err, data) => {
			if (err) return res.send('Blockchain entry not found');
			// verify ownership
			if (data.recipientpk != owner_id) {
				console.log('WARNING: ownership unverified');
			}
			//create entry
			blockchain.createEntry(owner_id, recipient_id, 'item', item_id, document.lastHash, (err, data) => {
				//upsert entry
				Items.findOneAndUpdate({itemID: item_id}, {$set: {lastHash: data.hash, ownerID: recipient_id}}, {upsert: true}, function(err,doc) {
					if (err) { throw err; }
					else {
						console.log("Updated");
						res.status(200);
					}
				});
			});

		})
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

function fetchUserDetails(username, callback) {
	Users.findOne({userID: username}, function(err, document) {
		if (!document) { return callback(null); }
		loggedInUser = username;

		//fetch points
		blockchain.getEntry(document.bankA, (err, data) => {
			document.bankA_points = data.points;
			blockchain.getEntry(document.bankB, (err, data) => {
				document.bankB_points = data.points;
				blockchain.getEntry(document.airlineA, (err, data) => {
					document.airlineA_miles = data.miles;
					blockchain.getEntry(document.airlineB, (err, data) => {
						document.airlineB_miles = data.miles;
						loggedInUserData = document;
						callback(document);
					})
				})
			});
		})
	})
}

app.post('/login',(req,res)=>{
	var username = req.body.username;
	fetchUserDetails(username, (data) => {
		res.render('mainplace', {user: data});
	})
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

app.get('/test',(req,res)=>{
	res.sendFile(path.join(__dirname+'/views/staticHTML/redeem.html'));
})



app.listen(port,()=>{
	console.log(`Node server started on Port ${port} at `, Date());
});

function retrieveUserInfo(user_id){
	return userData[user_id-1];
}


//For Adding new item to DB
function addingItemsToDB (item_id, catalogue_id){

	//Need to check this once more
	switch(catalogue_id){
		case 100<catalogue_id<104:
		bank_id = 50;
		break;
		case 105<catalogue_id<109:
		bank_id = 51;
		break;
		case 110<catalogue_id<114:
		bank_id = 52;
		break;
	}
	var item = Items({
		itemID: item_id,
		ownerID: bank_id,
		lastHash: null
	});

	item.save((err)=>{
		if(err){
			console.log('Error Adding Item To DB! ',err);
		}else{
			console.log('Adding Item to DB OK!');
		}
	})
}

//For Updating Items in DB
function updatingItemsDB(item_id, latestHash, newOwner_id){
	var condition = {itemID : item_id};
	var updates = {ownerID: newOwner_id, lastHash: latestHash};

	Items.update(condition, updates,{multi:false},(err)=>{
		if(err){
			console.log('Error Updating Items DB!', err);
		} else {
			console.log('Updating Items DB OK!');
		}
	})
}

//For Updating User DB
function updatingUsersDB(giver_id, recipient_id, transactionType,cardNO,item_id){

	var giverCondition = {userID: giver_id};
	var giverInfo = retrieveUserInfo(giver_id);
	var recipientCondition = {userID: recipient_id};
	var recipientInfo = retrieveUserInfo(recipient_id);

	User.update({_id: "59ec4e1cdd623c12cb680161","BankInfo.cardNO":690783476732502},{$push: {'bankInfo.$.rewardPoints': 5555555}},(err)=>{});
}
