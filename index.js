'use strict';

let util = require('util');
let http = require('http');
let Bot = require('@kikinteractive/kik');
let Util = require('./util.js');
var redis = require('redis').createClient(process.env.REDIS_URL | 'redis://localhost:6379/1');

let questions = [
    "Did you take 10k steps today?",
    "Did participate in at least 4 hugs today?",
    "Did you tell yourself: \"I am the architect of my life; I build its foundation and choose its contents.\" today?",
    "Did you check your privilege?",
    "Did you take at least one big, beefy poop?"
]

let keyboardNo = ["No", "Nah", "No, I suck", "Nope"]
let keyboardYes = [
    "Yes",
    "Yup",
    "Uh huh",
    "Of course",
    "Yes, I rock",
    "You bet",
    "Hellz to the yeah",
    "Oh you best believe it"];

let yesResponses = [
    "Excellent",
    "Satisfactory.",
    "That's great. Really great",
    "It's the least you could do",
    "Ok",
    "Good",
    "Alright"
]

let noResponses = [
    ":(",
    "That's too bad",
    "Sad.",
    "Seriously?",
    "Ugh.",
    "Boo",
    "Why do I even bother?",
]

let confusedResponses = [
    "What?",
    "Huh?",
    "You're not making sense."
]

let stateHandlers = {
    'new': (message, state) => {
        var reply = Bot.Message.text("Hello there. Are you tired of being unhappy, of feeling your life is wasted, or just never being sure if you're good enough?")
        reply.addTextResponse("Yes 😥");

        state['state'] = 'new2';
        putState(state, (err) => {
            message.reply(reply);
        });
    },
    'new2': (message, state) => {
        var reply = Bot.Message.text("Of course you are! I can help. Ill ask you " + questions.length
            + " questions every day, and being able to answer yes to all of them "
            + "will give your life purpose.")
        reply.addTextResponse("Finally");
        reply.addTextResponse("Sounds awful");
        message.reply(reply);
        state['state'] = 'new3';
        putState(state);
    },
    'new3': (message, state) => {

        message.reply(Bot.Message.text("Great, lets get started"));

        message.reply(Bot.Message.text(questions[0])
            .addTextResponse(keyboardYes.randomElement())
            .addTextResponse(keyboardNo.randomElement()))

        state['state'] = 'questions';
        state['answered'] = 0;
        state['yes'] = 0;
        putState(state);
    },
    'questions': (message, state) => {

        if (keyboardYes.contains(message.body)) {
            message.reply(yesResponses.randomElement())
            state['answered']++;
            state['yes']++;
        }
        else if (keyboardNo.contains(message.body)) {
            message.reply(noResponses.randomElement())
            state['answered']++
        }
        else {
            message.reply(
                Bot.Message.text(confusedResponses.randomElement())
            );
        }

        if (state.answered >= questions.length) {
            message.reply("That's it for today.");
            state['state'] = 'waiting';
        } else {
            message.reply(Bot.Message.text(questions[state['answered']])
                .addTextResponse(keyboardYes.randomElement())
                .addTextResponse(keyboardNo.randomElement()));
        }

        putState(state);
    }
}

function getState(user, callback) {
    var skey = user + ":state";
    redis.get(skey, (err, stateJSON) => {
        if (err) return callback(err);
        var state = { state: 'new', user: user }
        if (stateJSON) {
            state = JSON.parse(stateJSON);
        }
        callback(null, state);
    });
}

function putState(state, callback) {
    var skey = state['user'] + ":state";
    redis.set(skey, JSON.stringify(state), callback);
}


// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: 'ratemyday',
    apiKey: '28468b56-d8ce-41b0-a736-115aa8f3465d',
    baseUrl: 'https://7dca070f.ngrok.io'
});

bot.updateBotConfiguration();

bot.onTextMessage((message) => {
    getState(message.from, (err, state) => {
        if (err) return console.log(err);
        console.log(state);
        stateHandlers[state.state](message, state);
    });
});


console.log("Starting to listen")
let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);