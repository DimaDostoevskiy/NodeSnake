const express = require('express');
const app = express();
const PORT = process.env.PORT || 5555;
const cors = require('cors');
const path = require('path')

app.use(express.static(path.join(__dirname, 'static')))
app.get('/', () => {
    res.sendfile("/index.html");
})
//Константы
const { CONNECT, DISCONNECT, SOCKET_USERS_CHANGES} = require("./src/constants/socketEvents");

//socket.io инициация
const { createServer } = require("http");
const { Server } = require('socket.io');
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://134.0.117.85:5555/",
    }
});

//Хранилище данных о состоянии пользователей
const socketUsers = {};
const snakes = {};

//Соединение пользователей онлайн и обработчики событий
io.on(CONNECT, (socket) => {
    const tmpId = Date.now()
    socketUsers[socket.id] = tmpId;
    socket.emit(SOCKET_USERS_CHANGES, socketUsers);
    socket.emit('tmpId', tmpId)

    socket.on('snake', (snakeObjectJson) => {
        const snakeObject = JSON.parse(snakeObjectJson);
        snakes[snakeObject.id] = snakeObject.snake;
    })

    setInterval(() => {
        socket.emit('allSnakes', snakes);
    }, 10);


    //Разрыв соединения сокета и удаления пользователя из списка онлайн
    socket.on(DISCONNECT, () => {
        delete socketUsers[socket.id];
        io.emit(SOCKET_USERS_CHANGES, socketUsers);
    });
});

app.use(cors());

httpServer.listen(PORT, () => {
    console.log(`Blast-off on http://localhost:${PORT} pid:${process.pid}`);
});