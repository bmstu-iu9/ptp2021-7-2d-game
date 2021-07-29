import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { MatterGame } from './game/game.js';

const app = express(); 
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = 27016;
const dirname = path.resolve();

app.get('/', function(req, res) {
    res.sendFile(path.join(dirname, '/public/index.html'));
});
app.use('/dist', express.static(path.join(dirname, '/client/dist')));
app.use('/public', express.static(path.join(dirname, '/public')));

httpServer.listen(port, function() {
    console.log(`listening on *:${port}`);
});

const games = new Map();

io.on('connection', function(socket) {
    socket.on('createRoom', function(size) {
        if (size >= 2 & size <= 10) {
            const roomID = socket.id; 

            socket.join(roomID);

            const room = socket.adapter.rooms.get(roomID);
            room.gameStarted = false;
            room.maxSize = size;

            socket.emit('initRoomSettings', roomID);
            socket.emit('changePlayerCounterInRoom', 1, size);
            socket.emit('youEnteredRoom', 'creatingPage'); 

            socket.roomID = roomID;
        }
    });

    socket.on('joinRoom', function(roomID) {
        const room = socket.adapter.rooms.get(roomID)
        if (room && !room.gameStarted) {
            const maxSize = room.maxSize; 
            socket.join(roomID);

            socket.emit('youEnteredRoom', 'joiningPage');
            socket.emit('initRoomSettings', roomID);
            io.to(roomID).emit('changePlayerCounterInRoom', room.size, maxSize);

            socket.roomID = roomID;
            if (room.size == maxSize) { 
                io.to(roomID).emit('startGame');
                room.gameStarted = true;
                console.log(process.memoryUsage()); //утечка памяти наблюдается
                games.set(roomID, new MatterGame(io, roomID));
            }
        }
    });

    socket.on('leaveRoom', function() {
        const roomID = socket.roomID;
        if (roomID) {
            const room = socket.adapter.rooms.get(roomID);
            socket.leave(roomID);
            if (!room.gameStarted) {
                io.to(roomID).emit('changePlayerCounterInRoom', room.size, room.maxSize);			
            }
            socket.roomID = null;
        }
    });	

    socket.on('disconnecting', function() {
        const roomID = socket.roomID;
        if (roomID) {
            const room = socket.adapter.rooms.get(roomID);
            if (!room.gameStarted) {
                io.to(roomID).emit('changePlayerCounterInRoom', room.size-1, room.maxSize);
            } else {
                if (room.size == 1) {
                    games.get(roomID).destroy();
                    games.delete(roomID);
                } else {
                    games.get(roomID).scenes[0].playerDisconnected(socket);
                }
            }
        }
    });

    socket.on('movement', function(movement) {
        const roomID = socket.roomID; 
        if (roomID) {
            games.get(roomID)?.scenes[0].movement(socket, movement);
        } 
    });

    socket.on('clientInitialized', function() {
        const roomID = socket.roomID;
        if (roomID) {
            games.get(roomID)?.scenes[0].clientInitialized(socket);
        }
    });

    socket.on('addElement', function(element) {
        const roomID = socket.roomID;
        games.get(roomID)?.scenes[0].addElement(socket, element);
    });
});