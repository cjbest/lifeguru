

exports.StatePersister = class {

    saveState(user, state, callback) {
        throw new TypeError('not implemented')
    }

    loadState(user, callback) {
        throw new TypeError('not implemented')
    }
}

exports.InMemoryStatePersister = class extends exports.StatePersister {

    constructor() {
        super();
        this._stateJson = {};
    }

    saveState(user, stateData, callback) {
        if (!stateData || !stateData.id) {
            console.log(stateData)
            throw new Error("Expected state");
        }
        console.log("saving state for user ", user, ": ", stateData);
        this._stateJson[user] = JSON.stringify(stateData);
        if(callback) callback();
    }

    loadState(user, callback) {
        callback(null, JSON.parse(this._stateJson[user] || '{}'));
    }
}
