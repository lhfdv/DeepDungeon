//Opening audio setup and call function

const audioOpener = new Audio('audio/opener.wav');
audioOpener.play();

// Canvas context setup

const canvas = document.getElementById('app');
const ctx = canvas.getContext('2d');

// Canvas size setup

const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const maxSize = Math.min(viewportWidth, viewportHeight);
const minSize = 200;

let size = minSize;

while (size + minSize <= maxSize){
  size += minSize;
  canvas.width = canvas.height = size;
}

// Directions for walls and path

const directions = {'N': [0, 1], 'S': [0, -1], 'W': [-1, 0], 'E': [1, 0]};
const opposite = {'N': 'S', 'S': 'N', 'W': 'E', 'E': 'W'};
const side = {'path': 0, 'wall': 1, 'stairs': 2};

// Cell definition

function Cell(){
  this.visitedCell = false;
  this.sides = {};
  for (let direction in directions){
    this.sides[direction] = side['wall'];
  }
}

// Draw maze

function Maze(rows, columns){
  this.board = [];
  for (let i = 0; i < rows; ++i){
    this.board.push([]);
    for (let j = 0; j < columns; ++j){
      this.board[i].push(new Cell());
    }
  }

  let maze = this;

  (function generate(x = 0, y = 0){
    maze.board[x][y].visitedCell = true;
    let directionKeys = [];
    for (let key in directions){
      directionKeys.push(key);
    }
    shuffleArray(directionKeys);
    for (let key of directionKeys){
      let dx = directions[key][0];
      let dy = directions[key][1];
      if (isValidPosition(x + dx, y + dy, maze.board) === false || maze.board[x + dx][y + dy].visitedCell === true){
        continue;
      }
      maze.board[x][y].sides[key] = side['path'];
      maze.board[x + dx][y + dy].sides[opposite[key]] = side['path'];
      generate(x + dx, y + dy);
    }
  })();

  function mapCoord(coord){
    return 2*coord + 1;
  }

  this.toMap = function(){
    let mazemap = [];
    let mazemapRows = mapCoord(rows);
    let mazemapcolumns = mapCoord(columns);

    for (let i = 0; i < mazemapRows; ++i) {
      mazemap.push([]);
      for (let j = 0; j < mazemapcolumns; ++j) {
        mazemap[i].push(side['wall']);
      }
    }

    for (let i = 0; i < rows; ++i) {
      for (let j = 0; j < columns; ++j) {
        mazemap[mapCoord(i)][mapCoord(j)] = side['path'];
        for (let d in directions){
          if (maze.board[i][j].sides[d] === side['wall']){
            continue;
          }
          let dx = mapCoord(i) + directions[d][0];
          let dy = mapCoord(j) + directions[d][1];
          mazemap[dx][dy] = side['path'];
        }
      }
    }
    mazemap[mazemapRows - 2][mazemapcolumns - 1] = side['stairs']; //Exit location
    return mazemap;
  }
}

function drawMaze(mazemap){
  let size = Math.floor(canvas.width / mazemap.length); //Size
  for (let i = 0; i < mazemap.length; ++i){
    for (let j = 0; j < mazemap[i].length; ++j){
      switch (mazemap[i][j]){
        case side['wall']:
          ctx.fillStyle = 'grey';
          break;
        case side['path']:
          ctx.fillStyle = 'white';
          break;
        case side['stairs']:
          ctx.fillStyle = 'red';
          break;
      }
      ctx.fillRect(i*size, j*size, size, size); //Walls
    }
  }
}

//Random generation

function shuffleArray(array){
  for (let i = array.length - 1; i > 0; --i) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

//Check valid position for generation

function isValidPosition(x, y, plane){
  return (x >= 0 && x < plane.length && y >= 0 && y < plane[x].length);
}

//Player movement

let rightPressed = false;
let leftPressed = false;
let upPressed = false;
let downPressed = false;

function keyDownHandler(event){
  switch (event.keyCode){
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

function keyUpHandler(){
  switch (event.keyCode){
    case 39:
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

//Player drawing

function Player(mazemap){
  this.pos = {x: 1, y: 1}; //Player initial position
  this.color = 'green';
  const audioStep = new Audio('audio/step.wav'); //Step sound setup

  let size = Math.floor(canvas.width / mazemap.length);

  this.draw = function(){
    ctx.fillStyle = this.color;
    ctx.fillRect(this.pos.x*size, this.pos.y*size, size, size);
  }

  //Clear and define walked path

  this.clear = function(){
    ctx.fillStyle = 'white';
    ctx.fillRect(this.pos.x*size, this.pos.y*size, size, size);
  }

  this.move = function(direction){
    let dx = this.pos.x + directions[direction][0];
    let dy = this.pos.y + directions[direction][1];
    if (isValidPosition(dx, dy, mazemap) && mazemap[dx][dy] !== side['wall']) {
      this.clear();
      this.pos.x = dx;
      this.pos.y = dy;
      this.draw();
      audioStep.play();
    }
  }
}

const maze = new Maze(8, 8); // Change size
const mazemap = maze.toMap();
const player = new Player(mazemap);

//FPS = Frames per Second and FMT = Frame Minimum Time
//Setting FPS for the game
const FPS = 7;
const FMT = (1000/60) * (60 / FPS) - (1000/60) * 0.5;
let lastFrameTime = 0;

drawMaze(mazemap);

player.draw(); //Start the game with the player

//Main function

function app(time){
  if (time - lastFrameTime < FMT) {
    requestAnimationFrame(app);
    return;
  }

  if (rightPressed){
    player.move('E');
  } else if(leftPressed){
    player.move('W');
  } else if(upPressed){
    player.move('S');
  } else if(downPressed){
    player.move('N');
  } 

  //Winning condition and event

  if(mazemap[player.pos.x][player.pos.y] === side['stairs']) {
    const audioWin = new Audio('audio/win.wav');
    audioWin.play();
    document.getElementById('win').style.display = 'block';
    document.getElementById('win').innerHTML = 'You WIN!';
    return;
  }

  lastFrameTime = time;

  requestAnimationFrame(app);
}

requestAnimationFrame(app);

//Dark Mode

function darkMode(){
  let element = document.body;
  element.classList.toggle("dark-mode");
}

//Reload page

document.addEventListener('keyup', function(e){
  if(e.keyCode == 82)
    window.location.reload();
});

//Activate Dark Mode

document.addEventListener('keyup', function(e){
  if(e.keyCode == 46)
    darkMode();
});


