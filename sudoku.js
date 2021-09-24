function logEvent(event) {
    //event.preventDefault();
    console.log(event);
}

const VAL = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const POS = [
    0,  1,  2,  3,  4,  5,  6,  7,  8,
    9,  10, 11, 12, 13, 14, 15, 16, 17,
    18, 19, 20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, 32, 33, 34, 35,
    36, 37, 38, 39, 40, 41, 42, 43, 44,
    45, 46, 47, 48, 49, 50, 51, 52, 53,
    54, 55, 56, 57, 58, 59, 60, 61, 62,
    63, 64, 65, 66, 67, 68, 69, 70, 71,
    72, 73, 74, 75, 76, 77, 78, 79, 80,
];
const BOX = [
    0, 0, 0, 1, 1, 1, 2, 2, 2,
    0, 0, 0, 1, 1, 1, 2, 2, 2,
    0, 0, 0, 1, 1, 1, 2, 2, 2,
    3, 3, 3, 4, 4, 4, 5, 5, 5,
    3, 3, 3, 4, 4, 4, 5, 5, 5,
    3, 3, 3, 4, 4, 4, 5, 5, 5,
    6, 6, 6, 7, 7, 7, 8, 8, 8,
    6, 6, 6, 7, 7, 7, 8, 8, 8,
    6, 6, 6, 7, 7, 7, 8, 8, 8,
];
const ROW = [
    0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2,
    3, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4, 4, 4, 4,
    5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 6, 6, 6, 6,
    7, 7, 7, 7, 7, 7, 7, 7, 7,
    8, 8, 8, 8, 8, 8, 8, 8, 8,
];
const COL = [
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
    0, 1, 2, 3, 4, 5, 6, 7, 8,
];

function Board() {
    this.knowns = [];
    this.givens = [];
    this.candidates = [];
    for (const pos of POS) {
        this.knowns[pos] = undefined;
        this.givens[pos] = false;
        this.candidates[pos] = [];
        for (const v of VAL) {
            this.candidates[pos][v] = true;
        }
    }

    this.setValue = function(pos, v) {
        this.knowns[pos] = v;
        for (const i of VAL) {
            this.candidates[pos][i] = false;
        }
        // Eliminate neighbors
        for (const pos2 of POS) {
            if (ROW[pos] == ROW[pos2] ||
                COL[pos] == COL[pos2] ||
                BOX[pos] == BOX[pos2])
            {
                this.candidates[pos2][v] = false;
            }
        }
    }
}


function parseLine(line) {
    var board = new Board();
    for (var i = 0; i < line.length; i++) {
        if (i >= POS.length) { break } // Too much input, just use the valid prefix
        let ch = line.charAt(i);
        if (ch >= '1' && ch <= '9') {
            board.setValue(i, parseInt(ch) - 1);
            board.givens[i] = true;
        } else {
            // Ignored as unset (typically '.' or '_' or '0')
        }
    }
    return board;
}

function Filters() {
    function Filter(displayText, filters, cellMatches, candidateMatches, selectable) {
        this.displayText = displayText;
        this.filters = filters;
        this.selected = false;
        this.cellMatches = cellMatches;
        this.candidateMatches = candidateMatches;
        this.selectable = selectable;
        this.onClick = function(board, ctrlClick) {
            if (this.selectable(board)) {
                if (!this.selected) {
                    if (!ctrlClick) {
                        for (const filter of filters) {
                            filter.selected = false;
                        }
                    }
                    this.selected = true;
                } else if (ctrlClick) {
                    this.selected = false;
                } else if (Array.from(filters).some(f => f != this && f.selected)) {
                    for (const filter of filters) {
                        filter.selected = false;
                    }
                    this.selected = true;
                } else {
                    this.selected = false; // If this is the only filter currently selected
                }
                render(board, filters);
            }
        };
    }

    this.filters = [];
    this[Symbol.iterator] = function() { return this.filters[Symbol.iterator](); };

    for (const i of VAL) {
        this.filters.push(new Filter(`${i+1}`, this,
            function(board, pos) {
                return board.candidates[pos][i];
            }, function(board, pos, v) {
                return i == v && board.candidates[pos][i];
            }, function(board) {
                return POS.some(pos => board.candidates[pos][i]);
            }));
    }

    this.filters.push(new Filter("xy", this,
        function(board, pos) {
            return board.candidates[pos].filter(c => c).length == 2;
        }, function(board, pos, v) {
            return true;
        }, function(board) {
            return true;
        }));

    this.boardUpdated = function(board) {
        for (const filter of this.filters) {
            if (filter.selected && !filter.selectable(board)) {
                filter.selected = false;
            }
        }
    };
}

function render(board, filters) {
    document.getElementById("game").replaceChildren(
        renderBoard(board, filters),
        document.createElement("br"),
        renderFilters(board, filters));
}

function renderFilters(board, filters) {
    function renderFilter(filter) {
        let div = document.createElement("div");
        div.style.height = "40px";
        div.style.width = "40px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        div.style.fontSize = "xx-large";
        if (!filter.selectable(board)) {
            div.style.color = "darkgray";
            div.style.backgroundColor = "lightgray";
        } else if (filter.selected) {
            div.style.backgroundColor = "lightgreen";
        }
        div.appendChild(document.createTextNode(filter.displayText));
        div.addEventListener("click", function(ev) { filter.onClick(board, ev.ctrlKey) })
        return div;
    }

    var table = document.createElement("table");
    table.style.border = "2px solid";
    table.style.borderCollapse = "collapse";

    var tr = table.insertRow();
    for (const filter of filters) {
        let td = tr.insertCell();
        td.style.border = "2px solid";
        td.style.padding = "0";
        td.appendChild(renderFilter(filter));
    }

    return table;
}

function renderBoard(board, filters) {
    function renderCell(pos) {
        let div = document.createElement("div");
        div.style.height = "45px";
        div.style.width = "45px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";

        const anyFilters = filters.filters.some(f => f.selected);
        if (anyFilters && filters.filters.filter(f => f.selected).every(f => f.cellMatches(board, pos))) {
            div.style.backgroundColor = "lightgreen";
        }

        if (board.knowns[pos] !== undefined) {
            div.style.fontSize = "xxx-large";
            if (board.givens[pos]) {
                div.style.color = "blue";
            }
            div.appendChild(document.createTextNode(board.knowns[pos] + 1));
        } else {
            var table = document.createElement("table");
            for (var i = 0; i < 3; i++) {
                var tr = table.insertRow();
                for (var j = 0; j < 3; j++) {
                    var td = tr.insertCell();
                    td.style.padding = "0";
                    var innerdiv = document.createElement("div");
                    td.appendChild(innerdiv);

                    innerdiv.style.height = "10px";
                    innerdiv.style.width = "10px";
                    innerdiv.style.display = "flex";
                    innerdiv.style.justifyContent = "center";
                    innerdiv.style.alignItems = "center";
                    innerdiv.style.fontSize = "small";

                    let v = i*3 + j;
                    if (board.candidates[pos][v]) {
                        if (anyFilters && !filters.filters.some(f => f.selected && f.candidateMatches(board, pos, v))) {
                            innerdiv.style.color = "darkgray";
                        }

                        innerdiv.appendChild(document.createTextNode(v + 1));
                    }
                }
            }
            div.appendChild(table);
        }
        return div;
    }

    var table = document.createElement("table");
    table.style.border = "2px solid";
    table.style.borderCollapse = "collapse";

    for (var row = 0; row < 9; row++) {
        var tr = table.insertRow();
        if (row % 3 == 0) { tr.style.borderTop = "2px solid" }
        for (var col = 0; col < 9; col++) {
            let pos = row*9 + col;

            let td = tr.insertCell();
            td.style.padding = "0";
            td.style.border = "1px solid";
            if (col % 3 == 0) { td.style.borderLeft = "2px solid" }

            td.appendChild(renderCell(pos));
        }
    }

    return table;
}

function startGameFromLine() {
    let line = document.getElementById("game-line").value;
    gameBoard = parseLine(line);
    gameFilters = new Filters();
    gameFilters.boardUpdated(gameBoard);
    render(gameBoard, gameFilters);
}

document.addEventListener("keydown", logEvent)
document.addEventListener("keyup", logEvent)
document.addEventListener("click", logEvent)
document.addEventListener("dblclick", logEvent)
document.addEventListener("contextmenu", logEvent)

var gameBoard = new Board();
var gameFilters = new Filters();
render(gameBoard, gameFilters);

// TODO - fill new game randomly and start it
startGameFromLine();
