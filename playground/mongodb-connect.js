//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

var obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TrainersApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db');
	}
	console.log('Connected to MongoDb server');

	// db.collection('Trainers').insertOne({
	// 	name: 'Bob'
	// }, (err, result) => {
	// 	if(err){
	// 		return console.log('error inserting', err);
	// 	}
	// 	console.log(JSON.stringify(result.ops, undefined, 2));
	// })

	db.close();
});



// to run this file on terminal: node playground/mongodb-connect.js

// to start db server go to mongo/bin under users directory, then run command: 
// ./mongod --dbpath ~/mongo-data 
