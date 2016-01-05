var app = angular.module('Voting', ['chart.js']);

app.factory('UserAuthService', ['$rootScope', function($rootScope){
    var isLoggedIn = false;
    var userData  = {};
    var broadcast = function(data){
        isLoggedIn = data.isloggedIn;
        if(isLoggedIn == true){
            userData.userName = data.userName;
            userData.userId = data.userId;
        }else{
            userData.userName = null;
            userData.userId = null;
        }
        $rootScope.$broadcast('handleUserLogin', data);
    };

    return{
        isLoggedIn: isLoggedIn,
        userData : userData,
        broadcast: broadcast
    }
}]);


app.controller('NavController', ['$scope', '$http', '$location', 'UserAuthService', function($scope, $http, $location, userAuth){
    $scope.$on('handleUserLogin', function(event, args){
        
       $scope.isLoggedIn = args.isloggedIn;
       $scope.userName = args.userName;
    });
    $scope.isLoggedIn = userAuth.isLoggedIn;
    $scope.userName = "";
    
    $scope.logout = function(){
        $http.get('/api/logout').then(function(response){
            userAuth.broadcast(false);
            $location.path('/');
        });
    }
}])

app.controller('LogoutController', ['$location', '$http', 'UserAuthService', function($location, $http, userAuth){
    $http.get('/api/logout').then(function(response){
        userAuth.broadcast({isloggedIn :false});
        $location.path('/');
    })
    
}]);

app.controller('LoginController', ['$scope', '$http', '$location', 'UserAuthService', function($scope, $http, $location, userAuth){
    $scope.email = '';
    $scope.password = '';
    $scope.login = function(){
        if($scope.login_form.$valid){
            $http.post('/api/login', {email: $scope.email, password: $scope.password}).then(function(response){
                userAuth.broadcast({isloggedIn : true, userName : response.data.name, userId : response.data._id});
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
                    userAuth.broadcast({isloggedIn : true, userName : response.name, userId : response._id});
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
               $location.path("/poll/"+response.data._id);
            });
        }
    }
    
}]);

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
})

app.controller('UserPollsController', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.polls = [];
    $scope.errorMessage = '';
    $scope.tab = 2;
    $scope.setTab = function(tabnumber){
        $scope.tab = tabnumber;
        $scope.refreshData();
    }
    $scope.isSet = function(tabnumber){
        return ($scope.tab == tabnumber);
    }
    $scope.refreshData = function(){
        var api = '/api/polls';
        if($scope.tab == 1){
            api += '?filterbyCurrentUser=true'
        }
        else{
            api += '?filterbyCurrentUser=false'
        }
        $http.get(api).then(function(response){
            if(response.status == 200){
                $scope.polls = response.data;
            }
            else{
                $scope.errorMessage = response.data;
            }
        });
    }
    $scope.refreshData();
}]);

app.controller('PollDetailsController', ['$scope', '$http', '$location', '$routeParams', 'UserAuthService', function($scope, $http, $location, $routeParams, userAuth){
    $scope.poll = {};
    $scope.errorMessage = "";
    $scope.userVoted = false;
    $scope.vote = {userVote : ""};
    $scope.chart = {};
    
    $http.get('/api/poll/'+$routeParams["poll_id"]).then(function(response){
        if(response.status == 200){
            $scope.poll = response.data;
            refreshChartData();
        }
        else{
            $scope.errorMessage = response.data;
        }
    });
    
    function refreshChartData(){
        //chart data
        $scope.vote.userVote = $scope.poll.choices[0].value;
        $scope.userVoted = $scope.poll.choices.find(function(choice){ return choice.voters.indexOf(userAuth.userData.userId) != -1 });
        $scope.chart.labels = $scope.poll.choices.map(function(choice){return choice.value});
        $scope.chart.data =  [$scope.poll.choices.map(function(choice){return choice.voteCount})];
    }
    
    $scope.castVote = function(){
        $http.post('/api/poll/'+$routeParams["poll_id"]+"/addVote", {choice : $scope.vote.userVote}).then(function(response){
            if(response.status == 200){
                $scope.poll = response.data;
                refreshChartData();
                $scope.userVoted = true;
            }
            else{
                $scope.errorMessage = response.data;
            }
        });
    }
    
}]);

