
const assert = require('assert');
const Bot = require('@kikinteractive/kik');

exports.StateHandler = class StateHandler {

    constructor(user, message, previousOptions) {
        if (new.target === StateHandler) {
            throw new TypeError("StateHandler is abstract")
        }
        this.user = user;
        this.message = message;
        this._previousOptions = previousOptions || {};
        this._messagesToSend = [];
        this._nextState = null;
        this._options = {};
        this._serialOptionId = 1;
    }

    onEnter() {}

    onOption() {}

    onOtherMessage() {
        // by default if we get a message we don't understand, sound confused and start over
        this.say("Huh?");
        this.goTo(this.getType());
    }

    say(msg) {
        if (typeof msg === 'string') {
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
        if (state && state.prototype instanceof StateHandler) {
            this._nextState = state.getType();
        } else {
            throw new TypeError("Expecting a class that inherits from StateHandler");
        }
    }

    handleEnter() {
        this.onEnter();
    }

    handleMessage() {
        console.log(this.message);
        if (this.message.type != "text") {
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
}
