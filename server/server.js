var express = require('express');
var bodyParser = require('body-parser');

// Local imports
var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {Trainer} = require('./models/trainer');


var app = express();
// this makes the app send json data to server
app.use(bodyParser.json());
// creating a todo
app.post('/todos', (req,res) => {
	var todo = new Todo({
		text: req.body.text
	});

	todo.save().then((doc) => {
		res.send(doc);
	}, (e) => {
		res.status(400).send(e);
	});
});

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos});
	}, (e) => {
		res.status(400).send(e);
	})
})


app.listen(3000, () => {
	console.log('Started on port 3000')
});

