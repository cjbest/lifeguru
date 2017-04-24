#!/usr/bin/env node

let Bot = require('@kikinteractive/kik');
let moment = require('moment-timezone');

let UPDATE_FREQUENCY = 1000 * 60 * 60;
const usersKey = 'userdata';

function pokeProfile(username, bot, quitRedisAfter = false) {
    let redis = require('./redisClient.js');
    var key = `users:${username}:data`;
    redis.hget(usersKey, username, (err, dataJson) => {
        let now = +new Date();
        let data = null;
        if (dataJson) {
            data = JSON.parse(dataJson);
            if (data['lastFetched'] && now - data['lastFetched'] < UPDATE_FREQUENCY) {
                //we have recent data, no need to update
                if (quitRedisAfter) {
                    redis.quit();
                }
                return;
            }
        }

        console.log(`fetching user data for ${username}`)
        bot.getUserProfile(username)
            .then((user) => {
                var userData = user.toJSON();
                if (data && data.lastPoked) {
                    userData['lastPoked'] = data.lastPoked;
                }
                userData['lastFetched'] = now;
                console.log(userData);
                redis.hset(usersKey, username, JSON.stringify(userData), redis.print);
                if (quitRedisAfter) {
                    redis.quit();
                }
            }, (err) => {
                console.error(err);
                if (quitRedisAfter) {
                    redis.quit();
                }
            })
    });
}

function sendDailyAsks() {
    require('./setup.js').setupBotAndSm().then((obj) => {
        let bot = obj.bot;
        let sm = obj.sm;
        let redis = require('./redisClient.js');
        // TODO: batch with scan() if we are still using redis beyond the point this doesn't scale
        redis.hgetall(usersKey, (err, users) => {
            if (!users) {
                console.log("no users");
                redis.quit();
                return;
            }
            for (var u of Object.keys(users)) {
                console.log(u);
                console.log(users);
                let userData = JSON.parse(users[u]);
                if (isItTimeToMessageUser(userData)) {
                    userData['lastPoked'] = +new Date()
                    redis.hset(usersKey, u, JSON.stringify(userData), (err) => {
                        if (err) {
                            console.log(err);
                            return
                        }
                        sm.forceTransition(u, "question1");
                    })
                }
            }
            redis.quit();
        });
    }, (err) => console.error(err));
}

const TWELVE_HOURS = 12 * 60 * 60 * 1000;
const SEVEN_OCLOCK = 19;

function isItTimeToMessageUser(userData, now = new Date(), hour_to_send = SEVEN_OCLOCK, ms_between = TWELVE_HOURS) {
    let userRelTime = moment(now).tz(userData.timezone || 'America/Toronto');
    console.log("hour:", userRelTime.hour());
    if (userRelTime.hour() < hour_to_send) {
        console.log("too early");
        return false;
    }

    if (userData.lastPoked && now - userData.lastPoked < ms_between) {
        console.log("too soon");
        return false;
    }
    console.log("just right");
    return true;
}

exports.pokeProfile = pokeProfile;
exports.isItTimeToMessageUser = isItTimeToMessageUser;

if (require.main === module) {
    console.log("Running cron");
    sendDailyAsks();
}
