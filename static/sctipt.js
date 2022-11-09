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
const sendInterval = 60;
const updateInterval = 60;

// all snakes collection key: id value: snake array
const snakes = new Map();
// data from server collection key: id value: {target, count, color}
const questsSnakes = new Map();
// all apples collection key: id value: apple
const apples = new Set();

let myId = '';
let isGame = false;

const getRndInt = (min, max) => Math.floor(Math.random() * (max - min) + min);

const getDistanse = (obj1, obj2) => {

  const dx = Math.abs(obj1.X - obj2.X);
  const dy = Math.abs(obj1.Y - obj2.Y);
  return Math.sqrt(dx * dx + dy * dy);
}

class SnakePoint {

  constructor() {
    this.X = -100;
    this.Y = -100;
    this.radius = 6;
    this.speed = 8;
    this.color = null;
    this.target = {};
  }
}

const createSnake = (id, count, color) => {
  const newSnake = [];
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

const drawSnake = (snake) => {

  snake.forEach((item, index) => {
    // draw this
    ctx.beginPath();
    ctx.lineWidth = item.radius * 2;
    ctx.strokeStyle = item.color;
    ctx.arc(item.X, item.Y, item.radius, 0, Math.PI * 2, true);
    ctx.stroke();
    // calculate collision with target
    if (getDistanse(item, item.target) < item.radius * 4)
      return;
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
  
  // calculate collision
  if (!apples.size) return;

  for (const apple of apples) {
    if (getDistanse(snake[0], apple) < (snake[0].radius + apple.radius) * 2) {
      apples.delete(apple);
      socket.emit('consume_apple', apple.id)
      snake.push(new SnakePoint())
    }
  }
}

class Apple {

  constructor(id) {
    this.id = id;
    this.X = -100;
    this.Y = -100;
    this.radius = 5;
    this.color = `green`;
  }
}

const drawApple = (apple) => {
  ctx.beginPath();
  ctx.lineWidth = apple.radius * 2;
  ctx.strokeStyle = apple.color;
  ctx.arc(apple.X, apple.Y, apple.radius, 0, Math.PI * 2, true);
  ctx.stroke();
}

// send snake
setInterval(() => {
  let mySnake = snakes.get(myId);
  if (socket.connected && mySnake) {
    socket.emit('snake', { target: { X: cursor.X, Y: cursor.Y }, count: mySnake.length, color: mySnake[0].color })
  }
}, sendInterval)

// receive quests snakes
socket.on('allSnakes', (snakes) => {
  questsSnakes.clear();
  Object.entries(snakes)
    .forEach(item => questsSnakes.set(item[0], item[1]))
})

// receive apples
socket.on('apples', (receiveApples) => {
  console.log(receiveApples);
  apples.clear();
  receiveApples.forEach(apple => {
    apples.add(apple)
  })
})

// init game
const timerId = setTimeout(function tick() {

  if (socket.connected) {
    isGame = true;

    myId = (socket.id).toString();

    colorR = getRndInt(1, 255);
    colorG = getRndInt(1, 255);
    colorB = getRndInt(1, 255);

    let myColor = `rgba(${colorR},${colorG},${colorB},1)`;

    createSnake(myId, startSnakeCount, myColor);

    cursor.color = myColor;

    console.log(`user ${myId} connected!`);
    clearTimeout(timerId)
  } else {
    timerId = setTimeout(tick, 500);
    console.log(`no connected...`);
  }

}, 500);

// update snakes targets and snakes count
setInterval(() => {
  if (!isGame) return;

  // update qSnake target or create new snake
  for (const key of questsSnakes.keys()) {
    if (snakes.has(key)) {
      let questSnake = snakes.get(key);
      questSnake[0].target = questsSnakes.get(key).target;
    } else {
      createSnake(key, questsSnakes.get(key).count, questsSnakes.get(key).color)
    }
  }
  // delete death qSnake
  for (const key of snakes.keys()) {
    if (!questsSnakes.has(key)) {
      snakes.delete(key);
    }
  }
}, updateInterval)

// animate
requestAnimationFrame(function draw() {
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (isGame) {
    // draw cursor
    cursor.draw();
    // draw apples
    for (const apple of apples.values()) {
      drawApple(apple)
    }
    // draw snakes
    for (const snake of snakes.values()) {
      drawSnake(snake);
    }
  }
  requestAnimationFrame(draw);
})

// cursor
const cursor = {

  X: 0,
  Y: 0,
  color: 'white',

  draw() {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;
    ctx.arc(this.X, this.Y, 2, 0, Math.PI * 2, true);
    ctx.stroke();
  }
}

// update cursor position
canvas.addEventListener('mousemove', (event) => {
  cursor.X = event.clientX;
  cursor.Y = event.clientY;
})

// log for dev
setInterval(() => {
  console.log(`--------------------------------------------`);

  console.log(`--------------------------------------------`);
}, 3000)

