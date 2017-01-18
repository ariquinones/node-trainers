const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TrainersApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db');
	}
	console.log('Connected to MongoDb server');

	// db.collection('Trainers').find({
	// 	_id : new ObjectID('587e31d5d4b446fdcd54cfe0')
	// }).toArray().then((docs) => {
	// 	console.log(JSON.stringify(docs, undefined, 2))
	// }, (err) => {	
	// 	console.log('Unable to fetch trainers', err)
	// });

	db.collection('Trainers').find().count().then((count) => {
		console.log(`Trainers count: ${count}`);
	}, (err) => {	
		console.log('Unable to fetch trainers', err)
	});

	// db.close();
});
