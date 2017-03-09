const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var TrainerSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true
	},
	firstName: {
		type: String, 
		required: true,
		minlength: 1,
		trim: true
	},
	lastName: {
		type: String,
		trim: true
	},
	workNumber: {
		type: Number,
		minlength: 10
	},
	mobileNumber: {
		type: Number,
		minlength: 10
	},
	promoCode: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	timesUsed: {
		type: Number,
		default: 0
	},
	points: {
		type: Number,
		default: 0
	},
	cashPoints: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Number,
		default: new Date().getTime()
	}
});
var Trainer = mongoose.model('Trainer', TrainerSchema);

module.exports = {Trainer}

// var newTrainer = new Trainer({
// 	name: 'Jeremy'
// });

// newTrainer.save().then((doc) => {
// 	console.log('saved trainer', doc)
// }, (err) => {	
// 	console.log("unable to save", err);
// })

// module.exports = {Trainer}