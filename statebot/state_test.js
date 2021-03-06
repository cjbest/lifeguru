let test = require('tape')
let State = require('./state.js');
Bot = require('@kikinteractive/kik');

test('Enter a state', function (t) {
    var H = class extends State {
        onEnter() {
            this.say("Hello, world");
        }
    }

    var h = new H(null, 'cb');
    h.handleEnter();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].type, "text");
    t.equal(h._messagesToSend[0].body, "Hello, world");
    t.end();
});

test('Echo a message', function (t) {
    var H = class extends State {
        onOtherMessage() {
            this.say(this.message.body);
        }
    }

    var h = new H(Bot.Message.text("foo 32"), 'cbsim');
    h.handleMessage();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].type, "text");
    t.equal(h._messagesToSend[0].body, "foo 32");
    t.end();
});

test('Give options', function (t) {
    var H = class extends State {
        onEnter() {
            this.say("What is your favorite letter?");
            this.addOption("A")
            this.addOption("B")
            this.addOption("C")
        }
    }

    var h = new H(null, user = 'cb');
    h.handleEnter();
    t.equal(h._messagesToSend.length, 1)
    t.deepEquals(h._options, {
        "A": 1,
        "B": 2,
        "C": 3
    });
    t.end();
});

test('Go to an option with a given ID', function (t) {
    var H = class extends State {
        onOptionB() {
            this.say("yay");
        }
    }
    var options = {
        "it's A": "A",
        "it's B": "B"
    }
    var h = new H(Bot.Message.text("it's B"), user = 'cb', options);
    h.handleMessage();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].body, "yay");
    t.end();
});

test('StateId Test', function (t) {
    var ImAHandler = class extends State { }
    t.equal(ImAHandler.stateId, "ImAHandler");
    t.end();
});

test('Default not understood', function (t) {
    var Blar = class extends State {}
    var h = new Blar(Bot.Message.text("jibberish"), user = 'cb');
    h.onOtherMessage();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].body, "Huh?");
    t.equal(h.nextStateId, "Blar");
    t.end();
});
