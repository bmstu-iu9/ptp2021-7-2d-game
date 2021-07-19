import { io } from "socket.io-client";
import { initPages, switchTo } from "./pageNavigation.js";

const Client = {
    Room: {}
};
Client.socket = io();

//FOR ROOM
Client.socket.on('startGame', function() {
    switchTo('gameWaiting', 'game');
});
Client.socket.on('changePlayerCounterInRoom', function(numPlayers, roomSize) {
    document.getElementById('playerCounter').innerHTML = `Waiting for other players (${numPlayers}/${roomSize})`;
});
Client.socket.on('initRoomSettings', function(roomID, size) {
    Client.Room.id = roomID;
    Client.Room.size = size;
    document.getElementById('roomID').innerHTML = roomID;
});
Client.socket.on('youEnteredRoom', function(fromID) {
    switchTo(fromID, 'gamingPage');
})

initPages(Client);