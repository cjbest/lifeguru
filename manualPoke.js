
let cron = require('./cron.js');
var argv = require('minimist')(process.argv.slice(2));

if (argv._.length != 1) {
    console.error("usage: node manualPoke.js <username>");
    process.exit(1);
}

require('./setup.js').setupBotAndSm().then((setup) => {
    cron.pokeProfile(argv._[0], setup.bot, true);
});
