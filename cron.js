#!/usr/bin/env node

let Bot = require('@kikinteractive/kik');
let moment = require('moment-timezone');
    
let UPDATE_FREQUENCY = 1000 * 60 * 60;
const usersKey = 'userdata';

function pokeProfile(username, bot) {
    let redis = require('./redisClient.js');
    var key = `users:${username}:data`;
    redis.hget(usersKey, username, (err, dataJson) => {
        let now = +new Date();
        let data = null;
        if (dataJson) {
            data = JSON.parse(dataJson);
            if (data['lastFetched'] && now - data['lastFetched'] < UPDATE_FREQUENCY) {
                //we have recent data, no need to update
                return;
            }
        }

        console.log(`fetching user data for ${username}`)
        bot.getUserProfile('cb')
            .then((user) => {
                var userData = user.toJSON();
                if (data && data.lastPoked) {
                    userData['lastPoked'] = data.lastPoked;
                }
                userData['lastFetched'] = now;
                console.log(userData);
                redis.hset(usersKey, username, JSON.stringify(userData), redis.print);
            }, (err) => {
                console.error(err);
            })
    });
}

function sendDailyAsks() {
    require('./setup.js').smPromise.then((sm) => {
        let redis = require('./redisClient.js');
        // TODO: batch with scan() if we are still using redis beyond the point this doesn't scale
        redis.hgetall(usersKey, (err, users) => {
            for (var u in Object.keys(users)) {
                if (isItTimeToMessageUser(userData)) {
                    sm.forceTransition(user, "question1");
                }
            }
        });
    }, (err) => console.error(err));
}

function isItTimeToMessageUser(userData, now = new Date(), hour_to_send=7) {
    let userRelTime = moment(now).tz(userData.timezone || 'America/Toronto');
    if (userRelTime.hour() < hour_to_send) {
        return false;
    }
    let ms_between = 12 * 60 * 60 * 100;
    if (userData.lastPoked && now - userData.lastPoked < ms_between) {
        return false;
    }
    return true;
}

exports.pokeProfile = pokeProfile;
exports.isItTimeToMessageUser = isItTimeToMessageUser;

if (require.main === module) {

}
