
let cron = require('./cron.js');
var argv = require('minimist')(process.argv.slice(2));

if (argv._.length != 1) {
    console.error("usage: node manualClear.js <username>");
    process.exit(1);
}

let username = argv._[0];

let redis = require('./redisClient.js');
redis.hdel("userdata", username);
redis.del(`users:${username}:state`);
redis.quit();
