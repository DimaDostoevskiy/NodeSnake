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

// constants
const minSpeed = 4;
const maxSpeed = 40;
const maxSnakeRadius = 8;
const minSnakeRadius = 1;

// snakes
const apples = [];

// support
const getRndInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + min);

const getDistanse = (obj1, obj2) => {
  const dx = obj1.X - obj2.X;
  const dy = obj1.Y - obj2.Y;
  return Math.sqrt(dx * dx + dy * dy);
}

const drawSnake = (snake) => {
  snake.forEach((item, index) => {
    // draw this
    ctx.beginPath();
    ctx.lineWidth = item.radius * 2;
    ctx.strokeStyle = item.color;
    ctx.arc(item.X, item.Y, item.radius, 0, Math.PI * 2, true);
    ctx.stroke();
    // calculate collision with this target
    if (getDistanse(item, item.target) < item.radius * 4) return;
    // calculate speed
    if (index === 0) {
      item.speed = getDistanse(item, item.target) / 40;
    } else {
      item.speed = item.target.speed * 0.92;
      if (item.speed < minSpeed) item.speed = minSpeed;
      if (item.speed > maxSpeed) item.speed = maxSpeed;
    }
    // calculate velocity
    const dx = item.X - item.target.X;
    const dy = item.Y - item.target.Y;
    let theta = Math.atan2(dy, dx);
    let vX = Math.cos(theta) * item.speed;
    let vY = Math.sin(theta) * item.speed;
    item.X -= vX;
    item.Y -= vY;
  })
}

const drawApples = (apples) => {
  apples.forEach(item => {
    ctx.beginPath();
    ctx.lineWidth = item.radius * 2;
    ctx.strokeStyle = item.color;
    ctx.arc(item.X, item.Y, item.radius, 0, Math.PI * 2, true);
    ctx.stroke();

    // if (this.X < 0) this.X = canvas.width;
    // if (this.Y < 0) this.Y = canvas.height;

    // if (this.X > canvas.width) this.X = 0;
    // if (this.Y > canvas.height) this.Y = 0;

    // this.X += this.dx;
    // this.Y += this.dy;
  })
}

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
}


const mySnake = [];
const questsSnakes = new Map();

// init mySnake
const initMySnake = () => {
  mySnake.push(new SnakePoint())
  mySnake[0].target = cursor;

  for (let i = 1; i < 8; i++) {
    const newSnakePoint = new SnakePoint();
    newSnakePoint.radius = mySnake[i - 1].radius * 0.9;
    newSnakePoint.target = mySnake[i - 1];
    mySnake.push(newSnakePoint)
  }
}
initMySnake();

const initQuestsSnake = (id, count) => {
  let newSnake = [];

  newSnake.push(new SnakePoint())
  newSnake[0].target = { X: 0, Y: 0 };

  for (let i = 1; i < count; i++) {
    const newSnakePoint = new SnakePoint();
    newSnakePoint.radius = newSnake[i - 1].radius * 0.9;
    newSnakePoint.target = newSnake[i - 1];
    newSnake.push(newSnakePoint)
  }
  questsSnakes.set(id, newSnake)
}
initQuestsSnake('444', 8);


// give mySnake and receive quests snakes
setInterval(() => {
  if (socket.connected) {
    console.log(`socket: ${socket.id} emit`);
    socket.emit('snake', { id: socket.id, target: mySnake[0].target, count: mySnake.length })
  }
}, 100)

// animate
requestAnimationFrame(function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw cursor
  cursor.draw();
  // draw mySnake
  drawSnake(mySnake)
  // draw quests snakes
  // drawSnake(ba)
  // draw apples
  // drawApples(apples)
  requestAnimationFrame(draw);
})

// update mySnake target
canvas.addEventListener('mousemove', (event) => {
  cursor.X = event.clientX;
  cursor.Y = event.clientY;
})


// // calculate collision
// apples.forEach(item => {
//   if (getDistanse(this, item) < (this.radius + item.radius)) {
//     // if collision with snake body create 4 apple
//     if (indexFromArray) {
//       for (let i = 0; i < 4; i++) {
//         const newApple = new Apple();
//         newApple.X = this.X;
//         newApple.Y = this.Y;
//         apples.push(newApple)
//       }
//       mySnake.splice(indexFromArray, mySnake.length - indexFromArray)
//       // if collision with head add new snakePoint to tail
//     } else {
//       const newSnakePoint = new SnakePoint();

//       newSnakePoint.X = mySnake[mySnake.length - 1].X;
//       newSnakePoint.Y = mySnake[mySnake.length - 1].Y;
//       newSnakePoint.target = mySnake[mySnake.length - 1];

//       mySnake.push(newSnakePoint)
//       apples.splice(apples.indexOf(item), 1)

//       // calculate snake's radius
//       mySnake.reverse();
//       mySnake.forEach((item, index) => {
//         item.radius = ((maxSnakeRadius - minSnakeRadius) / mySnake.length) * (index + 1)
//       })
//       mySnake.reverse();
//     }
//   }
// })

//   }
// }

