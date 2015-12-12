'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var LoginHandler = require(path + '/app/controllers/login_server.js');


module.exports = function (app, passport) {

	var userId;
	function isLoggedIn (req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
	}

	var clickHandler = new ClickHandler();
	var loginHandler = new LoginHandler();

	app.route('/')
		.get(isLoggedIn, function (req, res) {
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
