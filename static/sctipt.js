const localHost = "http://134.0.117.85:5555";
const socket = io(localHost);
let socketId = null
let guestSnakes = null

let guestIndex = 0

document.addEventListener('click', () => {guestIndex++})


/**
 * socket listeners
 */

socket.on("connection", (socket) => {
  console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});
socket.on('tmpId', (id) => {
  socketId = id
})
socket.on('socket_users_changes', (id) => {
  console.log(id)
})

socket.on('allSnakes', (snakes) => {
  let resultSnakes = [];
  Object.entries(snakes).forEach(item => {
    if(item[0] !== 'null' || item[0] !== socketId){
      resultSnakes.push(item)
    }
  })
  guestSnakes = resultSnakes
})




const canvas = document.getElementById('canvas');
const scoreText = document.getElementById('score');

let score = 1;
canvas.width = window.screen.availWidth * 1.25;
canvas.height = window.screen.availHeight * 1.127;
const ctx = canvas.getContext('2d');

const SNAKE = [];
let SNAKE2 = [];
const APPLES = [];
const TEXT = [];


const getRndInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getDistanse = (obj1, obj2) => {
  const dx = obj1.X - obj2.X;
  const dy = obj1.Y - obj2.Y;
  return Math.sqrt(dx * dx + dy * dy);
}

const showText = (frame, text) => {
  TEXT.push()
  let i = 0;
  if (i < frame) {
    i++;
  } else {
    
  }
}

//#region Classes

class Text{
  constructor(text, frames){
    this.text = text;
    this.frames = frames;
  }
  drow(){
    ctx.font = "30px Arial";
    ctx.fillText(this.text);
  }
}

class Apple {
  constructor() {
    this.radius = getRndInt(2, 6);
    this.X = getRndInt(10, canvas.width);
    this.Y = getRndInt(10, canvas.height);
    this.color = `rgb(42, 256, 42`;
    this.dx = getRndInt(-2, 2);
    this.dy = getRndInt(-2, 2);
  }

  draw() {
    if (getDistanse(this, SNAKE[0]) < SNAKE[0].radius + this.radius) {
      APPLES.splice(APPLES.indexOf(this), 1);

      const newSnake = new Snake();
      newSnake.X = SNAKE[SNAKE.length - 1].X;
      newSnake.Y = SNAKE[SNAKE.length - 1].Y;
      newSnake.radius = this.radius;
      newSnake.target = SNAKE[SNAKE.length - 1];
      SNAKE.push(newSnake);
      score++;
    }
    
    for (let i = 1; i < SNAKE.length; i++) {
      if (getDistanse(this, SNAKE[i]) < SNAKE[i].radius + this.radius)
        score--;
    }

    if (this.X - this.radius <= 0) this.dx = -this.dx;
    if (this.Y - this.radius <= 0) this.dy = -this.dy;
    if (this.X + this.radius > canvas.width) this.dx = -this.dx;
    if (this.Y + this.radius > canvas.height) this.dy = -this.dy;

    this.X += this.dx;
    this.Y += this.dy;

    ctx.beginPath();
    ctx.lineWidth = this.radius * 2;
    ctx.strokeStyle = this.color;
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
    ctx.stroke();
  }
}


class Snake {
  constructor() {
    this.radius = 7;
    this.X = getRndInt(10, 100);
    this.Y = getRndInt(10, 100);
    this.speed = 5;
    this.color = `rgb(256, 28, 28`;
    this.target = {
      X: 0,
      Y: 0,
    };
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = this.radius * 2;
    ctx.strokeStyle = this.color;
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
    ctx.stroke();

    if (getDistanse(this, this.target) > this.radius * 2) {
      this.speed = getDistanse(this, this.target) / 10;
      const dx = this.X - this.target.X;
      const dy = this.Y - this.target.Y;
      let theta = Math.atan2(dy, dx);
      let vX = Math.cos(theta) * this.speed;
      let vY = Math.sin(theta) * this.speed;
      this.X -= vX;
      this.Y -= vY;
    }
  }
}

//#endregion

function init() {
  SNAKE.push(new Snake());

  for (let i = 1; i < 8; i++) {
    const tailItem = new Snake();
    tailItem.speed -= 0.5 * i;
    tailItem.radius -= 0.7 * i;
    SNAKE.push(tailItem);
    SNAKE[i].target = SNAKE[i - 1];
  }
  for (let i = 0; i < 20; i++) {
    APPLES.push(new Apple())
  }
}

canvas.addEventListener('mousemove', (event) => {
  SNAKE[0].target.X = event.clientX;
  SNAKE[0].target.Y = event.clientY;
})

init();
requestAnimationFrame(function draw() {
  if(socket){
    const snakeRequest = {snake: {...SNAKE}, id: socketId }
    socket.emit('snake',  JSON.stringify(snakeRequest))
  }

  ctx.clearRect(0, 0, 10000, 10000);

  if(guestSnakes){
    const tmpSnake2 = [];

    if(guestSnakes[1]){
      const guestSnakeValues =  Object.values(guestSnakes[guestIndex][1])
      guestSnakeValues.forEach((item) => {
        qSnake = new Snake()

        qSnake.radius = item.radius;
        qSnake.X = item.X;
        qSnake.Y = item.Y;
        qSnake.speed = item.speed;
        qSnake.color = item.color;
        qSnake.target = item.target;
        tmpSnake2.push(qSnake)
      })
      SNAKE2 = tmpSnake2;
      SNAKE2.forEach(item => item.draw());
    }
  }
  SNAKE.forEach(item => item.draw());
  APPLES.forEach(item => item.draw());
  requestAnimationFrame(draw);
})

