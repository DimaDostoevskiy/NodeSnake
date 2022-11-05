/*********************************/
/*********************************/
/********* SERVER NODEJS *********/
/*********************************/
/*********************************/
const localHost = "ws://134.0.117.85:5555";
// const localHost = "ws://localhost:5555/";

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5555;
const cors = require('cors');
const path = require('path')

// Staic files from "./static" page
app.use(express.static(path.join(__dirname, 'static')))

// Home page
app.get('/', () => {
    res.sendfile("/index.html");
})

//socket.io init
const { createServer } = require("http");
const { Server } = require('socket.io');

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: localHost,
    }
});



/** Клиентский код
 *******************/

//Хранилище данных о состоянии змей
const snakes = {};

setInterval(() => {
    io.emit('allSnakes', snakes);
}, 10);

//Соединение пользователей онлайн и обработчики событий
io.on('connection', (socket) => {

    // Шина snake
    socket.on('snake', (snakeObject) => {
        snakes[snakeObject.id] = snakeObject.snake;
    })

    //Разрыв соединения сокета и удаления пользователя из списка онлайн
    socket.on('disconnect', () => {
        delete snakes[socket.id]
    });
});

/** Слушает запросы по порту ${PORT}
 ************************/
app.use(cors());
httpServer.listen(PORT, () => {
    console.log(`Blast-off on ${localHost}:${PORT} pid:${process.pid}`);
});