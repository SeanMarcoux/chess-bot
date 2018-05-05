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
var player2;
var nextPlayer;

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
    else if(message.startsWith("&newgame ")) {
        player1 = msg.author.id;
        player2 = null;
        newGame(msg, message, msg.author.username);
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
        + "*&newgame (username)*: I'll start a game of chess between you and the chosen player!\n"
        + "*&move (current space) (target space)*: Move a piece from the current space to the target space (ex: &move A1 B2)");
}

function newGame(msg, message, p1) {
    var p2 = getStringAfterSpace(message);
    var users = client.users.array();
    for(var i = 0; i < users.length; i++)
    {
        if(users[i].username.toLowerCase() === p2)
        {
            player2 = users[i].id;
            p2 = users[i].username;
            break;
        }
    }
    if(!player2) {
        msg.reply(p2 + " is not a user in this channel! Double check your spelling");
        return;
    }
    
    nextPlayer = player1;
    msg.channel.send("New game started between " + p1 + "and " + p2 + "!");
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
    if(msg.author.id !== player1 && msg.author.id !== player2) {
        msg.reply("You are not one of the active players!");
        return;
    }
    if(msg.author.id !== nextPlayer) {
        msg.reply("It is not your turn!");
        return;
    }
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
    
    if(nextPlayer == player1) {
        moveWhite(msg, startCol, startRow, endCol, endRow);
    }
    else {
        moveBlack(msg, startCol, startRow, endCol, endRow);
    }
}

function changePlayer() {
    if(nextPlayer == player1) {
        nextPlayer = player2;
    }
    else {
        nextPlayer = player1;
    }
}

function moveWhite(msg, startCol, startRow, endCol, endRow) {
    switch(board[startRow][startCol]) {
        case ' ':
            msg.reply("There is no piece at that space!");
            break;
        case blackQueen:
        case blackRook:
        case blackKnight:
        case blackBishop:
        case blackKing:
        case blackPawn:
            msg.reply("You can't move a black piece!");
            break;
        case whitePawn:
            movePawn(msg, startCol, startRow, endCol, endRow, true);
            changePlayer();
            break;
        case whiteRook:
            moveRook(msg, startCol, startRow, endCol, endRow, true);
            changePlayer();
            break;
        case whiteKnight:
            moveKnight(msg, startCol, startRow, endCol, endRow, true);
            changePlayer();
            break;
        case whiteBishop:
            moveBishop(msg, startCol, startRow, endCol, endRow, true);
            changePlayer();
            break;
        case whiteQueen:
            moveQueen(msg, startCol, startRow, endCol, endRow, true);
            changePlayer();
            break;
        case whiteKing:
            moveKing(msg, startCol, startRow, endCol, endRow, true);
            changePlayer();
            break;
    }
}

function moveBlack(msg, startCol, startRow, endCol, endRow) {
    switch(board[startRow][startCol]) {
        case ' ':
            msg.reply("There is no piece at that space!");
            break;
        case whiteRook:
        case whiteKnight:
        case whiteBishop:
        case whiteQueen:
        case whiteKing:
        case whitePawn:
            msg.reply("You can't move a white piece!");
            break;
        case blackPawn:
            movePawn(msg, startCol, startRow, endCol, endRow, false);
            changePlayer();
            break;
        case blackRook:
            moveRook(msg, startCol, startRow, endCol, endRow, false);
            changePlayer();
            break;
        case blackKnight:
            moveKnight(msg, startCol, startRow, endCol, endRow, false);
            changePlayer();
            break;
        case blackBishop:
            moveBishop(msg, startCol, startRow, endCol, endRow, false);
            changePlayer();
            break;
        case blackQueen:
            moveQueen(msg, startCol, startRow, endCol, endRow, false);
            changePlayer();
            break;
        case blackKing:
            moveKing(msg, startCol, startRow, endCol, endRow, false);
            changePlayer();
    }
}

function movePiece(msg, startCol, startRow, endCol, endRow) {
    board[endRow][endCol] = board[startRow][startCol];
    board[startRow][startCol] = " ";
    displayBoard(msg);
}

function movePawn(msg, startCol, startRow, endCol, endRow, isWhite) {
    if(isValidPawnMove(startCol, startRow, endCol, endRow, isWhite)) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    else {
        msg.reply("Invalid pawn move!");
    }
}

function isValidPawnMove(startCol, startRow, endCol, endRow, isWhite) {
    //Capture
    if(isValidPawnCaptureMove(startCol, startRow, endCol, endRow, isWhite)) {
        return true;
    }
    else if(isWhite) {
        //Normal straight movement
        if(startCol == endCol && endRow == startRow-1 && isBlank(board[endRow][endCol])) {
            return true;
        }
        //Starting straight movement
        else if(startRow == 6 && startCol == endCol && endRow == 4 && isBlank(board[endRow][endCol]))
        {
            return true;
        }
    }
    else {
        //Normal straight movement
        if(startCol == endCol && endRow == startRow+1 && isBlank(board[endRow][endCol])) {
            return true;
        }
        //Starting straight movement
        else if(startRow == 1 && startCol == endCol && endRow == 3 && isBlank(board[endRow][endCol]))
        {
            return true;
        }
    }
    return false;
}

//TODO: Add en passant capability
function isValidPawnCaptureMove(startCol, startRow, endCol, endRow, isWhite) {
    if(isWhite) {
        //Diagonal right capture
        if(endRow == startRow-1 && endCol == startCol+1 && isCapturablePiece(board[endRow][endCol], isWhite)) {
            return true;
        }
        //Diagonal left capture
        else if(endRow == startRow-1 && endCol == startCol-1 && isCapturablePiece(board[endRow][endCol], isWhite)) {
            return true;
        }
    }
    else {
        //Diagonal right capture
        if(endRow == startRow+1 && endCol == startCol+1 && isCapturablePiece(board[endRow][endCol], isWhite)) {
            return true;
        }
        //Diagonal left capture
        else if(endRow == startRow+1 && endCol == startCol-1 && isCapturablePiece(board[endRow][endCol], isWhite)) {
            return true;
        }
    }
}

function moveRook(msg, startCol, startRow, endCol, endRow, isWhite) {
    if(isValidRookMove(startCol, startRow, endCol, endRow, isWhite)) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    else {
        msg.reply("Invalid rook move!");
    }
}

function isValidRookMove(startCol, startRow, endCol, endRow, isWhite) {
    if(!isBlank(board[endRow][endCol]) && !isCapturablePiece(board[endRow][endCol], isWhite)) {
        return false;
    }
    //Moving up or down
    else if(startCol == endCol && startRow != endRow) {
        return isRowFree(startCol, startRow, endRow);
    }
    //Left or right
    else if(startCol != endCol && startRow == endRow) {
        return isColumnFree(startRow, startCol, endCol);
    }
    else {
        return false;
    }
}

function isRowFree(col, startRow, endRow) {
    if(startRow > endRow)
    {
        var temp = startRow;
        startRow = endRow;
        endRow = temp;
    }
    for(var i = startRow+1; i < endRow; i++) {
        if(board[i][col] != " ") {
            return false;
        }
    }
    return true;
}

function isColumnFree(row, startCol, endCol) {
    if(startCol > endCol)
    {
        var temp = startCol;
        startCol = endCol;
        endCol = temp;
    }
    for(var i = startCol+1; i < endCol; i++) {
        if(board[row][i] != " ") {
            return false;
        }
    }
    return true;
}

function moveKnight(msg, startCol, startRow, endCol, endRow, isWhite) {
    if(isValidKnightMove(startCol, startRow, endCol, endRow, isWhite)) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    else {
        msg.reply("Invalid knight move!");
    }
}

function isValidKnightMove(startCol, startRow, endCol, endRow, isWhite) {
    if(!isBlank(board[endRow][endCol]) && !isCapturablePiece(board[endRow][endCol], isWhite)) {
        return false;
    }
    //Up 1 and right 2
    else if(endRow == startRow-1 && endCol == startCol+2) {
        return true;
    }
    //Up 1 and left 2
    else if(endRow == startRow-1 && endCol == startCol-2) {
        return true;
    }
    //Up 2 and right 1
    else if(endRow == startRow-2 && endCol == startCol+1) {
        return true;
    }
    //Up 2 and left 1
    else if(endRow == startRow-2 && endCol == startCol-1) {
        return true;
    }
    //Down 1 and right 2
    else if(endRow == startRow+1 && endCol == startCol+2) {
        return true;
    }
    //Down 1 and left 2
    else if(endRow == startRow+1 && endCol == startCol-2) {
        return true;
    }
    //Down 2 and right 1
    else if(endRow == startRow+2 && endCol == startCol+1) {
        return true;
    }
    //Down 2 and left 1
    else if(endRow == startRow+2 && endCol == startCol-1) {
        return true;
    }
    else {
        return false;
    }
}

function moveBishop(msg, startCol, startRow, endCol, endRow, isWhite) {
    if(isValidBishopMove(startCol, startRow, endCol, endRow, isWhite)) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    else {
        msg.reply("Invalid bishop move!");
    }
}

function isValidBishopMove(startCol, startRow, endCol, endRow, isWhite) {
    if(!isBlank(board[endRow][endCol]) && !isCapturablePiece(board[endRow][endCol], isWhite)) {
        return false;
    }
    //To move diagonally, it must be moving the same num of rows as columns
    else if(Math.abs(endCol-startCol) == Math.abs(endRow-startRow))
    {
        return isDiagonalFree(startCol, startRow, endCol, endRow);
    }
    else
    {
        return false;
    }
}

function isDiagonalFree(startCol, startRow, endCol, endRow) {
    if(startRow < endRow)
    {
        var temp = startRow;
        startRow = endRow;
        endRow = temp;
        temp = startCol;
        startCol = endCol;
        endCol = temp;
    }
    if(startCol < endCol) {
        for(var i = 1; i < Math.abs(endCol-startCol); i++) {
            if(board[startRow-i][startCol+i] != " ")
                return false;
        }
    }
    else {
        for(var i = 1; i < Math.abs(endCol-startCol); i++) {
            if(board[startRow-i][startCol-i] != " ")
                return false;
        }
    }
    return true;
}

function moveQueen(msg, startCol, startRow, endCol, endRow, isWhite) {
    if(isValidQueenMove(startCol, startRow, endCol, endRow, isWhite)) {
        movePiece(msg, startCol, startRow, endCol, endRow);
    }
    else {
        msg.reply("Invalid queen move!");
    }
}

function isValidQueenMove(startCol, startRow, endCol, endRow, isWhite) {
    return isValidBishopMove(startCol, startRow, endCol, endRow, isWhite) || isValidRookMove(startCol, startRow, endCol, endRow, isWhite);
}

function moveKing(msg, startCol, startRow, endCol, endRow, isWhite) {
    if(isValidKingMove(startCol, startRow, endCol, endRow, isWhite)) {
        var temp = board[endRow][endCol];
        board[endRow][endCol] = board[startRow][startCol];
        if(!isChecked(endRow, endCol, isWhite)) {
            movePiece(msg, startCol, startRow, endCol, endRow);
        }
        else {
            board[endRow][endCol] = temp;
            msg.reply("Can't move to a space that is being threatened!");
        }
    }
    else {
        msg.reply("Invalid king move!");
    }
}

function isValidKingMove(startCol, startRow, endCol, endRow, isWhite) {
    if(!isBlank(board[endRow][endCol]) && !isCapturablePiece(board[endRow][endCol], isWhite)) {
        return false;
    }
    else if(Math.abs(endCol-startCol) <= 1 && Math.abs(endRow-startRow) <= 1) {
        return true;
    }
    else {
        return false;
    }
}

function isBlank(space) {
    return space == " ";
}

function isCapturablePiece(space, isWhite) {
    if(isWhite)
        return isBlackCapturablePiece(space);
    return isWhiteCapturablePiece(space);
}

function isBlackCapturablePiece(space) {
    return (space == blackPawn || space == blackRook || space == blackKnight || space == blackBishop || space == blackQueen || space == blackKing);
}

function isWhiteCapturablePiece(space) {
    return (space == whitePawn || space == whiteRook || space == whiteKnight || space == whiteBishop || space == whiteQueen || space == whiteKing);
}

function isChecked(row, column, isWhite) {
    for(var i = 0; i < 8; i++) {
        for(var j = 0; j < 8; j++) {
            switch(board[i][j]) {
                case blackPawn:
                    if(isValidPawnCaptureMove(j, i, column, row, !isWhite))
                        return true;
                    break;
                case blackRook:
                    if(isValidRookMove(j, i, column, row, !isWhite))
                        return true;
                    break;
                case blackKnight:
                    if(isValidRookMove(j, i, column, row, !isWhite))
                        return true;
                    break;
                case blackBishop:
                    if(isValidRookMove(j, i, column, row, !isWhite))
                        return true;
                    break;
                case blackQueen:
                    if(isValidQueenMove(j, i, column, row, !isWhite))
                        return true;
                    break;
                case blackKing:
                    if(isValidKingMove(j, i, column, row, !isWhite))
                        return true;
                    break;
                default:
                    continue;
            }
        }
    }
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