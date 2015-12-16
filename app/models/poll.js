'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var choiceSchema = new Schema({
    value: String,
    voteCount: {type: Number, default:0},
    voters: [String]
})

var PollSchema = new Schema({
    created_by : String,
    question : String,
    totalVotes :  {type: Number, default:0},
    choices: [choiceSchema]
})

module.exports = mongoose.model('Poll', PollSchema);