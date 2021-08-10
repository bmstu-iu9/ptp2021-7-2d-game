import express from 'express';
import { createServer } from 'http';
import geckos from '@geckos.io/server';
import path from 'path';
import { MatterGame } from './game/game.js';
import { Room } from './game/components/room.js';

const app = express(); 
const httpServer = createServer(app);
const io = geckos();

const port = 27016;
const dirname = path.resolve();

app.get('/', function(req, res) {
    res.sendFile(path.join(dirname, '/public/index.html'));
});
app.use('/dist', express.static(path.join(dirname, '/client/dist')));
app.use('/public', express.static(path.join(dirname, '/public')));

io.addServer(httpServer);

const games = new Map();
const rooms = new Map();

io.onConnection((channel) => {
    channel.on('createRoom', (size) => {
        if (size >= 2 && size <= 10) {
            const roomId = channel.id; 
            channel.join(roomId);
            rooms.set(roomId, new Room(roomId, size, new Map([[channel.id, channel]])));

            channel.emit('initRoomSettings', roomId);
            channel.emit('changePlayerCounterInRoom', {numPlayers: 1, roomSize: size});
            channel.emit('youEnteredRoom', 'creatingPage'); 
        }
    });

    channel.on('joinRoom', (roomId) => {
        const room = rooms.get(roomId);
        if (room && !room.gameStarted) {
            channel.join(roomId);
            room.addChannel(channel);

            channel.emit('youEnteredRoom', 'joiningPage');
            channel.emit('initRoomSettings', roomId);
            io.room(roomId).emit('changePlayerCounterInRoom', {numPlayers: room.size, roomSize: room.maxSize});

            if (room.size == room.maxSize) { 
                io.room(roomId).emit('startGame');
                room.gameStarted = true;
                //console.log(process.memoryUsage()); //утечка памяти наблюдается
                games.set(roomId, new MatterGame(io, room));
            }
        }
    });

    channel.on('leaveRoom', () => {
        const roomId = channel.roomId; 
        if (roomId) {
            const room = rooms.get(roomId);
            channel.leave();
            room.removeChannel(channel.id);

            if (!room.gameStarted) {
                io.room(roomId).emit('changePlayerCounterInRoom', {numPlayers: room.size, roomSize: room.maxSize});			
            }
        }
    });	

    channel.onDisconnect(() => {
        const roomId = channel.roomId; 
        if (roomId) {
            const room = rooms.get(roomId);
            room.removeChannel(channel.id);

            if (!room.gameStarted) {
                io.room(roomId).emit('changePlayerCounterInRoom', {numPlayers: room.size, roomSize: room.maxSize});
            } else {
                if (room.size == 1) {
                    games.get(roomId)?.destroy();
                    games.delete(roomId);
                } else {
                    games.get(roomId)?.scenes[0].playerDisconnected(channel);
                }
            }
        }
    });

    channel.on('movement', function(movement) {
        const roomId = channel.roomId; 
        if (roomId) {
            games.get(roomId)?.scenes[0].movement(channel, movement);
        } 
    });

    channel.on('clientInitialized', function() {
        const roomId = channel.roomId; 
        if (roomId) {
            games.get(roomId)?.scenes[0].clientInitialized(channel);
        }
    });

    channel.on('addElement', function(element) {
        const roomId = channel.roomId; 
        games.get(roomId)?.scenes[0].addElement(channel, element);
    });
});

httpServer.listen(port, function() {
    console.log(`listening on *:${port}`);
});