const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '124abc!';

// bcrypt.genSalt(10, (err, salt) => {
// 	bcrypt.hash(password, salt, (err, hash) => {
// 		console.log(hash);
// 	})
// })

// var hashedPassword = '$2a$10$aT00kbQj3M4Qtz7Fbj0sZ.p5UOpdvQgKvoEuPkGCkXOBxMZvuPT/2';
// bcrypt.compare(password, hashedPassword, (err, res) => {
// 	console.log(res);
// })
// var data = {
// 	id: 10
// };

// var token = jwt.sign(data, '123abc');
// var decoded = jwt.verify(token, '123abc');

// var message = "I am user number 3";
// var hash = SHA256(message).toString();

// var token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
// 	console.log('Data was not change')
// }
// else {
// 	console.log("Data was changed, do not trust")
// }