const path = require('path');
const publicPath = path.join(__dirname, '/public/');
const {ObjectId} = require('mongodb');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

require('./config/config');
var {emailPassword} = require('./config/secrets');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var nodemailer = require('nodemailer');
var async = require('async');

// Local imports
var {mongoose} = require('./db/mongoose');
var {Trainer} = require('./models/trainer');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');
//var trainers = require('./public/trainers');

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'x-auth, X-Requested-With, content-type, Authorization');
    next();
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(publicPath));
app.set('views', path.join(__dirname, 'views'));
//app.use('/', trainers);
app.set('view engine', 'ejs');

//  SENDING CONFIRMATION EMAILS 
var nev = require('email-verification')(mongoose);
var myHasher = function(password, tempUserData, insertTempUser, callback) {
  bcrypt.genSalt(8, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      return insertTempUser(hash, tempUserData, callback);
    });
  });
};

nev.configure({
    verificationURL: 'http://localhost:3000/email-verification/${URL}',
    persistentUserModel: User,
    tempUserCollection: 'mynutritiondepot_tempusers',
    sendConfirmationEmail: false,
    transportOptions: {
        service: 'Gmail',
        auth: {
            user: 'ariquinones0015@gmail.com',
            pass: emailPassword
        }
    },
    hashingFunction: myHasher,
  	passwordFieldName: 'password',
    verifyMailOptions: {
        from: 'Do Not Reply <ariquinones0015_do_not_reply@gmail.com>',
        subject: 'Please confirm account',
        html: 'Click the following link to confirm your account:</p><p>${URL}</p>',
        text: 'Please confirm your account by clicking the following link: ${URL}'
    }
}, function(error, options){
	if(error) {
		console.log(error);
		return;
	 }

	 console.log('configured: ' + (typeof options === 'object'));
});

nev.generateTempUserModel(User, function(err, tempUserModel) {
	if(err) {
		console.log(err);
		return;
	}
	console.log('generated temp user model: ' + (typeof tempUserModel === 'function'));
});
app.post('/users', (req,res) => {
	var body = _.pick(req.body, ['email', 'password']);
	var email = req.body.email;
	var user = new User(body);

	nev.createTempUser(user, function(err, existingPersistentUser, newTempUser) {
	    if (err){
	        res.render('login.ejs', {errMessages: "Problem signing up. Please verify your email and password and try again"}); 
	        return;
	    }
	    if (existingPersistentUser) {
	    	res.render('login.ejs', {errMessages: "Problem signing up. User already exists"});
	    	return;
	    }
	    if (newTempUser) {
	        var URL = newTempUser[nev.options.URLFieldName];
	        nev.sendVerificationEmail(email, URL, function(err, info) {
	            if (err) {
	                res.render('login.ejs', {errMessages: "Problem sending email. Please contact MyNutritonDepot Management"}); 
	                return; 
	            }
	        	console.log("email sent successfully ", info);
	        	res.render('login.ejs', {errMessages: "A verifcation email has been sent to the email provided. Please check your spam folder."}); 
	        	return; 
	        });
	    } 
	    else {
	        // user already exists in temporary collection... 
	        res.render('login.ejs', {errMessages: "This email has already been used"}); 
	        return; 
	    }
	});
});

app.get('/email-verification/:token', function(req, res) {
  var token = req.params.token;

  nev.confirmTempUser(token, function(err, user) {
  	
    if (user) {
    	console.log(user)
      	nev.sendConfirmationEmail(user.email, function(err, info) {
	        if (err) {
	        	console.log('error sending confirmation email', err);
	          return res.status(404).send('ERROR: sending confirmation email FAILED');
	        }
	        console.log('Email CONFIRMED!');
	        res.redirect('/trainers');
      	});
    } 
    if (err) {
    	console.log('Confirm email failed', err);
      	return res.status(404).send('ERROR: confirming temp user FAILED');
    }
  });
});



app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html')
});

app.get('/trainers', authenticate, function(req, res) {
	var admin = req.user.admin;
	Trainer.find(function(err, trainers) {
		if (err) {
			var errMessages = ['Could not connect to server']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			res.send(err)
		}
		res.render('trainers.ejs', {trainers: trainers, admin: admin});
	});
});

app.get('/trainer/:id', authenticate, function(req, res) {
	var admin = req.user.admin;
	var id = req.params.id;

	if (!ObjectId.isValid(id)) {
		var errMessages = ['Trainer Id is invalid please make sure you have the right Id']
		return res.render('error.ejs', {errMessages: errMessages, admin: admin});
		//return res.status(404).send();
	}

	Trainer.findOne({
		_id: id
	}, function(err, trainer) {
		if (err) {
			var errMessages = ['Unable to find Trainer by Id']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			//res.send(err)
		}
		res.render('trainer.ejs', {trainer: trainer, admin: admin});
	});
});

app.post('/trainer/delete/:id', authenticate, function(req, res) {
	var id = req.params.id;

	if (!ObjectId.isValid(id)) {
		return res.status(404).send();
	}

	Trainer.findOneAndRemove({
		_id: id
	}, function(err, trainer) {
		if (err) {
			res.send(err)
		}
		console.log("trainer deleted", trainer);
	});
	res.redirect('/trainers');
})

app.post('/trainer/update/:id', authenticate, function(req, res) {
	var admin = req.user.admin;
	var id = req.params.id;

	if (!ObjectId.isValid(id)) {
		return res.status(404).send();
	}
	Trainer.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not update trainer']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
		}
	});
	Trainer.findOne({
		_id: id
	}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not find trainer']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			res.send(err)
		}
		res.render('trainer.ejs', {trainer: trainer, admin: admin});
	});
});

app.post('/trainer/addpoints/:id',authenticate, function(req, res) {
	var admin = req.user.admin;
	var id = req.params.id;
	if (!ObjectId.isValid(id)) {
		return res.status(404).send();
	}
	
	req.body.timesUsed = parseInt(req.body.timesUsed) + 1;

	Trainer.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not update trainer']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			res.send(err)
		}
	});
	Trainer.findOne({
		_id: id
	}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not find trainer']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			res.send(err)
		}
		res.render('trainer.ejs', {trainer: trainer, admin: admin});
	});
});

app.post('/trainer/redeem/:id',authenticate, function(req, res) {
	var admin = req.user.admin;
	var id = req.params.id;
	if (!ObjectId.isValid(id)) {
		return res.status(404).send();
	}
	Trainer.findOneAndUpdate({_id: id}, {$set: req.body}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not update trainer']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			res.send(err)
		}
	});
	Trainer.findOne({
		_id: id
	}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not find trainer']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			res.send(err)
		}
		res.render('trainer.ejs', {trainer: trainer, admin: admin});
	});
});

app.get('/admin', authenticate, function(req, res) {
	var admin = req.user.admin;
	res.render('admin.ejs', {admin: admin});
});

app.post('/admin', authenticate, function(req, res) {
	var admin = req.user.admin;
	var trainer = new Trainer(req.body);

	trainer.save(function(err) {
		if (err) {
			var errMessages = []
			for (var key in err.errors) {
				errMessages.push(err.errors[key].message)
			}
		 	return res.render('error.ejs', {
				    errMessages: errMessages,
				    admin: admin
				  });
		}
		Trainer.findOne({
			_id: trainer._id
		}, function(err, trainer) {
			if (err) {
				res.send(err)
			}
			res.render('trainer.ejs', {trainer: trainer, admin: admin});
		});
	})
});

app.get('/trainer/searchpromo/:searchQuery', authenticate, function(req, res) {
	var admin = req.user.admin;
	var searchQuery = req.params.searchQuery;
	Trainer.findOne({
		promoCode: searchQuery
	}, function(err, trainer) {
		if (err) {
			var errMessages = ['Could not find trainer by that promo code']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
			//return res.send(err);
		}
		else if (trainer == null) {
			var errMessages = ['Could not find trainer by that promo code']
			return res.render('error.ejs', {errMessages: errMessages, admin: admin});
		}
		else {
			 res.render('trainer.ejs', {trainer: trainer, admin: admin});
		}
		
	});
});

// app.post('/users', (req,res) => {
// 	var body = _.pick(req.body, ['email', 'password']);
// 	var email = req.body.email;
	
// 	if (email == 'employee@mynutritiondepot.com') {
// 		body.admin = false
// 	}

// 	var user = new User(body);

// 	user.save().then((user) => {
// 		return user.generateAuthToken();
// 	}).then((token) => {
// 		req.session.token = token;
// 		res.redirect('/trainers');
// 	}).catch((e) => {
// 		res.render('login.ejs', {errMessages: "Problem signing up. Please verify your email and password and try again"});
// 		res.status(400).send(e);
// 	})
// });

app.post('/users/login', (req, res) => {
	var body = _.pick(req.body, ['email', 'password']);
	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			//res.header('x-auth', token).send(user);
			req.session.token = token;
			res.redirect('/trainers');
		});
	}).catch((e) => {
		res.render('login.ejs', {errMessages: "Problem logging in. Please verify your email and password and try again"});
		res.status(400).send();
	});
});

app.get('/logout', authenticate, (req, res) => {
	req.user.removeToken(req.session.token).then(() => {
		res.redirect('/');
	}, () => {
		res.redirect('/');
	});
});

app.get('/forgot', (req, res) => {
	res.render('forgotPassword.ejs', {errMessages: " "});
});

app.post('/forgot', (req,res) => {
	async.waterfall([
	  function(done) {
	    crypto.randomBytes(20, function(err, buf) {
	      var token = buf.toString('hex');
	      done(err, token);
	    });
	  },
	  function(token, done) {
	    User.findOne({ email: req.body.email }, function(err, user) {
	      if (!user) {
	        console.log('no user found')
	        return res.render('forgotPassword.ejs', {errMessages: "No user by that email address was found"});
	        //req.flash('error', 'No account with that email address exists.');
	        //return res.redirect('/forgot');
	      }
	      user.resetPasswordToken = token;
	      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

	      user.save(function(err) {
	        done(err, token, user);
	      });
	    });
	  },
	  function(token, user, done) {
		var smtpTransport = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: 'ariquinones0015@gmail.com',
				pass: emailPassword
			}
		});
	    var mailOptions = {
	      to: user.email,
	      from: 'passwordreset@mynutritiondepot.com',
	      subject: 'MyNutritionDepot Password Reset',
	      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your MyNutritionDepot app account.\n\n' +
	        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
	        'http://localhost:3000/reset/' + token + '\n\n' +
	        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
	    };
	    smtpTransport.sendMail(mailOptions, function(err) {
	      if(err) { 
	      	console.log('email sent') 
	      	return res.render('forgotPassword.ejs', {errMessages: "Unable to send email"});
	      }
	      res.render('forgotPassword.ejs', {errMessages: "Email has been sent to reset your password. Please check your spam folder"});
	      //req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
	      //done(err, 'done');
	    });
	  }
	], function(err) {
	  if (err) {
	  	console.log("ERROR", err)
	  	return res.render('forgotPassword.ejs', {errMessages: "Unable to submit your request"});
	  }
	  	//return next(err);
	  res.redirect('/forgot');
	});
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      res.render('forgotPassword.ejs', {errMessages: "Password reset token is invalid or has expired."});
      //req.flash('error', 'Password reset token is invalid or has expired.');
      //return res.redirect('/forgot');
    }
    res.render('reset.ejs', {user: req.user, errMessages: ""});
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          console.log('user not found by that token');
          return res.render('reset.ejs', {errMessages: "No user found."});
          //req.flash('error', 'Password reset token is invalid or has expired.');
          //return res.redirect('back');
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save().then((user) => {
        		return user.generateAuthToken();
        	}).then((token) => {
        		req.session.token = token;
        		res.redirect('/trainers');
        	}).catch((e) => {
        		res.render('forgotPassword.ejs', {errMessages: "Problem saving new password. Please contanct MyNutrition management"});
        		res.status(400).send(e);
        	})
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: 'ariquinones0015@gmail.com',
				pass: emailPassword
			}
		});
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@mynutritiondepot.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your MyNutritionDepot account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if(err) { 
	      	console.log('email sent')
	      	return res.render('reset.ejs', {errMessages: "Unable to send confirmation email."}); 
	    }
	    return res.render('forgotPassword.ejs', {errMessages: "Password has been successfully changed"});
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

app.get('/analytics', authenticate, (req, res) =>{
	var admin = req.user.admin;
	Trainer.find(function(err, trainers) {
		if (err) {
			var errMessages = ['Could not connect to server']
			return res.render('error.ejs', {errMessages: errMessages});
			res.send(err)
		}
		
		var mostUsed = trainers.reduce(function(prev, current) {
		    return (prev.timesUsed > current.timesUsed) ? prev : current
		})

		var trainerWithMostPoints = trainers.reduce(function(prev, current) {
		    return (prev.points > current.points) ? prev : current
		})
		var totalAccumulatedPoints = 0;
		for (x = 0; x < trainers.length; x++) {
			totalAccumulatedPoints += trainers[x].points
		}
		var totalAccumulatedCash = totalAccumulatedPoints / 100;

		res.render('analytics.ejs', {totalAccumulatedPoints, totalAccumulatedCash, trainerWithMostPoints, mostUsed, admin});
	});

});

// app.get('/login', (req,res) => {
// 	res.render('login.ejs');
// });

// // POST /users/login {email, password}
// app.post('/users/login', (req, res) => {
// 	var body = _.pick(req.body, ['email', 'password']);
// 	User.findByCredentials(body.email, body.password).then((user) => {
// 		return user.generateAuthToken().then((token) => {
// 			//res.header('Auth', token).send(user);
// 			//req.headers['x-access-token'] = token;
// 			req.session.token = token;
// 			var token = req.session.token;
// 			console.log("REQ HEADER LOGGED ", token);
// 			res.send(user);
// 		});
// 	}).catch((e) => {
// 		res.status(400).send();
// 	});
// });


app.listen(port, () => {
	console.log(`Started up at port ${port}`)
});


module.exports = {app};





