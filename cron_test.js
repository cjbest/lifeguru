const test = require('tape');
const moment = require('moment-timezone');
const cron = require('./cron.js');
const isItTimeToMessageUser = cron.isItTimeToMessageUser;

test("First time, based on timezone", (t) => {
    let userData = {
        timezone: 'America/Los_Angeles'
    }

    let before = moment.tz("2017-06-26 06:59:59", "America/Los_Angeles").toDate();
    let after = moment.tz("2017-06-26 07:00:01", "America/Los_Angeles").toDate();

    t.false(isItTimeToMessageUser(userData, before), "Just before");
    t.true(isItTimeToMessageUser(userData, after), "Just after");
    t.end();
});

test("Not within same period", (t) => {
    let userData = {
        timezone: 'America/Los_Angeles',
        lastPoked: moment.tz("2017-06-26 10:00", "America/Los_Angeles").toDate()
    }

    let toSoon = moment.tz("2017-06-26 11:00", "America/Los_Angeles").toDate();
    let nextDay = moment.tz("2017-06-27 11:00", "America/Los_Angeles").toDate();

    t.false(isItTimeToMessageUser(userData, toSoon));
    t.true(isItTimeToMessageUser(userData, nextDay));
    t.end();
});
