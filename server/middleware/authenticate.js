var {User} = require('./../models/user');


var authenticate = (req, res, next) => {
	//var token = req.header('x-auth');
	var token = req.session.token;
	//console.log("REQ HEADER LOGGED ", token);
	User.findByToken(token).then((user) => {
		if(!user) {
			console.log('no user')
			return Promise.reject();
		}
		req.user = user;
		req.token = token;
		next();
	}).catch((e) => {
		console.log('no token')
		res.redirect('/');
		//res.status(401).send();
	});
};

module.exports = {authenticate};
