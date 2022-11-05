/*********************************/
/*********************************/
/********* SERVER NODEJS *********/
/*********************************/
/*********************************/


const express = require('express');
const app = express();
const PORT = process.env.PORT || 5555;
const cors = require('cors');
const path = require('path')

// Статичные файлы из static
app.use(express.static(path.join(__dirname, 'static')))

// Главная страница
app.get('/', () => {
    res.sendfile("/index.html");
})

//socket.io инициация
const { createServer } = require("http");
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://134.0.117.85:5555",
    }
});



/** Клиентский код
 *******************/

//Хранилище данных о состоянии змей
const snakes = {};


setInterval(() => {
    io.emit('allSnakes', snakes);
}, 60);

//Соединение пользователей онлайн и обработчики событий
io.on('connection', (socket) => {

    // Шина snake
    socket.on('snake', (snakeObject) => {
        snakes[snakeObject.id] = snakeObject.SNAKE;
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
    console.log(`Blast-off on http://localhost:${PORT} pid:${process.pid}`);
});