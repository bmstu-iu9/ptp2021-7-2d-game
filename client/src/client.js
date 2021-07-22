import { io } from "socket.io-client";
import { PageNavigation } from "./pageNavigation.js";
import { PhaserGame } from "./game/game.js";

const сlient = { 
    socket: io()
};

const pageNav = new PageNavigation(сlient);

сlient.socket.on('startGame', function() {
    PageNavigation.switchTo('gameWaiting', 'game');
    new PhaserGame(сlient.socket); 
});
сlient.socket.on('changePlayerCounterInRoom', function(numPlayers, roomSize) {
    document.getElementById('playerCounter').innerHTML = `Waiting for other players (${numPlayers}/${roomSize})`;
});
сlient.socket.on('initRoomSettings', function(roomID) {
    document.getElementById('roomID').innerHTML = roomID;
});
сlient.socket.on('youEnteredRoom', function(fromID) {
    PageNavigation.switchTo(fromID, 'gamingPage');
    pageNav.fromPageID = fromID;
});

pageNav.initPages();