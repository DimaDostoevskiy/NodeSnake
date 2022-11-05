const localHost = "ws://134.0.117.85:5555";
// const localHost = "ws://localhost:5555/";
const socket = io(localHost);
let guestSnakes = null

/**
 * socket listeners
 */

socket.on('allSnakes', (snakes) => {
  let resultSnakes = [];
  Object.entries(snakes).forEach(item => {
    if (item[0] !== socket.id) {
      resultSnakes.push(item[1])
    }
  })
  guestSnakes = resultSnakes
})

const canvas = document.getElementById('canvas');
canvas.width = window.screen.availWidth * 1.25;
canvas.height = window.screen.availHeight * 1.127;
const ctx = canvas.getContext('2d');

const SNAKE = [];
const APPLES = [];

const getRndInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getDistanse = (obj1, obj2) => {
  const dx = obj1.X - obj2.X;
  const dy = obj1.Y - obj2.Y;
  return Math.sqrt(dx * dx + dy * dy);
}

//#region Classes

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
    this.speed = 1;
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

    if (getDistanse(this, this.target) > this.radius) {
      this.speed = (this.speed < 5) ? getDistanse(this, this.target) / 10 : 2;
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

const cursor = {
  x: 0, y: 0, draw() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, true);
    ctx.stroke();
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
  cursor.x = event.clientX;
  cursor.y = event.clientY;
})

setInterval(() => {
  ctx.clearRect(0, 0, 10000, 10000);
  cursor.draw();
  SNAKE.forEach(item => item.draw());
  APPLES.forEach(item => item.draw());

  let snakes = []

  SNAKE[0].target.X = cursor.x;
  SNAKE[0].target.Y = cursor.y;

  if (socket.connected) {
    socket.emit('snake', { SNAKE, id: socket.id })
  }

  if (guestSnakes && guestSnakes.length) {
    guestSnakes.forEach((guestSnake) => {
      let tmpSnakes = []
      guestSnake.forEach((item) => {
        let gSnake = new Snake()
        gSnake.radius = item.radius;
        gSnake.X = item.X;
        gSnake.Y = item.Y;
        gSnake.speed = item.speed;
        gSnake.color = item.color;
        gSnake.target = item.target;
        tmpSnakes.push(gSnake)
      })
      snakes.push(tmpSnakes);
    })

    if (snakes && snakes.length) {
      snakes.forEach((guestSnake) => {
        guestSnake.forEach(item => {
          item.draw()
        });
      })
    }
  }
}, 10)

init();
requestAnimationFrame(function draw() {

  requestAnimationFrame(draw);
})