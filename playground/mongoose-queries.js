const {ObjectId} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {Trainer} = require('./../server/models/trainer');

var id = '5880485f0072c7a19e571519';
if (!ObjectId.isValid(id)) {
	console.log('Id no valid')
}

// Todo.find({
// 	_id: id
// }).then((todos) => {
// 	console.log('todos', todos);
// });

// Todo.findOne({
// 	_id: id
// }).then((todo) => {
// 	console.log('todo', todo);
// });

// Todo.findById(id).then((todo) => {
// 	if(!todo) {
// 		return console.log('Id not found')
// 	}
// 	console.log('Todo by id', todo);
// }).catch((e) => console.log(e));

Trainer.findById(id).then((trainer) => {
	if(!trainer) {
		return console.log('Trainer not found')
	}
	console.log('Trainer ', trainer);
}).catch((e) => console.log(e));
