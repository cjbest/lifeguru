
const readline = require('readline');
const EventEmitter = require('events');
const StateMachine = require('./statemachine.js');
const StateHandler = require('./statehandler.js');
const Bot = require('@kikinteractive/kik');

class ConsoleBot {

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
        this.emitter.emit('start', m);
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

    cb = new ConsoleBot();
    sm = StateMachine.inMemory(cb, Ping, Pong);
    cb.startConsole();
}
