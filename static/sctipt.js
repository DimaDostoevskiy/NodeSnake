// set canvas
const canvas = document.getElementById('canvas');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;
const ctx = canvas.getContext('2d');

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

// cursor
const cursor = {
  X: 0,
  Y: 0,
  radius: 2,
  color: 'SlateBlue',
  draw() {
    ctx.beginPath();
    ctx.lineWidth = this.radius;
    ctx.strokeStyle = this.color;
    ctx.arc(this.X, this.Y, 2, 0, Math.PI * 2, true);
    ctx.stroke();
  }
}

class SnakePoint {

  constructor() {
    this.X = getRndInt(10, canvas.width);
    this.Y = getRndInt(10, canvas.height);
    this.radius = 6;
    this.speed = 8;
    this.color = `rgba(255, 89, 161, 0.9)`;
    this.target = {};
  }

  draw() {
    let indexFromArray = mySnake.indexOf(this);

    // draw this
    ctx.beginPath();
    ctx.lineWidth = this.radius * 2;
    ctx.strokeStyle = this.color;
    ctx.arc(this.X, this.Y, this.radius, 0, Math.PI * 2, true);
    ctx.stroke();

    // calculate collision with this target
    if (getDistanse(this, this.target) < this.radius * 4) return;

    // calculate speed
    if (indexFromArray) {
      this.speed = this.target.speed * 0.97;
      if (this.speed < 2) this.speed = 2;
      if (this.speed > 30) this.speed = 30;
    } else {
      this.speed = getDistanse(this, this.target) / 70;
      if (this.speed > 20) this.speed = 20;
    }

    // calculate velocity
    const dx = this.X - this.target.X;
    const dy = this.Y - this.target.Y;
    let theta = Math.atan2(dy, dx);
    let vX = Math.cos(theta) * this.speed;
    let vY = Math.sin(theta) * this.speed;
    this.X -= vX;
    this.Y -= vY;

    // calculate collision
    apples.forEach(item => {
      if (getDistanse(this, item) < (this.radius + item.radius)) {
        // if !head create new apple
        if (indexFromArray) {
          for (let i = 0; i < mySnake.length - indexFromArray + 5; i++) {
            const newApple = new Apple();
            newApple.X = this.X;
            newApple.Y = this.Y;
            apples.push(newApple)
          }
          mySnake.splice(indexFromArray, mySnake.length - indexFromArray)
          // if head add new snakePoint to tail
        } else {
          const newSnakePoint = new SnakePoint();

          newSnakePoint.X = mySnake[mySnake.length - 1].X;
          newSnakePoint.Y = mySnake[mySnake.length - 1].Y;

          newSnakePoint.radius = item.radius;
          newSnakePoint.target = mySnake[mySnake.length - 1];

          mySnake.push(newSnakePoint)
          apples.splice(apples.indexOf(item), 1)
        }
      }
    })
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

const mySnake = [];
const apples = [];
// init my snake
const init = () => {
  mySnake.push(new SnakePoint())
  mySnake[0].target = cursor;

  for (let i = 1; i < 8; i++) {
    const newSnakePoint = new SnakePoint();
    newSnakePoint.radius = mySnake[i - 1].radius * 0.9;
    newSnakePoint.target = mySnake[i - 1];
    mySnake.push(newSnakePoint)
  }
  for (let i = 1; i < 32; i++) {
    apples.push(new Apple())
  }
}

init();

// animate
requestAnimationFrame(function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw cursor
  cursor.draw();
  // draw mySnake
  mySnake.forEach(i => i.draw())
  // draw apples
  apples.forEach(i => i.draw())
  // animate
  requestAnimationFrame(draw);
})

// update mySnake target
canvas.addEventListener('mousemove', (event) => {
  cursor.X = event.clientX;
  cursor.Y = event.clientY;
})

// if (socket.connected) {
//   const snake = snake1.tail.map(snakePoint => {
//     return { x: snakePoint.X, y: snakePoint.Y }
//   })
//   socket.emit('snake', { snake, id: socket.id })
// }

// if (guestSnakes && guestSnakes.length) {
//   guestSnakes.forEach((guestSnake) => {
//     let tmpSnakes = []
//     guestSnake.forEach((item) => {
//       let gSnake = new Snake()
//       gSnake.X = item.x;
//       gSnake.Y = item.y;
//       tmpSnakes.push(gSnake)
//     })
//     snakes.push(tmpSnakes);
//   })

//   if (snakes && snakes.length) {
//     snakes.forEach((guestSnake) => {
//       guestSnake.forEach(item => {
//         item.draw()
//       });
//     })
//   }
// }
// }, 10)