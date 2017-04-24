'use strict';

let http = require('http');
let setup = require('./setup.js');

if (require.main === module) {
    setup.setupBotAndSm(true).then((obj) => {
        let bot = obj.bot;
        http.createServer(bot.incoming())
            .listen(setup.PORT);
    }, (err) => {
        console.error("Failed to set up bot");
        console.error(err);
    });
} else {
    console.log("Not main module, not starting server.");
}

