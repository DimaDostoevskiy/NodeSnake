const localHost = "https://localhost:3001";
const socket = io(localHost);
console.log(socket);






const canvas = document.getElementById('canvas');
const scoreText = document.getElementById('score');

canvas.width = window.screen.availWidth * 1.25;
canvas.height = window.screen.availHeight * 1.127;
console.log(canvas.width);
const ctx = canvas.getContext('2d');

const SNAKE = [];
const APPLES = [];

let score = 1;

const getRndInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getDistanse = (obj1, obj2) => {
  const dx = obj1.X - obj2.X;
  const dy = obj1.Y - obj2.Y;
  return Math.sqrt(dx * dx + dy * dy);
}

const showText = (frame, text) => {
  let i = 0;
  if (i < frame) {
    ctx.font = "30px Arial";
    ctx.fillText(text);
    i++;
  } else {

  }
}

//#region Apple

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

//#endregion

//#region Snake

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
  ctx.clearRect(0, 0, 10000, 10000);
  SNAKE.forEach(item => item.draw());
  APPLES.forEach(item => item.draw());
  requestAnimationFrame(draw);
})

