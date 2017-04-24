
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

function getBotConfig(debug = DEBUG, realUrl = true) {
    if (!debug) {
        console.log("Production mode");
        return Promise.resolve({
            username: 'ratemyday',
            apiKey: '28468b56-d8ce-41b0-a736-115aa8f3465d',
            baseUrl: 'https://lifeguru.herokuapp.com/'
        });
    } else if (!realUrl) {
        console.log("Debug mode, fake URL");
        return Promise.resolve({
            username: 'cbtest.dev',
            apiKey: 'aee21983-9bb0-4b11-9d46-2fff8518f24f',
        });
    } else {
        return new Promise((resolve, reject) => {
            console.log("Setting up ngrok for local run");
            require('ngrok').connect(PORT, (err, url) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        username: 'cbtest.dev',
                        apiKey: 'aee21983-9bb0-4b11-9d46-2fff8518f24f',
                        baseUrl: url
                    });
                }
            });
        });
    }
}

function setupBotAndSm(setupAsReceiver = false, debug = DEBUG) {
    return getBotConfig(debug, setupAsReceiver).then((botConfig) => {
        let bot = new Bot(botConfig);
        if (setupAsReceiver) {
            return bot.updateBotConfiguration().then(() => Promise.resolve(bot));
        }
        return Promise.resolve(bot);
    }).then((bot) => {
        addPreHandler(bot);
        let sm = makeSm(bot);
        return Promise.resolve({
            'bot': bot,
            'sm': sm
        });
    });
}

exports.PORT = PORT;
exports.setupBotAndSm = setupBotAndSm;
