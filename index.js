'use strict';

let util = require('util');
let http = require('http');
let Bot = require('@kikinteractive/kik');
let Util = require('./util.js');
let Logic = require('./logic.js');
let redis = require('redis').createClient(process.env.REDIS_URL || 'redis://localhost:6379/1');

let PORT = process.env.PORT || 8080;
let DEBUG = !process.env.REDIS_URL; // hack hack hack

var bot;

if (DEBUG) {
    console.log("in debug mode");
    require('ngrok').connect(PORT, (err, url) => {
        console.log('ngrok url: ' + url);
        let bot = new Bot({
            username: 'cbtest.dev',
            apiKey: 'aee21983-9bb0-4b11-9d46-2fff8518f24f',
            baseUrl: url
        });
        bot.updateBotConfiguration();
        setup(bot)
    });
} else {
    console.log("in production mode");
    // Configure the bot API endpoint, details for your bot
    let bot = new Bot({
        username: 'ratemyday',
        apiKey: '28468b56-d8ce-41b0-a736-115aa8f3465d',
        baseUrl: 'https://fathomless-retreat-72110.herokuapp.com/'
    });

    bot.updateBotConfiguration();
    setup(bot)
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

function setup(bot) {

    function handleMessage(message) {
        getState(message.from, (err, state) => {
            if (err) return console.log(err);

            if (message.body == "Reset") {
                putState({ user: message.from, state: 'new' });
                message.reply("Forgot-you-now.")
                console.log("Resetting for " + message.from);
                return
            }
            console.log(state);

            var replies = []
            Logic.stateHandlers[state.state](message, state, replies);
            putState(state, (err) => {
                if (err) {
                    console.log(err);
                    message.reply("Oops I broke");
                    return;
                }
                //console.log(replies)
                bot.send(replies, message.from);
            });
        });
    }

    bot.onTextMessage(handleMessage);
    bot.onStartChattingMessage(handleMessage);
    console.log("Starting to listen")
    let server = http
        .createServer(bot.incoming())
        .listen(PORT);
}
