
const Bot = require('@kikinteractive/kik');
const StateMachine = require('./statebot/statemachine.js');
const RedisPersister = require('./statebot/redispersister.js');
const QuestionBot = require('./questionbot.js');
let cron = require('./cron.js');

const DEBUG = !process.env.REDIS_URL; // hack hack hack
const PORT = process.env.PORT || 8080;

function makeSm(bot) {
    return new StateMachine(bot, new RedisPersister(),
        QuestionBot.defaultState, ...QuestionBot.otherStates);
}

function addPreHandler(bot) {
    bot.onTextMessage((message, next) => {
        cron.pokeProfile(message.from, bot);
        next();
    });
};

let setupPromise = new Promise((resolve, reject) => {
    // in debug mode, set up NGROK so we can tunnel to our local machine
    if (DEBUG) {
        console.log("in debug mode");
        require('ngrok').connect(PORT, (err, url) => {
            if (err) {
                console.log("NGROK ERROR")
                reject(err);
            }
            console.log('ngrok url: ' + url);
            let bot = new Bot({
                username: 'cbtest.dev',
                apiKey: 'aee21983-9bb0-4b11-9d46-2fff8518f24f',
                baseUrl: url
            });
            bot.updateBotConfiguration().then((foo) => {
                console.log("Bot config update successful");
            }, (err) => {
                console.log("Bot config update FAILED");
                console.log(err);
            });
            addPreHandler(bot);
            let sm = makeSm(bot);
            resolve({
                bot: bot,
                sm: sm
            });
        });
    } else {
        console.log("in production mode");
        // Configure the bot API endpoint, details for your bot
        bot = new Bot({
            username: 'ratemyday',
            apiKey: '28468b56-d8ce-41b0-a736-115aa8f3465d',
            baseUrl: 'https://lifeguru.herokuapp.com/'
        });

        bot.updateBotConfiguration().then((foo) => {
            console.log("Bot config update successful");
        }, (err) => {
            console.log("Bot config update FAILED");
            console.log(err);
        });
        addPreHandler(bot);
        sm = makeSm(bot);
        resolve({
            bot: bot,
            sm: sm
        });
    }
});

exports.PORT = PORT;
exports.botPromise = setupPromise.then((val) => Promise.resolve(val.bot));
exports.smPromise = setupPromise.then((val) => Promise.resolve(val.sm));

