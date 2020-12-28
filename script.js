// uncovered
// covered
// flagged
// 0 = blank, 1 = mine...

var boardElem = document.getElementById("board");
var numberOfFlagsElem = document.getElementById("flags");
var numberOfMines = 99;
var numberOfFlags = 99;
var rows = 16;
var columns = 30;
var board = generateBoard();

numberOfFlagsElem.innerHTML = numberOfFlags;

board = addMinesToRandomSlots(board);
board = addNeighbourNumbers(board);
var boardHtml = generateBoardHtml(board);
boardElem.innerHTML = boardHtml;

boardElem.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    var colIndex = getColIndex(e.target);
    var rowIndex = getRowIndex(e.target);
    if (board[rowIndex][colIndex].state === "covered" && numberOfFlags > 0) {
        console.log("add flag");
        e.target.classList.add("flagged");
        board[rowIndex][colIndex].state = "flagged";
        numberOfFlags--;
    } else if (board[rowIndex][colIndex].state === "flagged") {
        console.log("remove flag");
        e.target.classList.remove("flagged");
        board[rowIndex][colIndex].state = "covered";
        numberOfFlags++;
    }
    numberOfFlagsElem.innerHTML = numberOfFlags;
    console.log("right click");
});

boardElem.addEventListener("click", function (e) {
    var colIndex = getColIndex(e.target);
    var rowIndex = getRowIndex(e.target);
    if (board[rowIndex][colIndex].value) {
        e.target.classList.add("mine");
    } else {
        uncoverSpace(e.target, rowIndex, colIndex);
    }
});

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
            var newElem = document.getElementsByClassName("row")[cell.row].children[cell.col];
            if (cell.numberOfNeighbours) {
                newElem.classList.add("uncovered");
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
        return cell.state === "covered"
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
            // htmlString += "<div>" + row[j].value + "</div>";
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

function generateBoard() {
    var board = [];
    var index = 0;
    for (var row, i = 0; i < rows; i++) {
        row = [];
        for (var j = 0; j < columns; j++) {
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

console.log("board: ", board);
