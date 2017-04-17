let test = require('tape')
let RedisPersister = require('./redispersister.js');
Bot = require('@kikinteractive/kik');

test('Simple round trip to redis', function (t) {

    state = {
        'id': 'foo',
        'optionsGiven': {
            'a': 1,
            'b': 2
        }
    }

    t.plan(3)

    var p = new RedisPersister();
    p.saveState('cb', state, (err) => {
        t.error(err, "No error on save");
        p.loadState('cb', (err, loadedState) => {
            t.error(err, "No error on load");
            t.deepEqual(loadedState, state, "Loaded state is the same");
        });
    });
});
