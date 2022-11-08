// set canvas
const canvas = document.getElementById('canvas');
canvas.width = window.screen.availWidth * 1.25;
canvas.height = window.screen.availHeight * 1.127;
const ctx = canvas.getContext('2d');

// set socet
// const localHost = "ws://134.0.117.85:5555";     //for prod
const localHost = "ws://localhost:5555/";
const socket = io(localHost);

// snake constants
const minSnakeSpeed = 4;
const maxSnakeSpeed = 42;
const maxSnakeRadius = 8;
const minSnakeRadius = 1;
const startSnakeCount = 8;
const giveMySnakeInterval = 60;

// all snakes collection key: id value: snake array
const snakes = new Map();
// data from server collection key: id value: {target, count}
const questsSnakes = new Map();

let myId = '';
let isGame = false;

// support
const getRndInt = (min, max) => {

  Math.floor(Math.random() * (max - min) + min);
}

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
    // calculate collision with target
    if (getDistanse(item, item.target) < item.radius * 4) return;
    // calculate speed
    if (index === 0) {
      item.speed = getDistanse(item, item.target) / 42;
    } else {
      item.speed = item.target.speed * 0.92;
      if (item.speed < minSnakeSpeed) item.speed = minSnakeSpeed;
      if (item.speed > maxSnakeSpeed) item.speed = maxSnakeSpeed;
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

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'SlateBlue';
    ctx.arc(this.X, this.Y, 2, 0, Math.PI * 2, true);
    ctx.stroke();
  }
}

class SnakePoint {

  constructor() {
    this.X = 0;
    this.Y = 0;
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

const createSnake = (id, count) => {
  let newSnake = [];
  newSnake.push(new SnakePoint())
  newSnake[0].target = { X: 0, Y: 0 };

  if (id === myId) newSnake[0].target = cursor;

  for (let i = 1; i < count; i++) {
    const newSnakePoint = new SnakePoint();
    newSnakePoint.radius = newSnake[i - 1].radius * 0.9;
    newSnakePoint.target = newSnake[i - 1];
    newSnake.push(newSnakePoint);
  }
  snakes.set(id, newSnake)
}

// give my snake
setInterval(() => {
  if (socket.connected && snakes.get(myId)) {
    socket.emit('snake', { target: { X: cursor.X, Y: cursor.Y }, count: snakes.get(myId).length })
  }
}, giveMySnakeInterval)

// receive quests snakes
socket.on('allSnakes', (snakes) => {
  questsSnakes.clear();
  Object.entries(snakes)
    .forEach(item => questsSnakes.set(item[0], item[1]))
})

const initGame = () => {
  let timerId = setTimeout(function tick() {
    if (socket.connected) {
      myId = (socket.id).toString();

      console.log(`user ${myId} connected!`);
      isGame = true;
      createSnake(myId, startSnakeCount);
      clearTimeout(timerId)
    } else {
      timerId = setTimeout(tick, 500);
      console.log(`no connected...`);
    }
  }, 500);

}
initGame();

// update snakes targets and col
setInterval(() => {

  for (const key of questsSnakes.keys()) {
    if (snakes.has(key)) {
      let questSnake = snakes.get(key);
      questSnake[0].target = questsSnakes.get(key).target;
    } else {
      createSnake(key, questsSnakes.get(key).count)
    }
  }

  for (const key of snakes.keys()) {
    if (!questsSnakes.has(key)) {
      snakes.delete(key)
    }
  }
}, 60)

// update mySnake target
canvas.addEventListener('mousemove', (event) => {
  cursor.X = event.clientX;
  cursor.Y = event.clientY;
})

// animate
requestAnimationFrame(function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (isGame) {
    // draw cursor
    cursor.draw();
    // draw snakes

    for (const snake of snakes.values()) {
      drawSnake(snake);
    }
    // draw apples
    // drawApples(apples)
  }
  requestAnimationFrame(draw);
})

// log for dev
setInterval(() => {
  // console.log(`--------------------------------------------`);
  // console.log(snakes.get(myId));

  // console.log(`--------------------------------------------`);
}, 2000)


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