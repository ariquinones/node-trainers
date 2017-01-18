const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TrainersApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db');
	}
	console.log('Connected to MongoDb server');

	//findOneAndUpdate 
	db.collection('Trainers').findOneAndUpdate({
		_id: new ObjectID('587e31d5d4b446fdcd54cfe0')
	}, {
		$set: {
			name: "Tyler B."
		},
		$inc: {
			points: 1
		}
	}, {
		returnOriginal: false
	}).then((result) => {
		console.log(result)
	})
	// db.close();
});

//documentation can be found in https://docs.mongodb.com/manual/reference/operator/update/