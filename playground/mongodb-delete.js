const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TrainersApp', (err, db) => {
	if (err) {
		return console.log('Unable to connect to db');
	}
	console.log('Connected to MongoDb server');

	//deleteMany
	// db.collection('Trainers').deleteMany({
	// 	complete: false
	// }).then((result) => {
	// 	console.log(result);
	// });

	//deleteOne
	// db.collection('Trainers').deleteOne({name: 'Mon'}).then((result) => {
	// 	console.log(result)
	// });

	//findOneAndDelete
	// db.collection('Trainers').findOneAndDelete({name: 'Bob'}).then((result) => {
	// 	console.log(result)
	// });

	// db.close();
});
