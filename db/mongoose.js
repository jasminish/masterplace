const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/masterPlace',function(err){
	if(err){
		console.log(err);
	} else {
		console.log('Server connection Ok!');
	}
});


module.exports = {mongoose};