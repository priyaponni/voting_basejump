angular.module('approutes',[]).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	$routeProvider
	.when('/',{
	    templateUrl : '/public/views/login.html',
	    controller : 'LoginController'
	 }).when('/signup' ,{
	    templateUrl : '/public/views/signup.html',
	    controller : 'SignUpController'
	 }).when('/user_home', {
	 	templateUrl : '/public/views/user_home.html',
	 	controller : 'UserHomeController'
	 })
	 $locationProvider.html5Mode(true);
}]);