var mongoose = require('mongoose');

var Trainer = mongoose.model('Trainer', {
	name: {
		type: String, 
		required: true,
		minlength: 1,
		trim: true
	},
	points: {
		type: Number,
		default: 0
	}
});

// var newTrainer = new Trainer({
// 	name: 'Jeremy'
// });

// newTrainer.save().then((doc) => {
// 	console.log('saved trainer', doc)
// }, (err) => {	
// 	console.log("unable to save", err);
// })

module.exports = {Trainer}