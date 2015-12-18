var Poll = require('../models/poll.js');

function PollHandler(){
    this.createPoll = function(userId, pollData, callback){
        var newPoll = new Poll({
            created_by: userId,
            question : pollData.question,
            totalVotes : 0,
            choices: []
        });
        pollData.choices.forEach(function(choice){
            var choiceVal = {};
            choiceVal.value = choice.text;
            choiceVal.voters = [];
            newPoll.choices.push(choiceVal);
        });
        newPoll.save(function(err, response){
            if(err){
                callback('Save error --- ' + err);
            }
            else{
                callback(null, newPoll);
            }
        })
    }
    
    this.getAllPolls = function(callback){
        Poll.find({}, function(err, docs) {
            if(err){
                callback(err);
            }else{
                callback(null, docs);
            }
        });
    }
    
    this.getPollsByUser = function(userId, callback){
        Poll.find({created_by: userId}, function(err, docs){
            if(err){
                callback(err);
            }else{
                callback(null, docs);
            }
        });
    }
    
    this.getPollById = function(pollId, callback){
        Poll.findOne({_id : pollId}, function(err, doc){
            if(err){
                callback(err);
            }
            else{
                callback(null, doc);
            }
        })
    }
    
    this.addVote = function(userId, pollId, choice, callback){
        console.log('pollHandler - addVote : choice' + userId + ' -- ' + pollId + ' -- ' + choice );
        Poll.findOne({_id : pollId,  'choices.value': choice}, function(err, doc){
            console.log('PollHandler - find ' + JSON.stringify(doc));
        })
        
        Poll.update({_id : pollId, 'choices.value': choice}, { $inc: {'choices.$.voteCount' : 1}, $push : {'choices.$.voters': userId}}, function(err, result){
            console.log('PollHandler addVote ' + JSON.stringify(result));
            callback(err, result);
        })
    }
}

module.exports = PollHandler;