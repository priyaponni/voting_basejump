var app = angular.module('Voting', []);

app.factory('UserAuthService', ['$rootScope', function($rootScope){
    var isLoggedIn = false;
    var broadcast = function(data){
        isLoggedIn = data
        $rootScope.$broadcast('handleUserLogin', isLoggedIn);
    };

    return{
        isLoggedIn: isLoggedIn,
        broadcast: broadcast
    }
}]);

app.controller('NavController', ['$scope', '$http', '$location', 'UserAuthService', function($scope, $http, $location, userAuth){
    $scope.$on('handleUserLogin', function(event, args){
       $scope.isLoggedIn = args;
    });
    $scope.isLoggedIn = userAuth.isLoggedIn;
    
    $scope.logout = function(){
        $http.get('/api/logout').then(function(response){
            userAuth.broadcast(false);
            $location.path('/');
        });
    }
}])

app.controller('LogoutController', ['$location', '$http', 'UserAuthService', function($location, $http, userAuth){
    $http.get('/api/logout').then(function(response){
        userAuth.broadcast(false);
        $location.path('/');
    })
    
}]);

app.controller('LoginController', ['$scope', '$http', '$location', 'UserAuthService', function($scope, $http, $location, userAuth){
    $scope.email = 'dhar@gmail.com';
    $scope.password = '123';
    $scope.login = function(){
        if($scope.login_form.$valid){
            $http.post('/api/login', {email: $scope.email, password: $scope.password}).then(function(response){
                console.log('Logged in --- ' + response);
                userAuth.broadcast(true);
                //$location.path("/" +response._id +"home");
                $location.path("/user_home");
            });
        }
    };
}]);

app.controller('SignUpController', ['$scope', '$location', 'UserAuthService', function($scope, $location, userAuth){
    $scope.name = '';
    $scope.email = '';
    $scope.password = '';
    $scope.confirmpassword = '';
    $scope.showError = false;
    $scope.errorMessage = '';
    $scope.signup = function(){
        
        if($scope.signup_form.$valid){
            $scope.showError = false;
            if($scope.password == $scope.confirmpassword){
                $.post('/signup', {name: $scope.name, email : $scope.email, password : $scope.password }, function(response){
                    userAuth.broadcast(true);
                    $scope.$apply(function() { $location.path("/user_home"); });
                });
            }
            else{
                $scope.showError = true;
                $scope.errorMessage = 'Passwords dont match! Confirm password again!'
            }
        }
    }
}]);

app.controller('CreatePollController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.userInfo = '';
    
    $http.get('/api/getUserInfo').then(function(response){
        console.log('** Response' + response);
        for(var value in response){
            console.log(value + ' --- ' + response[value]);
        }
        $scope.userInfo = response.data;
    });
    
    $scope.poll = {};
    
    $scope.poll.question = '';
    $scope.poll.choices = [{text:''}, {text:''}];
    
    $scope.poll.addChoice = function(value){
        $scope.poll.choices.push({text: value});
    }
    
    $scope.createPoll = function(){
        if($scope.pollform.$valid){
            console.log('')
            var pollData = {
                question: $scope.poll.question, 
                choices: $scope.poll.choices
            };
            
            $http.post('/api/createPoll', {pollData : pollData}).then(function(response){
               console.log('response for create poll ' + JSON.stringify(response) );
               $location.path("/"+response.data.created_by+"/poll/"+response.data._id);
            });
        }
    }
    
}]);

app.controller('PollDetailsController', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
    console.log('routeParams ----- ' + JSON.stringify($routeParams));
    $scope.poll = {};
    $scope.errorMessage = '';
    $http.get('/api/poll/'+$routeParams["poll_id"]).then(function(response){
        if(response.status == 200){
            $scope.poll = response.data;
        }
        else{
            $scope.errorMessage = response.data;
        }
    });
}]);

