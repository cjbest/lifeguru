
Bot = require('@kikinteractive/kik');

let questions = [
    "Did you take 10k steps today?",
    "Did participate in at least 4 hugs today?",
    "Did you tell yourself: \"I am the architect of my life; I build its foundation and choose its contents.\" today?",
    "Did you check your privilege?",
    "Did you take at least one big, meaty poop?"
]

let keyboardNo = ["No", "Nah", "No, I suck", "Nope"]
let keyboardYes = [
    "Yes",
    "Yup",
    "Uh huh",
    "Of course",
    "Yes, I rock",
    "You bet",
    "Hellz to the yeah",
    "Oh you best believe it"];

let yesResponses = [
    "Excellent",
    "Satisfactory.",
    "That's great. Really great",
    "It's the least you could do",
    "Ok",
    "Good",
    "Alright"
]

let noResponses = [
    ":(",
    "That's too bad",
    "Sad.",
    "Seriously?",
    "Ugh.",
    "Boo",
    "Why do I even bother?",
]

let confusedResponses = [
    "What?",
    "Huh?",
    "You're not making sense."
]

exports.stateHandlers = {
    'new': (message, state, replies) => {
        var reply = Bot.Message.text("Hello there. Are you tired of being unhappy, of feeling your life is wasted, or just never being sure if you're good enough?")
            .addTextResponse("Yes 😥");
        replies.push(reply);
        state['state'] = 'new2';
    },
    'new2': (message, state, replies) => {
        var reply = Bot.Message.text(`Of course you are! I can help. Ill ask you ${questions.length} questions every day, and being able to answer yes to all of them will give your life purpose.`)
            .addTextResponse("Finally")
            .addTextResponse("Sounds awful");
        replies.push(reply);
        state['state'] = 'new3';
    },
    'new3': (message, state, replies) => {
        replies.push(Bot.Message.text("Great, lets get started"));
        replies.push(Bot.Message.text(questions[0])
            .addTextResponse(keyboardYes.randomElement())
            .addTextResponse(keyboardNo.randomElement()))
        state['state'] = 'questions';
        state['answered'] = 0;
        state['yes'] = 0;
    },
    'questions': (message, state, replies) => {
        if (keyboardYes.contains(message.body)) {
            replies.push(yesResponses.randomElement())
            state['answered']++;
            state['yes']++;
        }
        else if (keyboardNo.contains(message.body)) {
            replies.push(noResponses.randomElement())
            state['answered']++
        }
        else {
            replies.push(
                Bot.Message.text(confusedResponses.randomElement())
            );
        }
        if (state.answered >= questions.length) {
            replies.push("That's it for today. Remember: you need me.");
            state['state'] = 'waiting';
        } else {
            replies.push(Bot.Message.text(questions[state['answered']])
                .addTextResponse(keyboardYes.randomElement())
                .addTextResponse(keyboardNo.randomElement()));
        }
    },
    'waiting': (message, state, replies) => {
        message.reply(
            Bot.Message.text("Always remember to do what I tell you, and you will be happy. See you later.")
                .addTextResponse('Reset')
        );
    }
}