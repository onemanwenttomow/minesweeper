// uncovered
// covered
// flagged
// 0 = blank, 1 = mine...
// easy 9x9 10
// mid 16x16 40
// hard 30x16 99

var boardElem = document.getElementById("board");
var numberOfFlagsElem = document.getElementById("flags");
var gameState = document.getElementById("game-state");
var beginner = document.getElementById("beginner");
var intermediate = document.getElementById("intermediate");
var expert = document.getElementById("expert");
var gameSelection = document.querySelector(".game-selection");
var container = document.querySelector(".container");
var board,
    allCells,
    boardHtml,
    gameLost,
    firstClick,
    numberOfMines,
    numberOfFlags,
    rows,
    columns,
    mouseDown,
    currentElem;

beginner.addEventListener("click", function () {
    startGame(9, 9, 10);
});

intermediate.addEventListener("click", function () {
    startGame(16, 16, 40);
});

expert.addEventListener("click", function () {
    startGame(16, 30, 99);
});

function startGame(r, c, mines) {
    numberOfMines = mines;
    numberOfFlags = mines;
    rows = r;
    columns = c;
    board = generateBoard(rows, columns);
    board = addMinesToRandomSlots(board);
    board = addNeighbourNumbers(board);
    boardHtml = generateBoardHtml(board);
    console.log("board: ", board);
    boardElem.innerHTML = boardHtml;
    numberOfFlags = addZerosToNumber(numberOfFlags);
    numberOfFlagsElem.innerHTML = numberOfFlags;
    allCells = document.querySelectorAll("#board .row div");

    for (var p = 0; p < allCells.length; p++) {
        allCells[p].addEventListener("mouseenter", function (e) {
            if (!mouseDown || e.currentTarget.classList.contains("uncovered")) {
                return;
            }
            currentElem = e.target;
            e.currentTarget.classList.add("active");
        });

        allCells[p].addEventListener("mouseleave", function (e) {
            if (!mouseDown || e.currentTarget.classList.contains("uncovered")) {
                return;
            }
            e.currentTarget.classList.remove("active");
        });
    }

    gameLost = false;
    firstClick = true;
    gameState.innerText = "😊";
    gameSelection.classList.add("none");
    container.classList.remove("hidden");
}

gameState.addEventListener("click", restartGame);

boardElem.addEventListener("contextmenu", function (e) {
    e.target.classList.remove("active");
    e.preventDefault();
    if (gameLost) {
        return;
    }
    var colIndex = getColIndex(e.target);
    var rowIndex = getRowIndex(e.target);
    if (board[rowIndex][colIndex].state === "covered" && numberOfFlags > 0) {
        addFlagToBoard(e.target, colIndex, rowIndex);
    } else if (board[rowIndex][colIndex].state === "flagged") {
        removeFlagFromBoard(e.target, colIndex, rowIndex);
    }
    numberOfFlags = addZerosToNumber(numberOfFlags);
    numberOfFlagsElem.innerHTML = numberOfFlags;
    if (checkForVictory()) {
        console.log("victory!!!");
    }
});

function addFlagToBoard(elem, colIndex, rowIndex) {
    elem.classList.add("flagged");
    elem.innerText = "🏁";
    board[rowIndex][colIndex].state = "flagged";
    numberOfFlags--;
}

function removeFlagFromBoard(elem, colIndex, rowIndex) {
    elem.classList.remove("flagged");
    elem.innerText = "";
    board[rowIndex][colIndex].state = "covered";
    numberOfFlags++;
}

boardElem.addEventListener("mousedown", function (e) {
    currentElem = e.target;
    mouseDown = true;
    if (e.target.classList.contains("uncovered")) {
        return;
    }
    e.target.classList.add("active");
});

boardElem.addEventListener("mouseup", function (e) {
    mouseDown = false;
    rightClicking = false;
});

boardElem.addEventListener("click", function (e) {
    mouseDown = false;
    if (gameLost) {
        return;
    }
    var colIndex = getColIndex(currentElem);
    var rowIndex = getRowIndex(currentElem);
    if (board[rowIndex][colIndex].value) {
        handleMineClick(colIndex, rowIndex);
    } else {
        uncoverSpace(currentElem, rowIndex, colIndex);
    }
    firstClick = false;
    if (checkForVictory()) {
        console.log("victory!!!");
    }
    currentElem.classList.remove("active");
});

function handleMineClick(colIndex, rowIndex) {
    if (firstClick) {
        console.log('FIRST CLICK, SWAP MINE');
        swapMineWithBlank(colIndex, rowIndex);
        uncoverSpace(getCellByRowAndCol(rowIndex, colIndex), rowIndex, colIndex);
    } else {
        currentElem.classList.add("mine");
        currentElem.innerText = "💣";
        gameState.innerText = "😞";
        revealAllMines();
        gameLost = true;
    }
}

function revealAllMines() {
    var allCells = document.querySelectorAll("#board .row div");
    var mines = board.flat().filter(function (cell) {
        return cell.value;
    });
    mines.forEach(function (mine) {
        allCells[mine.index].classList.add("mine");
        allCells[mine.index].innerText = "💣";
    });
}

function restartGame() {
    numberOfFlags = numberOfMines;
    startGame(rows, columns, numberOfMines);
}

function addZerosToNumber(num) {
    if (num.toString().length < 3) {
        for (var i = 0; i <= 3 - num.toString().length; i++) {
            num = "0" + num;
        }
    }
    return num;
}

function checkForVictory() {
    var numberOfUncoveredSpaces = board.flat().filter(function (cell) {
        return cell.state === "uncovered" || cell.state === "flagged";
    });
    return numberOfUncoveredSpaces.length === rows * columns;
}

function getCellByRowAndCol(rowIndex, colIndex) {
    return document.getElementsByClassName("row")[rowIndex].children[colIndex];
}

function swapMineWithBlank(colIndex, rowIndex) {
    console.log("board[rowIndex][colIndex].value: ", board[rowIndex][colIndex].value);
    board[rowIndex][colIndex].value = 0;
    var randomRow, randomCol;
    var foundNewPlaceForMine = false;
    while (!foundNewPlaceForMine) {
        randomRow = Math.floor(Math.random() * rows);
        randomCol = Math.floor(Math.random() * columns);
        if (board[randomRow][randomCol].value === 0) {
            board[randomRow][randomCol].value = 1;
            foundNewPlaceForMine = true;
        }
    }
    board = addNeighbourNumbers(board);
    boardHtml = generateBoardHtml(board);
    boardElem.innerHTML = boardHtml;
}

function uncoverSpace(elem, rowIndex, colIndex) {
    if (elem.classList.contains("uncovered")) {
        return;
    }
    elem.classList.add("uncovered");
    board[rowIndex][colIndex].state = "uncovered";
    var numNeighbours = Number(board[rowIndex][colIndex].numberOfNeighbours);
    if (numNeighbours > 0) {
        elem.innerText = numNeighbours;
    } else {
        var cells = getAdjacentCells(rowIndex, colIndex);
        cells.forEach(function (cell) {
            var newElem = getCellByRowAndCol(cell.row, cell.col);
            if (cell.numberOfNeighbours) {
                newElem.classList.add("uncovered");
                cell.state = "uncovered";
                newElem.innerText = cell.numberOfNeighbours;
            } else {
                uncoverSpace(newElem, cell.row, cell.col);
            }
        });
    }
}

function addNeighbourNumbers(board) {
    board = board.map(function (row, rowIndex) {
        return row.map(function (cell, colIndex) {
            return {
                ...cell,
                numberOfNeighbours: getNearestNeighbours(rowIndex, colIndex)
            };
        });
    });
    return board;
}

function getAdjacentCells(rowIndex, colIndex) {
    var adjacentCells = [];
    var rowAbove = board[rowIndex - 1];
    if (rowAbove) {
        adjacentCells.push(rowAbove[colIndex]);
        rowAbove[colIndex + 1] && adjacentCells.push(rowAbove[colIndex + 1]);
        rowAbove[colIndex - 1] && adjacentCells.push(rowAbove[colIndex - 1]);
    }
    var rowBelow = board[rowIndex + 1];
    if (rowBelow) {
        adjacentCells.push(rowBelow[colIndex]);
        rowBelow[colIndex + 1] && adjacentCells.push(rowBelow[colIndex + 1]);
        rowBelow[colIndex - 1] && adjacentCells.push(rowBelow[colIndex - 1]);
    }
    board[rowIndex][colIndex + 1] && adjacentCells.push(board[rowIndex][colIndex + 1]);
    board[rowIndex][colIndex - 1] && adjacentCells.push(board[rowIndex][colIndex - 1]);
    adjacentCells = adjacentCells.filter(function (cell) {
        return cell.state === "covered";
    });
    return adjacentCells;
}

function getNearestNeighbours(rowIndex, colIndex) {
    var numberOfNeighbours = 0;
    var rowAbove = board[rowIndex - 1];
    if (rowAbove) {
        checkForMine(rowAbove, colIndex) && numberOfNeighbours++;
        checkForMine(rowAbove, colIndex + 1) && numberOfNeighbours++;
        checkForMine(rowAbove, colIndex - 1) && numberOfNeighbours++;
    }
    var rowBelow = board[rowIndex + 1];
    if (rowBelow) {
        checkForMine(rowBelow, colIndex) && numberOfNeighbours++;
        checkForMine(rowBelow, colIndex + 1) && numberOfNeighbours++;
        checkForMine(rowBelow, colIndex - 1) && numberOfNeighbours++;
    }
    checkForMine(board[rowIndex], colIndex + 1) && numberOfNeighbours++;
    checkForMine(board[rowIndex], colIndex - 1) && numberOfNeighbours++;
    return numberOfNeighbours;
}

function checkForMine(row, colIndex) {
    return row[colIndex] && row[colIndex].value;
}

function getColIndex(el) {
    var row = el.parentElement.children;
    var colIndex = [...row].indexOf(el);
    return colIndex;
}

function getRowIndex(el) {
    var col = el.parentElement.parentElement.children;
    var rowIndex = [...col].indexOf(el.parentElement);
    return rowIndex;
}

function generateBoardHtml(board) {
    var htmlString = "";
    for (var row, i = 0; i < board.length; i++) {
        row = board[i];
        htmlString += "<div class='row'>";
        for (var j = 0; j < row.length; j++) {
            htmlString += "<div></div>";
        }
        htmlString += "</div>";
    }
    return htmlString;
}

function addMinesToRandomSlots(board) {
    var randomIndexes = generateRandomIndexes();
    board = board.map(function (row) {
        return addMinesToMap(row, randomIndexes);
    });
    return board;
}

function addMinesToMap(row, randomIndexes) {
    return row.map(function (cell) {
        if (randomIndexes.indexOf(cell.index) > -1) {
            return {
                ...cell,
                value: 1
            };
        } else {
            return cell;
        }
    });
}

function generateRandomIndexes() {
    var arr = [];
    var maxNumber = rows * columns;
    while (arr.length < numberOfMines) {
        var r = Math.floor(Math.random() * maxNumber);
        if (arr.indexOf(r) === -1) {
            arr.push(r);
        }
    }
    return arr;
}

function generateBoard(rows, columns) {
    var board = [];
    var index = 0;
    for (var row, i = 0; i < rows; i++) {
        row = [];
        for (var j = 0; j < columns; j++) {
            // 0 no mine, 1 mine
            row.push({
                state: "covered",
                value: 0,
                numberOfNeighbours: 0,
                index: index,
                row: i,
                col: j
            });
            index++;
        }
        board.push(row);
    }
    return board;
}
