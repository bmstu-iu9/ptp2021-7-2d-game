import { io } from "socket.io-client";
import { PageNavigation } from "./pageNavigation.js";
import { PhaserGame } from "./game/game.js";

const Client = { 
    socket: io()
};

const pageNav = new PageNavigation(Client);

Client.socket.on('startGame', function() {
    PageNavigation.switchTo('gameWaiting', 'game');
    new PhaserGame(Client.socket); 
});
Client.socket.on('changePlayerCounterInRoom', function(numPlayers, roomSize) {
    document.getElementById('playerCounter').innerHTML = `Waiting for other players (${numPlayers}/${roomSize})`;
});
Client.socket.on('initRoomSettings', function(roomID) {
    document.getElementById('roomID').innerHTML = roomID;
});
Client.socket.on('youEnteredRoom', function(fromID) {
    PageNavigation.switchTo(fromID, 'gamingPage');
});

pageNav.initPages();