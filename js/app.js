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
      if (isValidPos(x + dx, y + dy, maze.board) === false ||
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

window.onload = () => {

};