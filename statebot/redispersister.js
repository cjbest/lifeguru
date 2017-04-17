
let StatePersister = require('./statepersister.js').StatePersister;
let redis = require('redis');

module.exports = class extends StatePersister {

    constructor(redisUrl = 'redis://localhost:6379/1') {
        super();
        this._redisUrl = redisUrl;
    }

    connect() {
        if (!this._redis) {
            this._redis = redis.createClient(this._redisUrl);
        }
    }

    saveState(user, state, callback) {
        this.connect();
        var skey = user + ":state";
        this._redis.set(skey, JSON.stringify(state), callback);
    }

    clearState(user, callback) {
        this.connect();
        var skey = user + ":state";
        this._redis.del(skey, callback);
    }

    loadState(user, callback) {
        this.connect();
        var skey = user + ":state";
        this._redis.get(skey, (err, stateJson) => {
            if (err) {
                callback(err);
            }
            else if (stateJson) {
                console.log("loaded state for user ", user, stateJson);
                callback(null, JSON.parse(stateJson));
            } else {
                callback(null, null);
            }
        });
    }

}