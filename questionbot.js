
let State = require('./statebot/state.js');

var hello1 = class extends State {
    onEnter() {
        this.say("Hello there. Are you tired of being unhappy?");
        this.say("Of feeling your life is wasted, or just never being sure if you're good enough?");
        this.addOption("Of course");
    }

    onOption() {
        this.goTo(hello2)
    }
}

var hello2 = class extends State {
    onEnter() {
        this.say("I can help.")
        this.say("Each day I'll ask you 5 questions, and if you can answer yes to all of them, your life will finally have purpose.");
        this.addOption("Finally!", "Sounds awful...")
    }

    onOption() {
        this.say("Great! Let's get started.");
        this.goTo(question1);
    }
}

var question1 = class extends State {
    onEnter() {
        this.say("Did you walk 10k steps today?")
        this.addOption("Yes, my feet hurt", "No");
    }

    onOption1() {
        this.say("Looking fit!");
        this.goTo(question2);
    }

    onOption2() {
        this.say("Hmmm.");
        this.goTo(question2);
    }
}

var question2 = class extends State {
    onEnter() {
        this.say("Did you eat a homecooked meal?")
        this.addOption("Yes", "No I only ate GARBAGE");
    }

    onOption1() {
        this.say("Yum!");
        this.goTo(question3);
    }

    onOption2() {
        this.say("Gross");
        this.goTo(question3);
    }
}

var question3 = class extends State {
    onEnter() {
        this.say("Did you read something new?")
        this.addOption("Yes", "No");
    }

    onOption1() {
        this.say("Hot damn!");
        this.goTo(question4);
    }

    onOption2() {
        this.say("What are you, illiterate?");
        this.goTo(question4);
    }
}

var question4 = class extends State {
    onEnter() {
        this.say("Did you acheive something at work?")
        this.addOption("Yup", "Not today");
    }

    onOption1() {
        this.say("Nailed it.");
        this.goTo(question5);
    }

    onOption2() {
        this.say("Ugh");
        this.goTo(question5);
    }
}

var question5 = class extends State {
    onEnter() {
        this.say("Did you meditate?")
        this.addOption("<zenlike nod>", "😒");
    }

    onOption1() {
        this.say("🙏💪");
        this.goTo(done);
    }

    onOption2() {
        this.say("Do you even inner peace, bruh?");
        this.goTo(done);
    }
}

var done = class extends State {
    onEnter() {
        this.say("Well, you're done for today!");
    }

    onOtherMessage() {
        this.say("I'll ask you stuff again tomorrow");
    }
}

exports.defaultState = hello1;
exports.otherStates = [
    hello2, question1, question2, question3, question4,
    question5, done
]

if (require.main === module) {
    let ConsoleBot = require('./statebot/tester.js');
    let StateMachine = require('./statebot/statemachine.js');
    cb = new ConsoleBot();
    sm = StateMachine.inMemory(cb, exports.defaultState, exports.otherStates);
    cb.startConsole();
}
