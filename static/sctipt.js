// set canvas
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

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
const updateSnakesInterval = 60;

// all snakes collection key: id value: snake array
const snakes = new Map();
// data from server collection key: id value: {target, count}
const questsSnakes = new Map();

let myId = '';
let isGame = false;

const getRndInt = (min, max) => Math.floor(Math.random() * (max - min) + min);


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
  color: 'white',

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 0;
    ctx.strokeStyle = this.color;
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
    this.color = 'red';
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

const createSnake = (id, count, color) => {
  let newSnake = [];
  newSnake.push(new SnakePoint())
  newSnake[0].target = { X: 0, Y: 0 };
  newSnake[0].color = color;

  for (let i = 1; i < count; i++) {
    const newSnakePoint = new SnakePoint();
    newSnakePoint.radius = newSnake[i - 1].radius * 0.9;
    newSnakePoint.target = newSnake[i - 1];
    newSnakePoint.color = color;
    newSnake.push(newSnakePoint);
  }

  if (id === myId) newSnake[0].target = cursor;
  snakes.set(id, newSnake)
}

// give my snake
setInterval(() => {
  if (socket.connected && snakes.get(myId)) {
    let mySnake = snakes.get(myId);
    socket.emit('snake', { target: { X: cursor.X, Y: cursor.Y }, count: mySnake.length, color: mySnake[0].color })
  }
}, giveMySnakeInterval)

// receive quests snakes
socket.on('allSnakes', (snakes) => {
  questsSnakes.clear();
  Object.entries(snakes)
    .forEach(item => questsSnakes.set(item[0], item[1]))
})

// update snakes targets and snakes count
setInterval(() => {

  for (const key of questsSnakes.keys()) {
    if (snakes.has(key)) {
      let questSnake = snakes.get(key);
      questSnake[0].target = questsSnakes.get(key).target;
    } else {
      createSnake(key, questsSnakes.get(key).count, questsSnakes.get(key).color)
    }
  }

  for (const key of snakes.keys()) {
    if (!questsSnakes.has(key)) {
      snakes.delete(key)
    }
  }
}, updateSnakesInterval)

// update mySnake target
canvas.addEventListener('mousemove', (event) => {
  cursor.X = event.clientX;
  cursor.Y = event.clientY;
})

const initGame = () => {
  let timerId = setTimeout(function tick() {
    if (socket.connected) {
      myId = (socket.id).toString();

      console.log(`user ${myId} connected!`);
      isGame = true;
      let cR = getRndInt(1, 256);
      let cG = getRndInt(1, 256);
      let cB = getRndInt(1, 256);
      let myColor = `rgba(${cR}, ${cG}, ${cB}, 0.9)`;
      cursor.color = myColor;
      createSnake(myId, startSnakeCount, myColor);
      clearTimeout(timerId)
    } else {
      timerId = setTimeout(tick, 500);
      console.log(`no connected...`);
    }
  }, 500);

}
initGame();

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
  // console.log(getRndInt(1, 256));

  // console.log(`--------------------------------------------`);
}, 2000)

