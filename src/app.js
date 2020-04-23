const express = require('express');
const socket = require('socket.io');

const app = express();
const port = 5050;

app.use(express.static('public'));

const server = app.listen(port, () => {
    console.log(`Server running at port http://localhost:${port}`)
});

const io = socket(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('collection', data => {
        io.sockets.emit('collection', data);
    });

    socket.on('task', task => {
        io.sockets.emit('task', task);
    });

    socket.on('drag', collection => {
        io.sockets.emit('drag', collection);
    });
});