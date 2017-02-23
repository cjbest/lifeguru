let test = require('tape')
let stateHandlers = require('./../logic.js').stateHandlers

test('Hello world', function (t) {
    t.plan(1);
    t.equal('foo', 'foo', 'foo is foo, foo');
});

test('State: new', (t) => {
    let state = {},
        replies = [];
    
    stateHandlers['new']({}, state, replies);

    t.equal(state['state'], 'new2');
    t.equal(replies.length, 1, 'has a reply');
    t.end();
});