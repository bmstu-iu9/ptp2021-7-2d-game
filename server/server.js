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
        if (size >= 2 && size <= 10) {
            let roomID = socket.id;
            io.sockets.adapter.rooms.get(roomID).gameStarted = false;
            io.sockets.adapter.rooms.get(roomID).maxSize = size;

            socket.join(roomID);
            socket.emit('initRoomSettings', roomID, size);
            socket.emit('playerConnectedToRoom', 1, size);
        }
    });

    socket.on('joinRoom', function(roomID) {
        if (io.sockets.adapter.rooms.get(roomID) && !io.sockets.adapter.rooms.get(roomID).gameStarted) {
            let size = io.sockets.adapter.rooms.get(roomID).maxSize;
            socket.join(roomID);
            socket.emit('youEnteredRoom');
            socket.emit('initRoomSettings', roomID, size);
            io.to(roomID).emit('playerConnectedToRoom', io.sockets.adapter.rooms.get(roomID).size, size);
            if (io.sockets.adapter.rooms.get(roomID).size == size) {
                io.to(roomID).emit('startGame');
                io.sockets.adapter.rooms.get(roomID).gameStarted = true;
            }
        }
    });
});