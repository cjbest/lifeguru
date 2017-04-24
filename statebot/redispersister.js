
let StatePersister = require('./statepersister.js').StatePersister;

module.exports = class extends StatePersister {

    connect() {
        if (!this._redis) {
            this._redis = require('../redisClient.js');
        }
    }

    saveState(user, state, callback) {
        this.connect();
        var skey = "users:" + user + ":state";
        this._redis.set(skey, JSON.stringify(state), callback);
    }

    clearState(user, callback) {
        this.connect();
        var skey = "users:" + user + ":state";
        this._redis.del(skey, callback);
    }

    loadState(user, callback) {
        this.connect();
        var skey = "users:" + user + ":state";
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