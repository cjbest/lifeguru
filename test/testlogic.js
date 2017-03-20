let test = require('tape')
let logic = require('../logic.js');
let stateHandlers = logic.stateHandlers;

test('Hello world', function (t) {
    t.plan(1);
    t.equal('foo', 'foo', 'foo is foo, foo');
});

test('New state', (t) => {
    let state = {state:'new'},
        replies = [];
    
    stateHandlers[state['state']]({}, state, replies);

    t.equal(state['state'], 'new2');
    t.equal(replies.length, 1, 'has a reply');
    t.end();
});

test('Starting question state', (t) => {
    let state = {
        state: 'questions',
    }
    let replies = [];

    stateHandlers[state['state']]({}, state, replies);

    
});