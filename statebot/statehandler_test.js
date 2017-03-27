let test = require('tape')
let StateHandler = require('./statehandler.js').StateHandler;
Bot = require('@kikinteractive/kik');

test('Enter a state', function (t) {
    var H = class extends StateHandler {
        onEnter() {
            this.say("Hello, world");
        }
    }

    var h = new H('cb');
    h.handleEnter();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].type, "text");
    t.equal(h._messagesToSend[0].body, "Hello, world");
    t.end();
});

test('Echo a message', function (t) {
    var H = class extends StateHandler {
        onOtherMessage() {
            this.say(this.message.body);
        }
    }

    var h = new H('cb', Bot.Message.text("foo 32"));
    h.handleMessage();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].type, "text");
    t.equal(h._messagesToSend[0].body, "foo 32");
    t.end();
});

test('Give options', function (t) {
    var H = class extends StateHandler {
        onEnter() {
            this.say("What is your favorite letter?");
            this.addOption("A", "a")
            this.addOption("B", "b")
            this.addOption("C", "c")
        }
    }

    var h = new H('cb');
    h.handleEnter();
    t.equal(h._messagesToSend.length, 1)
    t.deepEquals(h._options, {
        "A": "a",
        "B": "b",
        "C": "c"
    });
    t.end();
});

test('Go to an option with a given ID', function (t) {
    var H = class extends StateHandler {
        onOptionB() {
            this.say("yay");
        }
    }
    var options = {
        "it's A": "A",
        "it's B": "B"
    }
    var h = new H('cb', Bot.Message.text("it's B"), options);
    h.handleMessage();
    t.equal(h._messagesToSend.length, 1)
    t.equal(h._messagesToSend[0].body, "yay");
    t.end();
});

