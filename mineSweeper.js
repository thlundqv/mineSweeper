//mineSweeper
//by Linus Backlund
//feb 2019

var c, ctx, x, y, matrix, clickedMatrix, flagMatrix, xSize, ySize, bombs, run, bombCharacter, flagColor, tileSize, won, lost;
c = document.getElementById('myCanvas');
ctx = c.getContext('2d');
run = true;
xSize = 10;
ySize = 10;
bombs = 15;
tileSize = 50;
bombCharacter = '#';


c.width = xSize*tileSize;
c.height = ySize*tileSize;
window.addEventListener('load', reset);
document.getElementById('myButton').addEventListener('click', reset);
c.addEventListener('contextmenu', flag, false);  // listen to right-clicks
c.addEventListener('click', newClick);  // listen to clicks


function flag(e) {  // toggle flag at right-clicked tile
  e.preventDefault();
  var X = Math.floor((e.clientX-c.offsetLeft)/tileSize);  // determine tile
  var Y = Math.floor((e.clientY-c.offsetTop)/tileSize);  // determine tile
  if (!clickedMatrix[X][Y] || flagMatrix[X][Y]) {  // check tile is not clicked or already flagged
    flagMatrix[X][Y] = !flagMatrix[X][Y];
    renderBoard()
  }
}


function newClick(e) {  // handle tile clicked
  if (run) {  // check if game i srunning
    var X = Math.floor((e.clientX-c.offsetLeft)/tileSize);  // determine tile
    var Y = Math.floor((e.clientY-c.offsetTop)/tileSize);  // determine tile
    if (!flagMatrix[X][Y]) {  // continue if tile is not flagged
      if (!clickedMatrix[X][Y]) {  // continue if tile is not clicked
        if (!matrix[X][Y]) {  // if empty tile, discover all connected
          clickedMatrix[X][Y] = 1;
          searchEmpty(X, Y)
        }
        if (matrix[X][Y] == -1) {  // check for and handle loss
          run = false;
          lost = true;
          clickedColor = lossColor;
          revealAll()
        }
        clickedMatrix[X][Y] = 1;
        if (checkWin()) {  // check for and handle win
          run = false;
          won = true;
          clickedColor = winColor;
          revealAll()
        }
        renderBoard()
      }
    }
  }
}


function renderBoard() {  // display board
  clearCanvas()
  drawClicked()
  drawGrid()
  drawSquares()
}


function revealAll() {  // click and unflag all tiles
  for(var i = 0; i < xSize; i++) {
    for(var j = 0; j < ySize; j++) {
      clickedMatrix[i][j] = 1;
    }
  }
  for(var i = 0; i < xSize; i++) {
    for(var j = 0; j < ySize; j++) {
      flagMatrix[i][j] = 0;
    }
  }
}


function searchEmpty(X, Y) {
  var xWalk, yWalk, xStep, yStep;
  xWalk = X;
  yWalk = Y;
  xStep = [1, -1, -1, 0, 0, 1, 1, 0];
  yStep = [1, 0, 0, -1, -1, 0, 0, 1];
  for (var i = 0; i < 8; i++) {  // steps in loop anti-clockwise around tile
    xWalk += xStep[i];
    yWalk += yStep[i];
    if (xWalk >= 0 && yWalk >= 0 && xWalk < xSize && yWalk < ySize) {  // check boundaries
      if (!matrix[xWalk][yWalk] && !clickedMatrix[xWalk][yWalk]) {  // if another empty, new searchEmpty()
        clickedMatrix[xWalk][yWalk] = 1;
        searchEmpty(xWalk, yWalk)
      } else {clickedMatrix[xWalk][yWalk] = 1;}
    }
  }
}


function drawClicked() {  // display all clicked and flagged tiles
  for(var i = 0; i < xSize; i++) {
    for(var j = 0; j < ySize; j++) {
      if (flagMatrix[i][j]) {
        rectangle(i*tileSize, j*tileSize, tileSize, tileSize, flagColor)
      }
      else if (clickedMatrix[i][j]) {
        rectangle(i*tileSize, j*tileSize, tileSize, tileSize, clickedColor)
      }
    }
  }
}


function checkWin() {  // check if only bombs left AKA player won
  var count = 0;
  for(var i = 0; i < xSize; i++) {
    for(var j = 0; j < ySize; j++) {
      if (clickedMatrix[i][j]) {  // count all clicked tiles
        count++;
      }
    }
  }
  if (count == xSize*ySize-bombs) {  // check if clicked equals all minus number of bombs
    return true;
  }
  return false;
}


function reset() {  // reset all and start new game
  winColor = 'lightgreen';
  lossColor = 'red';
  flagColor = 'lightblue';
  canvasColor = 'lightgrey';
  clickedColor = 'white';
  textColor='black';
  gridColor='black';
  run = true;
  won = false;
  lost = false;
  matrix = resetMatrix()
  clickedMatrix = resetMatrix()
  flagMatrix = resetMatrix()
  generateBombs()
  generateNumbers()
  renderBoard()
}


function drawSquares() { // display all numbers
  for(var i = 0; i < xSize; i++) {
    for(var j = 0; j < ySize; j++) {
      if (matrix[i][j] > 0 && clickedMatrix[i][j]) {
        writeText(String(matrix[i][j]), i*tileSize+tileSize*0.3, j*tileSize+tileSize*0.75);
      }
      if (matrix[i][j] == -1 && clickedMatrix[i][j]) {
        writeText(bombCharacter, i*tileSize+tileSize*0.3, j*tileSize+tileSize*0.75);
      }
    }
  }
}


function resetMatrix() {  // returns matrix of zeros
  var emptyMatrix;
  emptyMatrix = [];
  for(var i = 0; i < xSize; i++) {
    emptyMatrix[i] = [];
    for(var j = 0; j < ySize; j++) {
      emptyMatrix[i][j] = 0;
    }
  }
  return emptyMatrix;
}


function generateBombs() {  // generate randomly placed bombs in matrix
  for(var i = 0; i < bombs; i++) {
    do {
      var xRandom = Math.floor(Math.random() * xSize);  // random number for X-tile
      var yRandom = Math.floor(Math.random() * ySize);  // random number for Y-tile
    } while (matrix[xRandom][yRandom])
    matrix[xRandom][yRandom] = -1;
  }
}


function generateNumbers() {
  var number, xWalk, yWalk, xSteps, ySteps;
  xSteps = [1, -1, -1, 0, 0, 1, 1, 0];
  ySteps = [1, 0, 0, -1, -1, 0, 0, 1];
  for(var i = 0; i < xSize; i++) {  // go though all tiles
    for(var j = 0; j < ySize; j++) {
      if (!matrix[i][j]) {  // if not a bomb
        number = 0;
        xWalk = i;
        yWalk = j;
        for(var m = 0; m < 8; m++) {  // walk an anti-clockwise loop around tile
          xWalk += xSteps[m];
          yWalk += ySteps[m];
          if (xWalk >= 0 && yWalk >= 0 && xWalk < xSize && yWalk < ySize) {  // check boundaries
            if (matrix[xWalk][yWalk] == -1) {  // count every bomb
              number++;
            }
          }
        }
        matrix[i][j] = number;  // set the number of the tile
      }
    }
  }
}


function clearCanvas() {  // clear entire canvas
  ctx.fillStyle = canvasColor;
  ctx.fillRect(0, 0, tileSize*xSize, tileSize*ySize)
}


function rectangle(X, Y, width, height, color) {  // display filled rectangle
  ctx.fillStyle=color;
  ctx.fillRect(X, Y, width, height);
}


function writeText(toWrite, X, Y,) {  // display character
  ctx.fillStyle = textColor;
  ctx.font = String(tileSize-10) + 'px Arial';
  ctx.fillText(toWrite, X, Y);
}


function drawGrid() {  // draw grid between tiles
  ctx.strokeStyle = gridColor;
  for(var i = 1; i < xSize; i++) {
    ctx.moveTo(i*tileSize, 0);
    ctx.lineTo(i*tileSize, tileSize*ySize);
    ctx.stroke();
  }
  for(var i = 1; i < ySize; i++) {
    ctx.moveTo(0, i*tileSize);
    ctx.lineTo(tileSize*xSize, i*tileSize);
    ctx.stroke();
  }
}
