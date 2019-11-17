//mineSweeper
//by Linus Backlund
//feb 2019

var c, ctx, x, y, matrix, clickedMatrix, flagMatrix, xSize, ySize, bombs, run, bombCharacter, flagColor, tileSize, won, lost;
//Sprites:
//This is an example of how to load an image. In the HTML file you need an img tag with id source: const bombSprite = document.getElementById('source');
c = document.getElementById('myCanvas');
ctx = c.getContext('2d');
run = true;
xSize = 10;
ySize = 10;
bombs = 15;
tileSize = 50;
bombCharacter = '#';


c.width = xSize * tileSize;
c.height = ySize * tileSize;
window.addEventListener('load', reset);
document.getElementById('myButton').addEventListener('click', reset);
c.addEventListener('contextmenu', flag, false); // listen to right-clicks
c.addEventListener('click', newClick); // listen to clicks


function flag(e) { // toggle flag at right-clicked tile
    e.preventDefault();
    var X = Math.floor((e.clientX - c.offsetLeft) / tileSize); // determine tile
    var Y = Math.floor((e.clientY - c.offsetTop) / tileSize); // determine tile
    if (!clickedMatrix[X + Y * xSize] || flagMatrix[X + Y * xSize]) { // check tile is not clicked or already flagged
        flagMatrix[X + Y * xSize] = !flagMatrix[X + Y * xSize];
        renderBoard()
    }
}


function newClick(e) { // handle tile clicked
    var X = Math.floor((e.clientX - c.offsetLeft) / tileSize); // determine tile
    var Y = Math.floor((e.clientY - c.offsetTop) / tileSize); // determine tile
    if (clickedMatrix.reduce((acc, val) => acc + val) === 0) {
        console.log("New Game Started!");
        createNewGame(X, Y);
    }
    if (run) { // check if game i srunning
        if (!flagMatrix[X + Y * xSize]) { // continue if tile is not flagged
            if (!clickedMatrix[X + Y * xSize]) { // continue if tile is not clicked
                if (!matrix[X + Y * xSize]) { // if empty tile, discover all connected
                    clickedMatrix[X + Y * xSize] = 1;
                    searchEmpty(X, Y)
                }
                if (matrix[X + Y * xSize] == -1) { // check for and handle loss
                    run = false;
                    lost = true;
                    clickedColor = lossColor;
                    revealAll()
                }
                clickedMatrix[X + Y * xSize] = 1;
                if (checkWin()) { // check for and handle win
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


function renderBoard() { // display board
    clearCanvas()
    drawClicked()
    drawGrid()
    drawSquares()
}


function revealAll() { // click and unflag all tiles
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            clickedMatrix[i + j * xSize] = 1;
        }
    }
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            flagMatrix[i + j * xSize] = 0;
        }
    }
}


function searchEmpty(X, Y) {
    var xWalk, yWalk, xStep, yStep;
    xWalk = X;
    yWalk = Y;
    xStep = [1, -1, -1, 0, 0, 1, 1, 0];
    yStep = [1, 0, 0, -1, -1, 0, 0, 1];
    for (var i = 0; i < 8; i++) { // steps in loop anti-clockwise around tile
        xWalk += xStep[i];
        yWalk += yStep[i];
        if (xWalk >= 0 && yWalk >= 0 && xWalk < xSize && yWalk < ySize) { // check boundaries
            if (!matrix[xWalk + yWalk * xSize] && !clickedMatrix[xWalk + yWalk * xSize]) { // if another empty, new searchEmpty()
                clickedMatrix[xWalk + yWalk * xSize] = 1;
                searchEmpty(xWalk, yWalk)
            } else {
                clickedMatrix[xWalk + yWalk * xSize] = 1;
            }
        }
    }
}


function drawClicked() { // display all clicked and flagged tiles
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            if (flagMatrix[i + j * xSize]) {
                rectangle(i * tileSize, j * tileSize, tileSize, tileSize, flagColor)
            } else if (clickedMatrix[i + j * xSize]) {
                rectangle(i * tileSize, j * tileSize, tileSize, tileSize, clickedColor)
            }
        }
    }
}


function checkWin() { // check if only bombs left AKA player won
    var count = 0;
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            if (clickedMatrix[i + j * xSize]) { // count all clicked tiles
                count++;
            }
        }
    }
    if (count == xSize * ySize - bombs) { // check if clicked equals all minus number of bombs
        return true;
    }
    return false;
}


function reset() { // reset all and start new game
    winColor = 'lightgreen';
    lossColor = 'red';
    flagColor = 'lightblue';
    canvasColor = 'lightgrey';
    clickedColor = 'white';
    textColor = 'black';
    gridColor = 'black';
    run = true;
    won = false;
    lost = false;
    matrix = resetMatrix()
    clickedMatrix = resetMatrix()
    flagMatrix = resetMatrix()
    renderBoard()
}

function createNewGame(x, y) {
    //Generates bombs and numbers
    generateBombs(x, y)
    generateNumbers()
}


function drawSquares() { // display all numbers
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            if (matrix[i + j * xSize] && clickedMatrix[i + j * xSize]) {
                writeText(String(matrix[i + j * xSize]), i * tileSize + tileSize * 0.3, j * tileSize + tileSize * 0.75);
            }
            if (matrix[i + j * xSize] == -1 && clickedMatrix[i + j * xSize]) {
                //writeText(bombCharacter, i * tileSize + tileSize * 0.3, j * tileSize + tileSize * 0.75);
                writeSprite(bombSprite, i * tileSize, j * tileSize);
            }
        }
    }
}


function resetMatrix() { // returns matrix of zeros
    var emptyMatrix;
    emptyMatrix = [];
    for (var i = 0; i < xSize; i++) {
        for (var j = 0; j < ySize; j++) {
            emptyMatrix[i + j * xSize] = 0;
        }
    }
    return emptyMatrix;
}


function generateBombs(x, y) { // generate randomly placed bombs in matrix, but not in a square around first click
    for (var i = 0; i < bombs; i++) {
        do {
            var xRandom = Math.floor(Math.random() * xSize); // random number for X-tile
            var yRandom = Math.floor(Math.random() * ySize); // random number for Y-tile
        } while (matrix[xRandom + yRandom * xSize] || checkEmptySquare(xRandom + yRandom * xSize, x + y * xSize))
        matrix[xRandom + yRandom * xSize] = -1;
    }
}

function checkEmptySquare(p, middle) {
    //Check if p belongs in a square set with middle as middle, while also ignoring edges
    if (middle - xSize - 1 >= 0) {
        if (p >= middle - xSize - 1 && p <= middle - xSize + 1) {
            return true;
        }
    }
    if (middle - 1 >= 0 && middle + 1 <= xSize * ySize) {
        if (p >= middle - 1 && p <= middle + 1) {
            return true;
        }
    }
    if (middle + xSize + 1 <= xSize * ySize) {
        if (p >= middle + xSize - 1 && p <= middle + xSize + 1) {
            return true;
        }
    }
    return false;
}


function generateNumbers() {
  //creates the numbers indicating nearby bombs
    var number, xWalk, yWalk, xSteps, ySteps;
    xSteps = [1, -1, -1, 0, 0, 1, 1, 0];
    ySteps = [1, 0, 0, -1, -1, 0, 0, 1];
    for (var i = 0; i < xSize; i++) { // go though all tiles
        for (var j = 0; j < ySize; j++) {
            if (!matrix[i + j * xSize]) { // if not a bomb
                number = 0;
                xWalk = i;
                yWalk = j;
                for (var m = 0; m < 8; m++) { // walk an anti-clockwise loop around tile
                    xWalk += xSteps[m];
                    yWalk += ySteps[m];
                    if (xWalk >= 0 && yWalk >= 0 && xWalk < xSize && yWalk < ySize) { // check boundaries
                        if (matrix[xWalk + yWalk * xSize] == -1) { // count every bomb
                            number++;
                        }
                    }
                }
                matrix[i + j * xSize] = number; // set the number of the tile
            }
        }
    }
}


function clearCanvas() { // clear entire canvas
    ctx.fillStyle = canvasColor;
    ctx.fillRect(0, 0, tileSize * xSize, tileSize * ySize)
}


function rectangle(X, Y, width, height, color) { // display filled rectangle
    ctx.fillStyle = color;
    ctx.fillRect(X, Y, width, height);
}


function writeText(toWrite, X, Y) { // display character
    ctx.fillStyle = textColor;
    ctx.font = String(tileSize - 10) + 'px Arial';
    ctx.fillText(toWrite, X, Y);
}

function writeSprite(sprite, X, Y) {
    //display a sprite with fixed width/height = tilesize
    ctx.drawImage(sprite, X, Y, tileSize, tileSize);
}


function drawGrid() { // draw grid between tiles
    ctx.strokeStyle = gridColor;
    for (var i = 1; i < xSize; i++) {
        ctx.moveTo(i * tileSize, 0);
        ctx.lineTo(i * tileSize, tileSize * ySize);
        ctx.stroke();
    }
    for (var i = 1; i < ySize; i++) {
        ctx.moveTo(0, i * tileSize);
        ctx.lineTo(tileSize * xSize, i * tileSize);
        ctx.stroke();
    }
}
