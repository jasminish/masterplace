const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;

const userData = require('./JSON/Users.json');

console.log(userData);

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

//Search
app.get('/search',(req,res)=>{
	console.log('Loading a search page.');
	console.log(userData)
})



app.listen(port,()=>{
	console.log(`Node server started on Port ${port} at `, Date());
});

function retrieveSearchResults (){ 
}