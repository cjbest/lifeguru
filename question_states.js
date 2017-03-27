

var hello1 = class extends StateHandler {
    onEnter() {
        this.say("Hello there. Are you tired of being unhappy?");
        this.say("Of feeling your life is wasted, or just never being sure if you're good enough?");
        this.giveOptions("Of course");
    }

    onOption() {
        this.goTo(hello2)
    }
}

var hello2 = class extends StateHandler {
    onEnter() {
        this.say("I can help.")
        this.say("Each day I'll ask you 5 questions, and if you can answer yes to all of them, your life will finally have purpose.");
        this.giveOptions("Finally!", "Sounds awful...")
    }

    onOption() {

    }
}


var hello2 = new SimpleState()
