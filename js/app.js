//Defining canvas's context on Global

const canvas = document.getElementById('main');
const ctx = canvas.getContext('2d');

//Setting canvas size

const viewWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const viewHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const maxSize = Math.min(viewWidth, viewHeight);
const minSize = 101;
let size = minSize;
while(size + minSize <= maxSize){
  size += minSize;
}
canvas.width = canvas.height = size;

//Setting directions

const directions = {'N': [0, 1], 'S': [0, -1], 'W': [-1, 0], 'E': [1, 0]};
const opposite = {'N': 'S', 'S': 'N', 'W': 'E', 'E': 'W'};
const side = {'free': 0, 'wall': 1, 'stairs': 2};

//Setting individual cells of the map

function Cell() {
  this.sides = { };
  for (let direction in directions){
    this.sides[direction] = side['wall'];
  }
}

//Setting the maze

function Maze(rows, columns){
  this.board = [];
  for (let i = 0; i < rows; ++i) {
    this.board.push([]);
    for (let j = 0; j < columns; ++j) {
      this.board[i].push(new Cell());
    }
  }

  let maze = this;

  (function generate(x = 0, y = 0) {
    maze.board[x][y].visited = true;
    let directionKeys = [];
    for (let key in directions) directionKeys.push(key);
    shuffleArray(directionKeys);
    for (let key of directionKeys) {
      let dx = directions[key][0];
      let dy = directions[key][1];
      if (isValidPosition(x + dx, y + dy, maze.board) === false ||
        maze.board[x + dx][y + dy].visited === true)
      {
        continue;
      }
      maze.board[x][y].sides[key] = side['free'];
      maze.board[x + dx][y + dy].sides[opposite[key]] = side['free'];
      generate(x + dx, y + dy);
    }
  })();

  function mapCoord(coord) {
    return 2*coord + 1;
  }

  this.toMap = function() {
    let map = [];
    let mapRows = mapCoord(rows);
    let mapcolumns = mapCoord(columns);

    for (let i = 0; i < mapRows; ++i) {
      map.push([]);
      for (let j = 0; j < mapcolumns; ++j) {
        map[i].push(side['wall']);
      }
    }

    for (let i = 0; i < rows; ++i) {
      for (let j = 0; j < columns; ++j) {
        map[mapCoord(i)][mapCoord(j)] = side['free'];
        for (let d in directions) {
          if (maze.board[i][j].sides[d] === side['wall']) continue;
          let dx = mapCoord(i) + directions[d][0];
          let dy = mapCoord(j) + directions[d][1];
          map[dx][dy] = side['free'];
        }
      }
    }
    map[mapRows - 2][mapcolumns - 1] = side['stairs'];
    return map;
  }
}

function drawMaze(map) {
  let size = Math.floor(canvas.width / map.length);
  for (let i = 0; i < map.length; ++i) {
    for (let j = 0; j < map[i].length; ++j) {
      switch (map[i][j]) {
        case side['wall']:
          ctx.fillStyle = 'black';
          break;
        case side['empty']:
          ctx.fillStyle = 'white';
          break;
        case side['stairs']:
          ctx.fillStyle = '#red';
          break;
      }
      ctx.fillRect(i*size, j*size, size, size);
    }
  }
}

//Shuffle 

function shuffle(array) {
  for (let i = array.length - 1; i > 0; --i) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function isValidPosition(x, y, plane) {
  return (x >= 0 && x < plane.length && y >= 0 && y < plane[x].length);
}

var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;

function keyDownHandler(event) {
  switch (event.keyCode) {
    case 39:
      rightPressed = true;
      break;
    case 37:
      leftPressed = true;
      break;
    case 40:
      downPressed = true;
      break;
    case 38:
      upPressed = true;
      break;
  }
}

function keyUpHandler() {
  switch (event.keyCode) {
    case 31:
      rightPressed = false;
      break;
    case 37:
      leftPressed = false;
      break;
    case 40:
      downPressed = false;
      break;
    case 38:
      upPressed = false;
      break;
  }
}

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function Player(map) {
  this.pos = {x: 1, y: 1};
  this.color = 'green';

  let size = Math.floor(canvas.width / map.length);

  this.draw = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x*size, this.pos.y*size, size, size);
  }

  this.clear = function() {
    ctx.clearRect(this.pos.x*size, this.pos.y*size, size, size);
  }

  this.move = function(dir) {
    let dx = this.pos.x + directions[dir][0];
    let dy = this.pos.y + directions[dir][1];
    if (isValidPosition(dx, dy, map) && map[dx][dy] !== side['wall']) {
      this.clear();
      this.pos.x = dx;
      this.pos.y = dy;
      this.draw();
    }
  }
}

const maze = new Maze(32, 32);  //Change map size
const map = maze.toMap();
const player = new Player(map);

//FPS = Frames per Second and FMT = Frame Minimum Time
const FPS = 10;
const FMT = (1000/60) * (60/FPS) - (1000/60) * 0.5;
var lastFrameTime = 0;

drawMaze(map);
player.draw();

function main(time) {
  if (time - lastFrameTime < FMT) {
    requestAnimationFrame(main);
    return;
  }

  if (rightPressed){
    player.move('E')
  } else if (leftPressed){
    player.move('W');
  } else if (upPressed){
    player.move('S');
  } else if (downPressed){
    player.move('N');
  }

  if (map[player.pos.x][player.pos.y] === side['exit']) {
    window.alert('You found the exit');
    return;
  }

  lastFrameTime = time;
  requestAnimationFrame(main);
}

requestAnimationFrame(main);