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
const { CONNECT, DISCONNECT, SOCKET_USERS_CHANGES, INVITE_USER } = require("./src/constants/socketEvents");

//socket.io инициация
const { createServer } = require("http");
const { Server } = require('socket.io');
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3001",
    }
});

//Хранилище данных о состоянии пользователей
const socketUsers = {};

//Соединение пользователей онлайн и обработчики событий
io.on(CONNECT, (socket) => {
    socketUsers[socket.id] = jwtUser;
    io.emit(SOCKET_USERS_CHANGES, socketUsers);

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