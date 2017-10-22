const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;

const {mongoose} = require('./db/mongoose.js');
const {Rewards} = require('./db/models/Rewards.js')

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

// Get blocks
app.get('/blockchain', (req, res) => {
	blockchain.createEntry();
	res.send('OK');
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

    createEntry(owner_id, recipient_id, object_id);

     

})



app.listen(port,()=>{
    console.log(`Node server started on Port ${port} at `, Date());
});

function retrieveSearchResults (){ 
}
