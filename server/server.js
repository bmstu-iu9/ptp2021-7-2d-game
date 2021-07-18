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

io.on('connection', function(socket) {});

httpServer.listen(port, function() {
    console.log(`listening on *:${port}`);
});