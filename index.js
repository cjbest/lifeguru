'use strict';

let http = require('http');
let setup = require('./setup.js');

if (require.main === module) {
    setup.botPromise.then((bot) => {
        http.createServer(bot.incoming())
            .listen(setup.PORT);
    }, (err) => {
        console.error("Failed to set up bot");
        console.rror(err);
    });
} else {
    console.log("Not main module, not starting server.");
}

