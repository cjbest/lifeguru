
const assert = require('assert');
const Bot = require('@kikinteractive/kik');

module.exports = class State {

    constructor(message, user = message.from, previousOptions = {}) {
        if (new.target === State) {
            throw new TypeError("StateHandler is abstract")
        }
        if (message && !(message instanceof Bot.Message)) {
            throw new TypeError("Expecting a Bot.Message");
        }
        this.message = message;
        this._user = user;
        this._previousOptions = previousOptions;
        this._messagesToSend = [];
        this._nextState = null;
        this._options = {};
        this._serialOptionId = 1;
    }

    onEnter() {

    }

    onOption() {

    }

    onOtherMessage() {
        // by default if we get a message we don't understand, sound confused and start over
        this.say("Huh?");
        this.goTo(this.stateId);
    }

    say(msg) {
        if (!msg) {
            throw new TypeError("Must specify message");
        } else if (typeof msg === 'string') {
            this._messagesToSend.push(Bot.Message.text(msg))
        } else if (msg instanceof Bot.Message) {
            this._messagesToSend.push(msg)
        } else {
            throw new TypeError("Unexpected message type");
        }
    }

    addOption(text, id) {
        assert(typeof text === 'string');
        assert(!(text in this._options), "Duplicate option: " + text);
        if (!id) {
            id = this._serialOptionId;
            this._serialOptionId++;
        }
        this._options[text] = id;
    }

    goTo(state) {
        if (state && state.prototype instanceof State) {
            this._nextState = state.stateId;
        } else {
            throw new TypeError("Expecting a class that inherits from StateHandler");
        }
    }

    handleEnter() {
        this.onEnter();
    }

    handleMessage() {
        if (this.message.isStartChattingMessage()) {
            this.handleEnter();
        }
        else if (this.message.type != "text") {
            this.onOtherMessage();
        } else if (this.message.body in this._previousOptions) {
            let optionId = this._previousOptions[this.message.body];
            let optionMethod = ['onOption' + optionId.toString()]
            if (this[optionMethod]) {
                this[optionMethod]();
            } else {
                this.onOption();
            }
        } else {
            this.onOtherMessage();
        }
    }

    get nextStateId() {
        return this._nextState;
    }

    getMessagesToSend() {
        let options = Object.keys(this._options);
        var ret = this._messagesToSend;
        this._messagesToSend = [];
        if (ret.length > 0) {
            ret[ret.length - 1].addTextResponse(...options);
        }
        return ret;
    }

    static get stateId() {
        return this.name;
    }
}
