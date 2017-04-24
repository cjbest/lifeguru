let test = require('tape')
let StateMachine = require('./statemachine.js');
let State = require('./state.js')
Bot = require('@kikinteractive/kik');

class DummyBot {
    constructor(sendFunc = () => { }) {
        this.send = sendFunc;
    }
    onTextMessage() { }
    onStartChattingMessage() { }
    onPictureMessage() { }
    onVideoMessage() { }
}

test('Forced entry', (t) => {
    var HelloWorld = class extends State {
        onEnter() {
            this.say("Hello, world");
        }
    }

    var bot = new DummyBot((messages, user) => {
        t.equals(user, 'cb');
        t.equals(messages.length, 1);
        t.equals(messages[0].body, "Hello, world");
        t.end();
        return Promise.resolve();
    });

    sm = StateMachine.inMemory(bot, HelloWorld);
    sm.forceTransition('cb', HelloWorld);
});

test('Echo', (t) => {
    var Echo = class extends State {
        onEnter() {
            //do nothing
        }
        onOtherMessage() {
            this.say(this.message.body);
        }
    }

    var bot = new DummyBot((messages, user) => {
        t.equals(user, 'cb');
        t.equals(messages.length, 1);
        t.equals(messages[0].body, "suup");
        t.end();
        return Promise.resolve();
    })

    sm = StateMachine.inMemory(bot, Echo);
    sm.forceTransition('cb', Echo);
    let m = Bot.Message.fromJSON({
        'type': 'text',
        'from': 'cb',
        'body': 'suup'
    });
    sm.handleMessage(m);
});

test('Transition on message', (t) => {
    var state1 = class extends State {
        onOtherMessage() {
            console.log("I'm goin");
            this.goTo(state2);
        }
    }

    var state2 = class extends State {}

    sm = StateMachine.inMemory(new DummyBot(), state1, state2);
    sm.handleMessage(Bot.Message.fromJSON({
        'type': 'text',
        'from': 'cb',
        'body': 'suup'
    }));


    sm._persister.loadState('cb', (error, state) => {
        t.notOk(error);
        t.equal(state.id, 'state2');
        t.end();
    });
});

test('Transition immediately on enter', (t) => {
     var state1 = class extends State {
        onEnter() {
            console.log("I'm goin");
            this.goTo(state2);
        }
    }

    var state2 = class extends State {}

    sm = StateMachine.inMemory(new DummyBot(), state1, state2);
    sm.handleMessage(Bot.Message.fromJSON({
        'type': 'start-chatting',
        'from': 'cb',
    }));


    sm._persister.loadState('cb', (error, state) => {
        t.notOk(error);
        t.equal(state.id, 'state2');
        t.end();
    });
});
