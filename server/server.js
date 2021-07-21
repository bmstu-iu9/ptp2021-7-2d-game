import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { PhaserGame } from './game/game.js';

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
            let roomID = socket.id; 
            socket.join(roomID);
			let room = socket.adapter.rooms.get(roomID);
			room.gameStarted = false;
            room.maxSize = size;

            socket.emit('initRoomSettings', roomID);
            socket.emit('changePlayerCounterInRoom', 1, size);
            socket.emit('youEnteredRoom', 'creatingPage'); 

            socket.roomID = roomID;
        }
    });

    socket.on('joinRoom', function(roomID) {
		let room = socket.adapter.rooms.get(roomID)
        if (room && !room.gameStarted) {
            let maxSize = room.maxSize; 
            socket.join(roomID);

            socket.emit('youEnteredRoom', 'joiningPage');
            socket.emit('initRoomSettings', roomID);
            io.to(roomID).emit('changePlayerCounterInRoom', room.size, maxSize);

            socket.roomID = roomID;
            if (room.size == maxSize) { 
                io.to(roomID).emit('startGame');
                room.gameStarted = true;
                games.set(roomID, new PhaserGame(io, roomID));
            }
        }
    });
	
	socket.on('leaveRoom', function() {
		let roomID = socket.roomID;
		if (roomID) {
			let room = socket.adapter.rooms.get(roomID);
			socket.leave(roomID);
			if (!room.gameStarted) {
				io.to(roomID).emit('changePlayerCounterInRoom', room.size, room.maxSize);			
			}
			socket.roomID = null;
		}
	});	

    socket.on('disconnecting', function() {
        let roomID = socket.roomID;
        if (roomID) {
            let room = socket.adapter.rooms.get(roomID);
            if (!room.gameStarted) {
                io.to(roomID).emit('changePlayerCounterInRoom', room.size-1, room.maxSize);
            } else {
                if (room.size == 1) {
                    games.delete(roomID);
                } else {
                    games.get(roomID).scene.scenes[0].emitDisconnect(socket);
                }
            }
        }
    });

    socket.on('movement', function(movement) {
        let roomID = socket.roomID; 
        if (roomID) {
            games.get(roomID)?.scene.scenes[0].emitMovement(socket, movement);
        } 
    })
});