const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');


var board;
var whiteKing = "\uD83D\uDC51"//"\u2654";
var blackKing = "\uD83D\uDD1D"//"\u265A";
var whiteQueen = "\uD83C\uDDF6"//"\u2655";
var blackQueen = "\u21A9"//"\u265B";
var whiteRook = "\uD83C\uDDF7"//"\u2656";
var blackRook = "\u2194"//"\u265C";
var whiteBishop = "\uD83C\uDDE7"//"\u2657";
var blackBishop = "\u2198"//"\u265D";
var whiteKnight = "\uD83C\uDDF0"//"\u2658";
var blackKnight = "\u2935"//"\u265E";
var whitePawn = "\uD83C\uDDF5"//"\u2659";
var blackPawn = "\u2B07"//"\u265F";
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
    else if(message.startsWith("&move ")) {
        move(msg, message);
    }
    else {
        msg.reply("I didn't understand that command. If it was meant for another bot, my bad!");
    }
}

function help(msg) {
    msg.reply("The following commands are available:\n"
        + "*&help*: Displays this message\n"
        + "*&newgame*: I'll start a game of connect 4 with you!\n"
        + "*&move (current space) (target space)*: Move a piece from the current space to the target space (ex: &move A1 B2)");
}

function newGame(msg, p1) {
    msg.channel.send("New game started by + " + p1 + "!");
    resetBoard();
    displayBoard(msg);
}

function resetBoard() {
    var row1 = [blackRook, blackKnight, blackBishop, blackQueen, blackKing, blackBishop, blackKnight, blackRook];
    var row2 = [blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn, blackPawn];
    var row3 = [" ", " ", " ", " ", " ", " ", " ", " "];
    var row4 = [" ", " ", " ", " ", " ", " ", " ", " "];
    var row5 = [" ", " ", " ", " ", " ", " ", " ", " "];
    var row6 = [" ", " ", " ", " ", " ", " ", " ", " "];
    var row7 = [whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn, whitePawn];
    var row8 = [whiteRook, whiteKnight, whiteBishop, whiteQueen, whiteKing, whiteBishop, whiteKnight, whiteRook];
    board = [row1, row2, row3, row4, row5, row6, row7, row8]
}

function displayBoard(msg) {
    var boardMessage = "";
    for(var i = 0; i < board.length; i++) {
        boardMessage += 8-i;
        for(var j = 0; j < board[i].length; j++) {
            //Indices that add up to an even number are white spaces
            if(board[i][j] == " " && (i+j)%2==0)
            {
                boardMessage += whiteSpace + " ";
            }
            else if(board[i][j] == " ")
            {
                boardMessage += blackSpace + " ";
            }
            else
            {
                boardMessage += board[i][j] + " ";
            }
        }
        boardMessage += "\n";
    }
    boardMessage += "\n  \uD83C\uDDE6 \uD83C\uDDE7 \uD83C\uDDE8 \uD83C\uDDE9 \uD83C\uDDEA \uD83C\uDDEB \uD83C\uDDEC \uD83C\uDDED"
    msg.channel.send(boardMessage);
}

function move(msg, message) {
    var move = getStringAfterSpace(message);
    var startSpace = move.split(" ")[0];
    var endSpace = move.split(" ")[1];
    var startCol = getColumnNum(startSpace.charAt(0));
    var startRow = 8-parseInt(startSpace.charAt(1));
    var endCol = getColumnNum(endSpace.charAt(0));
    var endRow = 8-parseInt(endSpace.charAt(1));
    
    if(startCol < 0 || startCol > 7 || startRow < 0 || startRow > 7)
    {
        msg.reply("Start space is off of the board!");
        return;
    }
    if(endCol < 0 || endCol > 7 || endRow < 0 || endRow > 7)
    {
        msg.reply("End space is off of the board!");
        return;
    }
    
    switch(board[startRow][startCol]) {
        case ' ':
            msg.reply("There is no piece at that space!");
            return;
        case whitePawn:
        case blackPawn:
            movePawn(msg, startCol, startRow, endCol, endRow);
            break;
        case whiteRook:
        case blackRook:
            moveRook(msg, startCol, startRow, endCol, endRow);
            break;
        case whiteKnight:
        case blackKnight:
            moveKnight(msg, startCol, startRow, endCol, endRow);
            break;
        case whiteBishop:
        case blackBishop:
            moveBishop(msg, startCol, startRow, endCol, endRow);
            break;
        case whiteQueen:
        case blackQueen:
            moveQueen(msg, startCol, startRow, endCol, endRow);
            break;
        case whiteKing:
        case blackKing:
            moveKing(msg, startCol, startRow, endCol, endRow);
    }
}

function movePawn(msg, startCol, startRow, endCol, endRow) {
    //Normal straight movement
    if(startCol == endCol && endRow == startRow-1 && isBlank(board[endRow][endCol])) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    //Starting straight movement
    else if(startRow == 6 && startCol == endCol && endRow == 4 && isBlank(board[endRow][endCol]))
    {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    //Diagonal right capture
    else if(endRow == startRow-1 && endCol == startCol+1 && isBlackCapturablePiece(board[endRow][endCol])) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    //Diagonal left capture
    else if(endRow == startRow-1 && endCol == startCol-1 && isBlackCapturablePiece(board[endRow][endCol])) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    //TODO: Add en passant capability
    else {
        msg.reply("Invalid pawn move!");
    }
}

function movePiece(msg, startCol, startRow, endCol, endRow) {
    board[endRow][endCol] = board[startRow][startCol];
    board[startRow][startCol] = " ";
    displayBoard(msg);
}

function moveRook(msg, startCol, startRow, endCol, endRow) {
    console.log("Rook");
}

function moveKnight(msg, startCol, startRow, endCol, endRow) {
    console.log("Knight");
}

function moveBishop(msg, startCol, startRow, endCol, endRow) {
    console.log("Bishop");
}

function moveQueen(msg, startCol, startRow, endCol, endRow) {
    console.log("Queen");
}

function moveKing(msg, startCol, startRow, endCol, endRow) {
    console.log("King");
}

function isBlank(space) {
    return space == " ";
}

function isBlackCapturablePiece(space) {
    return (space == blackPawn || space == blackRook || space == blackKnight || space == blackBishop || space == blackQueen);
}

function getColumnNum(colChar) {
    switch(colChar) {
        case 'a':
            return 0;
        case 'b':
            return 1;
        case 'c':
            return 2;
        case 'd':
            return 3;
        case 'e':
            return 4;
        case 'f':
            return 5;
        case 'g':
            return 6;
        case 'h':
            return 7;
    }
}

function getStringAfterSpace(string) {
    if(string.indexOf(" ") > 0)
        return string.slice(string.indexOf(" ")+1, string.length);
    return null;
}

var key = fs.readFileSync("key.txt");
client.login(key.toString());