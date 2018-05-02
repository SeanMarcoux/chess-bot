const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');


var board;
var whiteKing = "\uD83D\uDC51"//"\u2654";
var blackKing = "\uD83D\uDC51"//"\u265A";
var whiteQueen = "\uD83C\uDDF6"//"\u2655";
var blackQueen = "\uD83C\uDDF6"//"\u265B";
var whiteRook = "\uD83C\uDDF7"//"\u2656";
var blackRook = "\uD83C\uDDF7"//"\u265C";
var whiteBishop = "\uD83C\uDDE7"//"\u2657";
var blackBishop = "\uD83C\uDDE7"//"\u265D";
var whiteKnight = "\uD83C\uDDF0"//"\u2658";
var blackKnight = "\uD83C\uDDF0"//"\u265E";
var whitePawn = "\uD83C\uDDF5"//"\u2659";
var blackPawn = "\uD83C\uDDF5"//"\u265F";
var blackSpace = "\u2B1B";
var whiteSpace = "\u2B1C";

var player1;

var useDMs = false;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("Chess");
    var channels = client.channels.array();
    
    resetBoard();
});

client.on('message', msg => {
    if(msg.channel.name && !(msg.channel.name.toLowerCase().includes("bot")))
        return;
    if(msg.author.username == "chess-bot")
        return;
    if(!msg.channel.name)
        console.log("Message received from " + msg.author.username + ": " + msg.content);
    
    var message = msg.content.toLowerCase();
    
    if(message === "chess-bot, die")
    {
        setTimeout(function () {
            msg.reply("D:");
            setTimeout(function () {
                throw 'Goodbye cruel world';
            }, 1000);
        }, 1000);
    }
    
    reactToCommands(msg, message);
});

function reactToCommands(msg, message)
{
    if(!message.startsWith("&")) {
        return;
    }
    else if(message.startsWith("&help")) {
        help(msg);
    }
    else if(message.startsWith("&newgame")) {
        player1 = msg.author.id;
        newGame(msg, msg.author.username);
    }
    else {
        msg.reply("I didn't understand that command. If it was meant for another bot, my bad!");
    }
}

function help(msg) {
    msg.reply("The following commands are available:\n"
        + "*&help*: Displays this message\n"
        + "*&newgame*: I'll start a game of connect 4 with you!");
}

function newGame(msg, p1) {
    msg.channel.send("New game started by + " + p1 + "!");
    resetBoard();
    displayBoard(msg);
}

function resetBoard() {
    var row1 = [blackRook, blackKnight, blackBishop, blackQueen, blackKing, blackBishop, blackKnight, blackRook];
    var row2 = [blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn];
    var row3 = [whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace];
    var row4 = [blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace];
    var row5 = [whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace];
    var row6 = [blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace, blackSpace, whiteSpace];
    var row7 = [whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn];
    var row8 = [whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing, whiteBishop, whiteKnight, whiteRook];
    board = [row1, row2, row3, row4, row5, row6, row7, row8]
}

function displayBoard(msg) {
    var boardMessage = "";
    for(var i = 0; i < board.length; i++) {
        for(var j = 0; j < board[i].length; j++) {
            boardMessage += board[i][j] + " ";
        }
        boardMessage += "\n";
    }
    if(useDMs)
    {
        dmUser(nextPlayer, boardMessage);
        dmUser(getNextPlayer(), boardMessage);
    }
    else
        msg.channel.send(boardMessage);
}

var key = fs.readFileSync("key.txt");
client.login(key.toString());