let test = require('tape')
let InMemoryStatePersister = require('./statepersister.js').InMemoryStatePersister;
Bot = require('@kikinteractive/kik');

test('Simple round trip in memory', function(t) {
    
    state = {
        'id': 'foo',
        'optionsGiven': {
            'a': 1,
            'b': 2
        }
    }

    t.plan(3)

    var p = new InMemoryStatePersister();
    p.saveState('cb', state, (err) => {
        t.error(err);
    });

    p.loadState('cb', (err, loadedState) => {
        t.error(err);
        t.deepEqual(loadedState, state);
    });
});
