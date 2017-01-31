const {ObjectId} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {Trainer} = require('./../server/models/trainer');

// Removes all todos from collection
Todo.remove({}).then((result) => {
	console.log(result)
});

// Removes the first todo that meets the object passed in
Todo.findOneAndRemove({text: 'some text'}).then((todo) => {
	console.log(todo);
});

// Removes by only having the right id 
Todo.findByIdAndRemove('').then((todo) => {
	console.log(todo);
});