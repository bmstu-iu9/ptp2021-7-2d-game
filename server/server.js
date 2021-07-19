import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';

const app = express(); 
const httpServer = createServer(app);
const io = new Server(httpServer);

const port = 8080;
const dirname = path.resolve();

app.get('/', function(req, res) {
    res.sendFile(path.join(dirname, '/public/index.html'));
});
app.use('/dist', express.static(path.join(dirname, '/client/dist')));
app.use('/public', express.static(path.join(dirname, '/public')));

httpServer.listen(port, function() {
    console.log(`listening on *:${port}`);
});

io.on('connection', function(socket) {
    socket.on('createRoom', function(size) {
        let sizeInt = parseInt(size);
        if (sizeInt >= 2 & sizeInt <= 10) {
            let roomID = socket.id;
            socket.adapter.rooms.get(roomID).isGaming = true;
            socket.adapter.rooms.get(roomID).gameStarted = false;
            socket.adapter.rooms.get(roomID).maxSize = sizeInt;

            socket.join(roomID);
            socket.emit('initRoomSettings', roomID, sizeInt);
            socket.emit('changePlayerCounterInRoom', 1, sizeInt);
            socket.emit('youEnteredRoom', 'creatingPage');
        }
    });

    socket.on('joinRoom', function(roomID) {
        if (socket.adapter.rooms.get(roomID) && !socket.adapter.rooms.get(roomID).gameStarted) {
            let size = socket.adapter.rooms.get(roomID).maxSize;
            socket.join(roomID);
            socket.emit('youEnteredRoom', 'joiningPage');
            socket.emit('initRoomSettings', roomID, size);
            io.to(roomID).emit('changePlayerCounterInRoom', socket.adapter.rooms.get(roomID).size, size);
            if (socket.adapter.rooms.get(roomID).size == size) {
                io.to(roomID).emit('startGame');
                socket.adapter.rooms.get(roomID).gameStarted = true;
            }
        }
    });

    socket.on('disconnecting', function() {
        let roomID = findGamingRoom(socket);
        if (roomID) {
            let room = socket.adapter.rooms.get(roomID);
            if (!room.gameStarted) {
                io.to(roomID).emit('changePlayerCounterInRoom', room.size-1, room.maxSize);
            }
        }
    });
});

function findGamingRoom(socket) {
    for (const [roomID, room] of socket.adapter.rooms) {
        let arr = Array.from(room);
        let ok = false;
        for (const x of arr) {
            if (x == socket.id) {
                ok = true;
                break;
            }
        }
        if(ok & room.isGaming) {
            return roomID;
        }
    }
    return null;
}