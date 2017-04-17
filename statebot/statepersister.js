

exports.StatePersister = class {

    clearState(user, callback) {
        throw new TypeError('not implemented')
    }
    
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

    clearState(user, callback) {
        delete this._stateJson[user];
        callback(null);
    }

    saveState(user, stateData, callback) {
        if (!stateData || !stateData.id) {
            //console.log(stateData)
            throw new Error("Expected state");
        }
        //console.log("saving state for user ", user, ": ", stateData);
        this._stateJson[user] = JSON.stringify(stateData);
        if(callback) callback();
    }

    loadState(user, callback) {
        let stateData = JSON.parse(this._stateJson[user] || '{}');
        //console.log("loading state for user ", user, ": ", stateData);
        callback(null, stateData);
    }
}
