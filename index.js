'use strict';

let util = require('util');
let http = require('http');
let Bot  = require('@kikinteractive/kik');
let Util = require ('./util.js')
var redis = require('redis').createClient(process.env.REDIS_URL | 'redis://localhost:6379/1');

console.log("asdf");
redis.get('hi', console.log);

let questions = [
    "Did you take 10k steps today?",
    "Did participate in at least 4 hugs today?",
    "Did you tell yourself: \"I am the architect of my life; I build its foundation and choose its contents.\" today?",
    "Did you check your privilege?",
    "Did you take at least one big, beefy poop?"
]

let noAnswers = ["No, I suck"]
let yesAnswers = [
    "Yup",
    "Of course",
    "Yes, I rock",
    "You bet",
    "Oh you best believe it"];

let yesResponse = [
    "Excellent",
    "Satisfactory.",
    "It's the least you could do",
    "Ok",
    "Good",
    "Alright"
]

let noResponse = [
    ":(",
    "That's too bad",
    "Sad.",
    "Seriously?",
    "Ugh.",
    "You do suck",
    "Why do I even bother?",
]

// Configure the bot API endpoint, details for your bot
let bot = new Bot({
    username: 'ratemyday',
    apiKey: '28468b56-d8ce-41b0-a736-115aa8f3465d',
    baseUrl: 'https://7dca070f.ngrok.io'
});

console.log("updating config")
bot.updateBotConfiguration();
console.log("updated.")

bot.onTextMessage((message) => {
    console.log(message)
    message.reply(message.body);
});

bot.send(Bot.Message.text('sup foo!'), 'cb');

// Set up your server and start listening
let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);