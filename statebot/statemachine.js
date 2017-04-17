
const InMemoryStatePersister = require('./statepersister.js').InMemoryStatePersister;
const assert = require('assert');

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
        //console.log("forcing transition to ", stateToTransitionTo.stateId);
        callback = callback || function () { };
        var stateInst = new stateToTransitionTo(null, null);
        stateInst.handleEnter();
        this._postHandlerWork(user, stateInst);
    }

    _postHandlerWork(user, stateInst, callback = () => {}) {
        const toSend = stateInst.getMessagesToSend();
        if (toSend.length) {
            this.bot.send(toSend, user);
        }
        if (stateInst.nextStateId) {
            var nextState = this._states[stateInst.nextStateId];
            this.forceTransition(user, nextState, callback);
        } else {
            const newStateData = {
                'id': stateInst.constructor.stateId,
                'previousOptions': stateInst._options
            }
            this._persister.saveState(user, newStateData, callback);
        }
        
    }
}
