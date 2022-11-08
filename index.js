/*******************************************/
/*******************************************/
/*************** SERVER NODEJS *************/
/*******************************************/
/*******************************************/

// const localHost = "ws://134.0.117.85:5555";     //for prod
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
let socketIO = null;

setInterval(() => {
    io.emit('allSnakes', snakes);
}, emitSnakesInterval);

//Соединение пользователей онлайн и обработчики событий
io.on('connection', (socket) => {

    console.log(`user ${socket.id} connection`);

    socket.on('snake', (snake) => {
        // console.log(id);
        // console.log(snake);
        snakes[socket.id] = snake;
        socketIO = socket;
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
    console.log(`Blast-off on ${localHost} pid:${process.pid}`);
});


// for dev
setInterval(() => {
    console.log(`--------------------------------------------`);
    console.log(snakes);
}, 5000)




