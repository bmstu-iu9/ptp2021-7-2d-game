import geckos from '@geckos.io/client';
import { PageNavigation } from "./pageNavigation.js";
import { PhaserGame } from "./game/game.js";

const channel = geckos({ port: 27016 });

const pageNav = new PageNavigation(channel);

channel.onConnect((error) => {
    if (error) {
        console.error(error.message);
        return;
    }

    channel.on('startGame', () => {
        PageNavigation.switchTo('gameWaiting', 'game');
        new PhaserGame(channel); 
    });

    channel.on('changePlayerCounterInRoom', (data) => {
        const { numPlayers, roomSize } = data;
        document.getElementById('playerCounter').innerHTML = `Waiting for other players (${numPlayers}/${roomSize})`;
    });

    channel.on('initRoomSettings', (roomId) => {
        document.getElementById('roomID').innerHTML = roomId;
    });

    channel.on('youEnteredRoom', (fromId) => {
        PageNavigation.switchTo(fromId, 'gamingPage');
        pageNav.fromPageId = fromId;
    });
});

pageNav.initPages();