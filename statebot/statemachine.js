
const InMemoryStatePersister = require('./statepersister.js').InMemoryStatePersister;
const assert = require('assert');
const State = require('./state.js');

module.exports = class StateMachine {
    constructor(bot, persister, defaultState, ...otherStates) {
        assert(bot);
        assert(persister);
        assert(defaultState);

        this._persister = persister;
        this._defaultState = defaultState.stateId;
        this._states = {};
        this._attachToBot(bot);
        for (var h of [defaultState, ...otherStates]) {
            this._states[h.stateId] = h;
        }
    }

    static inMemory(bot, defaultState, ...otherStates) {
        return new StateMachine(
            bot,
            new InMemoryStatePersister(),
            defaultState,
            ...otherStates);
    }

    _attachToBot(bot) {
        this.bot = bot;
        bot.onTextMessage(this.handleMessage.bind(this));
        bot.onStartChattingMessage(this.handleMessage.bind(this));
        bot.onPictureMessage(this.handleMessage.bind(this));
        bot.onVideoMessage(this.handleMessage.bind(this));
    }

    handleMessage(message, callback) {

        // hardcode in a 'Reset' here for testing.
        if (message.body === 'Reset') {
            this._persister.clearState(message.from, (err) => {
                if (err) {
                    this.bot.send('Problem.', message.from);
                } else {
                    this.bot.send('Resetting...', message.from);
                }
            });
            return;
        }

        this._persister.loadState(message.from, (err, stateData) => {
            if (err) {
                return callback(err);
            }
            if (!stateData || !stateData.id) {
                stateData = { 'id': this._defaultState };
            }
            const stateId = stateData.id;
            const previousOptions = stateData.previousOptions;
            if (!this._states[stateId]) {
                throw ("No handler for state: " + stateId);
            }
            const stateInst = new this._states[stateId](message, message.from, previousOptions);
            stateInst.handleMessage();
            this._postHandlerWork(message.from, stateInst);
        });
    }

    forceTransition(user, stateToTransitionTo, callback) {
        stateToTransitionTo = this._getState(stateToTransitionTo);
        console.log("forcing transition to ", stateToTransitionTo.stateId);
        callback = callback || function () { };
        var stateInst = new stateToTransitionTo(null, null);
        stateInst.handleEnter();
        this._postHandlerWork(user, stateInst);
    }

    _postHandlerWork(user, stateInst, callback = () => { }) {
        const toSend = stateInst.getMessagesToSend();
        if (toSend.length) {
            for (var s of toSend) {
                console.log(s.toJSON());
            }
            this.bot.send(toSend, user).catch((err) => {
                console.log("failed to send");
                console.error(err);
            });
        }
        if (stateInst.nextStateId) {
            var nextState = this._states[stateInst.nextStateId];
            if (!nextState) {
                console.log(stateInst.nextStateId);
                console.log(this._states);
                throw new Error("State not found: ", stateInst.nextStateId);
            }
            this.forceTransition(user, nextState, callback);
        } else {
            const newStateData = {
                'id': stateInst.constructor.stateId,
                'previousOptions': stateInst._options
            }
            this._persister.saveState(user, newStateData, callback);
        }

    }

    _getState(stateOrId) {
        if (typeof stateOrId === 'string' && this._states[stateOrId]) {
            return this._states[stateOrId];
        } else if (stateOrId && stateOrId.prototype instanceof State) {
            return stateOrId;
        }
        throw new Error("Expected a state or state ID, got:" + stateOrId);
    }
}
