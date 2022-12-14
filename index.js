/*********************************/
/*********************************/
/********* SERVER NODEJS *********/
/*********************************/
/*********************************/

// const localHost = "ws://134.0.117.85:5555"; // for dev
const localHost = "ws://localhost:5555/";

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5555;
const cors = require('cors');
const path = require('path')

// use static files from "./static"
app.use(express.static(path.join(__dirname, 'static')))

// routing
app.get('/', () => {
    res.sendfile("/index.html");
})

// socket.io init
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

const emitSnakesInterval = 60;

//Хранилище данных о состоянии змей
const snakes = {};

//Хранилище данных о состоянии яблок
const Apple = require('./src/game/apples')
Apple.generateApples(500);

setInterval(() => {
    io.emit('allSnakes', snakes);
}, emitSnakesInterval);

//Соединение пользователей онлайн и обработчики событий
io.on('connection', (socket) => {


    /** Apple section
     ****************************/
    io.to(socket.id).emit('apples', Apple.apples)
    socket.on('consume_apple', (id) => {
        Apple.removeApple(id);
        socket.broadcast.emit('apple_consumed', id);
    })

    /** Snake section
     ****************************/
    socket.on('snake', (snake) => {
        snakes[socket.id] = snake;
    })

    /** Chat section
     ****************************/
    socket.on('chat_message', (msg) => {
        io.emit('new_message', msg)
    })

    /** Disconnect section
     ****************************/
    //Разрыв соединения сокета и удаления пользователя из списка онлайн
    socket.on('disconnect', () => {
        delete snakes[socket.id]
    });
});

/** Слушает запросы по порту ${PORT}
 ************************/
app.use(cors());
httpServer.listen(PORT, () => {
    console.log(`Blast-off on ${PORT} pid:${process.pid}`);
});