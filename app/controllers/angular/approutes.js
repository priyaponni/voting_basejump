angular.module('approutes',[]).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	$routeProvider
	.when('/',{
	    templateUrl : '/public/views/login.html',
	    controller : 'LoginController'
	 }).when('/about', {
	 	templateUrl : '/public/views/about.html'
	 }).when('/signup' ,{
	    templateUrl : '/public/views/signup.html',
	    controller : 'SignUpController'
	 }).when('/user_home', {
	 	templateUrl : '/public/views/user_home.html',
	 	controller : 'CreatePollController'
	 }).when('/logout', {
	 	controller : 'LogoutController'
	 }).when('/poll/:poll_id', {
	 	templateUrl: '/public/views/poll.html',
	 	controller : 'PollDetailsController',
	 	resolve: {
	 		delay : function($q, $timeout){
	 			var delay = $q.defer;
	 			$timeout(delay.resolve, 1000);
	 			return delay.promise;
	 		}
	 	}
	 }).when('/polls', {
	 	templateUrl : '/public/views/polls.html',
	 	controller: 'UserPollsController'
	 })
	 $locationProvider.html5Mode(true);
}]);