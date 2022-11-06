

// set canvas
const canvas = document.getElementById('canvas');
canvas.width = window.screen.availWidth * 1.25;
canvas.height = window.screen.availHeight * 1.127;
const ctx = canvas.getContext('2d');

// constants
const APPLES = [];      // aplles
let guestSnakes = null // guests snakes


// set socet
// const localHost = "ws://134.0.117.85:5555";     //for prod
const localHost = "ws://localhost:5555/";
const socket = io(localHost);


socket.on('allSnakes', (snakes) => {
  let resultSnakes = [];
  Object.entries(snakes).forEach(item => {
    if (item[0] !== socket.id) {
      resultSnakes.push(item[1])
    }
  })
  guestSnakes = resultSnakes
})

const getRndInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getDistanse = (obj1, obj2) => {
  const dx = obj1.X - obj2.X;
  const dy = obj1.Y - obj2.Y;
  return Math.sqrt(dx * dx + dy * dy);
}

const cursor = {
  X: 0, Y: 0, draw() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.arc(this.X, this.Y, 2, 0, Math.PI * 2, true);
    ctx.stroke();
  }
}

class Tail {

  constructor() {
    this.X = getRndInt(10, canvas.width);
    this.Y = getRndInt(10, canvas.height);

    this.speed = 5;
    this.radius = 5;
    this.color = 'red';

    this.target = {
      X: 0,
      Y: 0,
    };
  }
}

class Apple {

  constructor(color = `rgb(42, 256, 42`) {
    this.radius = getRndInt(20, 60) / 10;
    this.X = getRndInt(10, canvas.width);
    this.Y = getRndInt(10, 20);
    this.color = color;
    this.dx = getRndInt(-20, 20) / 10;
    this.dy = getRndInt(-20, 20) / 10;
  }

  draw() {
    ctx.beginPath();
    ctx.lineWidth = this.radius * 2;
    ctx.strokeStyle = this.color;
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
    ctx.stroke();

    if (this.X - this.radius <= 0) this.dx = -this.dx;
    if (this.Y - this.radius <= 0) this.dy = -this.dy;
    if (this.X + this.radius > canvas.width) this.dx = -this.dx;
    if (this.Y + this.radius > canvas.height) this.dy = -this.dy;

    this.X += this.dx;
    this.Y += this.dy;
  }
}

class Snake {

  constructor() {
    this.color = 'red';
    this.init();
  }

  init() {
    this.tail = [];
    for (let i = 0; i < 8; i++) {
      this.tail.push(new Tail())
      if (i === 0) {
        this.tail[i].target = cursor;
        continue;
      }
      this.tail[i].target = this.tail[i - 1];
      this.tail[i].radius = this.tail[i - 1].radius * 0.9;
      this.tail[i].speed = this.tail[i - 1].speed * 0.95;
    }
  }

  draw() {
    // APPLES.forEach(item => {
    //   if (getDistanse(this.tail[i], item) < this.tail[i].radius + item.radius) {
    //       if (i < 1) {
    //         const newTail = new Tail();
    //         newTail.X = this.tail[this.tail.length - 1].X;
    //         newTail.Y = this.tail[this.tail.length - 1].Y;
    //         newTail.radius = item.radius;
    //         newTail.color = this.color;
    //         newTail.target = this.tail[this.tail.length - 1];

    //         APPLES.splice(APPLES.indexOf(item), 1);
    //         this.tail.push(newTail);
    //       } else {
    //         const newApple = new Apple();
    //         newApple.X = this.tail[i].X;
    //         newApple.Y = this.tail[i].Y;
    //         newApple.radius = this.tail[i].radius;

    //         APPLES.push(newApple);
    //         this.tail.splice(this.tail.indexOf(this.tail[i]), 1);
    //         for (let i = 1; i < this.tail.length; i++) {
    //           this.tail[i].target = this.tail[i - 1];
    //         }
    //       }
    //     }
    // })

    for (let i = 0; i < this.tail.length; i++) {

      ctx.beginPath();
      ctx.lineWidth = this.tail[i].radius * 2;
      ctx.strokeStyle = this.tail[i].color;
      ctx.arc(this.tail[i].X, this.tail[i].Y, this.tail[i].radius, 0, Math.PI * 2, true);
      ctx.stroke();

      if (getDistanse(this.tail[i], this.tail[i].target) < this.tail[i].radius * 6) continue;
      snake1.tail[0].speed = getDistanse(snake1.tail[0], cursor) / 80;
      if (i > 0) this.tail[i].speed = this.tail[i - 1].speed;

      const dx = this.tail[i].X - this.tail[i].target.X;
      const dy = this.tail[i].Y - this.tail[i].target.Y;
      let theta = Math.atan2(dy, dx);
      let vX = Math.cos(theta) * this.tail[i].speed;
      let vY = Math.sin(theta) * this.tail[i].speed;
      this.tail[i].X -= vX;
      this.tail[i].Y -= vY;
    }
  }
}

const snake1 = new Snake();
const snake2 = new Snake();

setInterval(() => {
  // clear canvas
  ctx.clearRect(0, 0, 10000, 10000);
  // draw apples
  if (APPLES.length < 20) APPLES.push(new Apple())
  APPLES.forEach(item => item.draw())
  // array for guessts snakes
  let snakes = []

  if (socket.connected) {
    const snake = snake1.tail.map(snakePoint => {
      return { x: snakePoint.X, y: snakePoint.Y }
    })
    socket.emit('snake', { snake, id: socket.id })
  }

  if (guestSnakes && guestSnakes.length) {
    guestSnakes.forEach((guestSnake) => {
      let tmpSnakes = []
      guestSnake.forEach((item) => {
        let gSnake = new Snake()
        gSnake.X = item.x;
        gSnake.Y = item.y;
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

requestAnimationFrame(function draw() {
  if (snake1.tail.length > 0) snake1.draw();
  cursor.draw();
  requestAnimationFrame(draw);
})

canvas.addEventListener('mousemove', (event) => {
  cursor.X = event.clientX;
  cursor.Y = event.clientY;
})