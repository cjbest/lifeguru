#!/usr/bin/env node

const readline = require('readline');
const EventEmitter = require('events');
const StateMachine = require('./statemachine.js');
const StateHandler = require('./state.js');
const Bot = require('@kikinteractive/kik');

module.exports = class ConsoleBot {

    constructor() {
        this.emitter = new EventEmitter();
    }

    send(messages, to) {
        for (var m of messages) {
            if (m.type == 'text') {
                console.log("Bot says:", m.body);
            }
            else {
                console.log("Bot sends message of type:", m.type);
            }
            if (m._state.keyboards) {
                var n = 1;
                var responses = [];
                for (var r of m._state.keyboards[0].responses) {
                    if (r.type === 'text') {
                        responses.push(`"${r.body}"`);
                    } else {
                        responses.push(r.toJSON());
                    }
                }
                if (responses) {
                    console.log('\t[', responses.join(' / '), ']');
                }
            }
        }
    }

    onStartChattingMessage(handler) {

    }

    onTextMessage(handler) {
        this.emitter.on('message', handler);
    }

    onPictureMessage(handler) {

    }

    onVideoMessage(handler) {

    }

    startConsole() {
        if (this.r1) {
            throw "Already started";
        }
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let m = Bot.Message.fromJSON({
            'type': 'start-chatting',
            'from': 'cb'
        });
        this.emitter.emit('message', m);
        this.rl.prompt()

        this.rl.on("line", (txt) => {
            let m = Bot.Message.fromJSON({
                'type': 'text',
                'from': 'cb',
                'body': txt
            });
            this.emitter.emit('message', m);
            this.rl.prompt();
        });

        this.rl.on("pause", () => {
            console.log("");
            console.log("byeee");
        });

    }
}

if (require.main === module) {

    var Ping = class extends StateHandler {
        handleEnter() {
            this.say('Ping!');
        }
        onOtherMessage() {
            this.goTo(Pong);
        }
    }

    var Pong = class extends StateHandler {
        handleEnter() {
            this.say('Pong!');
        }
        onOtherMessage() {
            this.goTo(Ping);
        }
    }

    let ConsoleBot = module.exports;
    cb = new ConsoleBot();
    sm = StateMachine.inMemory(cb, Ping, Pong);
    cb.startConsole();
}
