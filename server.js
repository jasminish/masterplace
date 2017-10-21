const express = require('express');
//const {User} = require('./db/model/users.js');

const app = express();
const port = process.env.port || 3000;

app.get('/',(req,res)=>{
	console.log('hi');
	res.send('hi');
})

app.listen(port,()=>{
	console.log(`Node server started on Port ${port} at `, Date());
});