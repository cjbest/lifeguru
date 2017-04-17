'use strict';

const util = require('util');
const http = require('http');
const Bot = require('@kikinteractive/kik');
const StateMachine = require('./statebot/statemachine.js');
const RedisPersister = require('./statebot/redispersister.js');
const QuestionBot = require('./questionbot.js');

const PORT = process.env.PORT || 8080;
const DEBUG = !process.env.REDIS_URL; // hack hack hack

if (require.main === module) {
    var sm;
    var server;
    if (DEBUG) {
        console.log("in debug mode");
        require('ngrok').connect(PORT, (err, url) => {
            if (err) {
                console.log("NGROK ERROR")
                throw err
            }
            console.log('ngrok url: ' + url);
            let bot = new Bot({
                username: 'cbtest.dev',
                apiKey: 'aee21983-9bb0-4b11-9d46-2fff8518f24f',
                baseUrl: url
            });
            bot.updateBotConfiguration();
            sm = new StateMachine(bot, new RedisPersister(),
                QuestionBot.defaultState, ...QuestionBot.otherStates)

            server = http
                .createServer(bot.incoming())
                .listen(PORT);
        });
    } else {
        console.log("in production mode");
        // Configure the bot API endpoint, details for your bot
        let bot = new Bot({
            username: 'ratemyday',
            apiKey: '28468b56-d8ce-41b0-a736-115aa8f3465d',
            baseUrl: 'https://lifeguru.herokuapp.com/'
        });

        bot.updateBotConfiguration();
        sm = new StateMachine(bot, new RedisPersister(process.env.REDIS_URL),
            QuestionBot.defaultState, ...QuestionBot.otherStates)
        server = http
            .createServer(bot.incoming())
            .listen(PORT);
    }
} else {
    console.log("Not main module, not starting server.");
}

