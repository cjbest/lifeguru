
let State = require('./statebot/state.js');

var hello1 = class extends State {
    onEnter() {
        this.say("Hello there. Are you tired of being unhappy?");
        this.say("Of feeling your life is wasted, or just never being sure if you're good enough?");
        this.addOption("Of course");
    }

    onOption() {
        console.log("what up");
        console.log(hello2);
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
        this.say("POO");
    }
}

if (require.main === module) {
    let ConsoleBot = require('./statebot/tester.js');
    let StateMachine = require('./statebot/statemachine.js');
    cb = new ConsoleBot();
    sm = StateMachine.inMemory(cb, hello1, hello2);
    cb.startConsole();
}
