'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var LoginHandler = require(path + '/app/controllers/login_server.js');
var PollHandler = require(path + '/app/controllers/poll_handler.js');


module.exports = function (app, passport) {

	var userId;
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.sendFile(path + '/public/index_voting.html');
		}
	}

	var clickHandler = new ClickHandler();
	var loginHandler = new LoginHandler();
	var pollHandler = new PollHandler();

	app.route('/')
		.get( function (req, res) {
			res.sendFile(path + '/public/index_voting.html');
		});
	
	app.route('/signup')
		.post(function(req, res){
			console.log('***rew ' + req);
			loginHandler.signup(req.body.name, req.body.email, req.body.password, function(err, response){
				console.log('*** Response ' + response);
				req.session.user = response;
				res.json(response);
			});
		});
		
	app.route('/api/login')
		.post(function(req, res){
			loginHandler.login(req.body.email, req.body.password, function(err, response){
				console.log('ERROR' + err);
				console.log('RESPONSE ' + response);
				req.session.user = response;
				res.json(response);
			});
		});
		
	app.route('/api/logout')
		.get(function(req, res){
			req.session.user = null;
			res.sendFile(path + '/public/index_voting.html');
		});
	
	app.route('/api/getUserInfo')
		.get(function(req, res){
			console.log('**' + req.session.user);
			res.json(req.session.user);
		});
		
	app.route('/api/createPoll')
		.post(function(req, res){
			console.log('/api/createPoll/req.body.pollData' + JSON.stringify(req.body.pollData));
			pollHandler.createPoll(req.session.user._id, req.body.pollData, function(err, response){
				console.log('/api/createPoll');
				console.log('ERROR ' + err);
				console.log('response  : ' + response );
				res.json(response);
			});
		});
		
	app.route('/api/polls')
		.get(function(req, res){
			if(req.param('filterbyCurrentUser') == 'true'){
				pollHandler.getPollsByUser(req.session.user._id, function(err, response){
					if(err){
						res.writeHead({statusCode : 500});
						res.end(err);
					}else{
						res.json(response);
					}
				});
			}
			else{
				pollHandler.getAllPolls(function(err, response){
					if(err){
						res.writeHead({statusCode : 500});
						res.end(err);
					}else{
						res.json(response);
					}
				});
			}
			
		})
	

	app.route('/api/poll/:pollId')
		.get(function(req, res){
			console.log(req.params);
			pollHandler.getPollById(req.params.pollId, function(err, response){
				if(err){
					res.writeHead({statusCode : 500});
					res.end(err);
				}
				else{
					res.json(response);
				}
			});
		});
		
	app.route('/api/poll/:pollId/addVote')
		.post(function(req, res){
			pollHandler.addVote(req.session.user._id, req.params.pollId, req.body.choice, function(err, response){
				if(err){
					res.writeHead({statusCode : 500});
					res.end(err);
				}
				else{
					pollHandler.getPollById(req.params.pollId, function(err, response){
						if(err){
							res.writeHead({statusCode : 500});
							res.end(err);
						}
						else{
							res.json(response);
						}
					});		
				}
			})
		})
	
	app.route('/login')
		.get(function (req, res) {
			res.sendFile(path + '/public/login.html');
		});

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/login');
		});

	app.route('/profile')
		.get(isLoggedIn, function (req, res) {
			res.sendFile(path + '/public/profile.html');
		});

	app.route('/api/:id')
		.get(isLoggedIn, function (req, res) {
			res.json(req.user.github);
		});

	app.route('/auth/github')
		.get(passport.authenticate('github'));

	app.route('/auth/github/callback')
		.get(passport.authenticate('github', {
			successRedirect: '/',
			failureRedirect: '/login'
		}));

	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
		
	app.route('*').get(function(req, res){
		res.sendFile(path + '/public/index_voting.html')
	});

};
