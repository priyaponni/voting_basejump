var User = require('../models/vote_users.js');

function LoginHandler(){
    this.signup = function(name, email, password, callback){
        var newUser = new User({
            name: name,
            email: email,
            password: password
        });
        newUser.save(function(err, result){
            if(err){
                console.log('**ERROR ' + err);
            }
            else{
                console.log('** DB Success' + result);
               callback(null, result)
            }
        });
    }
    
    this.login = function(email, password, callback){
        User.findOne({email: email}, function(err, doc){
            if(err || !doc)
                callback('Username not found');
            else{
                if(doc.password == password){
                    callback(null, doc);
                }else{
                    callback('Password doesn\'t match');
                }
            }
        })
    }
    
    
}

module.exports = LoginHandler;