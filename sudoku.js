function logEvent(event) {
    //event.preventDefault();
    console.log(event);
}

function render(board, filters) {
    document.getElementById("game").replaceChildren(
        renderBoard(board, filters),
        document.createElement("br"),
        renderFilters(board, filters));
}

function isNumberFilterSelectable(board, v) {
    for (var pos = 0; pos < 81; pos++) {
        if (board.candidates[pos][v]) { return true; }
    }
    return false;
}

function renderFilters(board, filters) {
    function createFilter(text, isSelected, isSelectable) {
        let div = document.createElement("div");
        div.style.height = "40px";
        div.style.width = "40px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        div.style.fontSize = "xx-large";
        if (!isSelectable) {
            div.style.color = "darkgray";
            div.style.backgroundColor = "lightgray";
        }
        div.appendChild(document.createTextNode(text));
        return div;
    }

    var table = document.createElement("table");
    table.style.border = "2px solid";
    table.style.borderCollapse = "collapse";

    var tr = table.insertRow();
    for (var v = 0; v < 9; v++) {
        let td = tr.insertCell();
        td.style.border = "2px solid";
        td.style.padding = "0";
        td.appendChild(createFilter(`${v+1}`, filters.numbers[v],
            isNumberFilterSelectable(board, v)));
    }
    {
        let td = tr.insertCell();
        td.style.border = "2px solid";
        td.style.padding = "0";
        td.appendChild(createFilter("xy", filters.xy, true));
    }

    return table;
}

// FIXME - apply filters
function renderBoard(board, filters) {
    function createCell(board, pos) {
        let div = document.createElement("div");
        div.style.height = "45px";
        div.style.width = "45px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";

        if (board.knowns[pos] !== undefined) {
            div.style.fontSize = "xxx-large";
            if (board.givens[pos]) {
                //div.style.fontWeight = "bold";
                div.style.color = "blue";
            }
            div.appendChild(document.createTextNode(board.knowns[pos] + 1));
        } else {
            var table = document.createElement("table");
            for (var i = 0; i < 3; i++) {
                var tr = table.insertRow();
                for (var j = 0; j < 3; j++) {
                    var td = tr.insertCell();
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
            td.style.border = "1px solid";
            if (col % 3 == 0) { td.style.borderLeft = "2px solid" }

            td.appendChild(createCell(board, pos));
        }
    }

    return table;
}

function Board() {
    this.knowns = [];
    this.givens = [];
    this.candidates = [];
    for (var pos = 0; pos < 81; pos++) {
        this.knowns[pos] = undefined;
        this.givens[pos] = false;
        this.candidates[pos] = [];
        for (var v = 0; v < 9; v++) {
            this.candidates[pos][v] = true;
        }
    }

    this.setValue = function(pos, v) {
        this.knowns[pos] = v;
        for (var i = 0; i < 9; i++) {
            this.candidates[pos][i] = false;
        }
        // Eliminate neighbors
        for (var pos2 = 0; pos2 < 81; pos2++) {
            if (ROW[pos] == ROW[pos2] ||
                COL[pos] == COL[pos2] ||
                BOX[pos] == BOX[pos2])
            {
                this.candidates[pos2][v] = false;
            }
        }
    }
}

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

function parseLine(line) {
    var board = new Board();
    for (var i = 0; i < line.length; i++) {
        if (i >= 81) { break } // Too much input, just use the valid prefix
        let ch = line.charAt(i);
        if (ch >= '1' && ch <= '9') {
            board.setValue(i, parseInt(ch) - 1);
            board.givens[i] = true;
        } else {
            // Ignored as unknown (typically '.' or '_' or '0')
        }
    }
    return board;
}

function Filters() {
    this.xy = false;
    this.numbers = [];
    for (var i = 0; i < 9; i++) {
        this.numbers[i] = false;
    }
}

function startGameFromLine() {
    let line = document.getElementById("game-line").value;
    board = parseLine(line);
    filters = new Filters();
    render(board, filters);
}

document.addEventListener("keydown", logEvent)
document.addEventListener("keyup", logEvent)
document.addEventListener("click", logEvent)
document.addEventListener("dblclick", logEvent)
document.addEventListener("contextmenu", logEvent)

var board = new Board();
var filters = new Filters();
render(board, filters);

// TODO - fill new game randomly and start it
startGameFromLine();
