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
            this.excludeCandidate(pos, i);
        }
        // Eliminate neighbors
        for (const pos2 of POS) {
            if (ROW[pos] == ROW[pos2] ||
                COL[pos] == COL[pos2] ||
                BOX[pos] == BOX[pos2])
            {
                this.excludeCandidate(pos2, v);
            }
        }
    }

    this.excludeCandidate = function(pos, v) {
        this.candidates[pos][v] = false;
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

function Filter(displayText, cellMatches, candidateMatches, selectable) {
    this.displayText = displayText;
    this.selected = false;
    this.cellMatches = cellMatches;
    this.candidateMatches = candidateMatches;
    this.selectable = selectable;
    this.onClick = function(state, shiftOrCtrlKey) {
        if (this.selectable(state.board)) {
            if (!this.selected) {
                if (!shiftOrCtrlKey) {
                    for (const filter of state.filters) {
                        filter.selected = false;
                    }
                }
                this.selected = true;
            } else if (shiftOrCtrlKey) {
                this.selected = false;
            } else if (state.filters.some(f => f != this && f.selected)) {
                for (const filter of state.filters) {
                    filter.selected = false;
                }
                this.selected = true;
            } else {
                this.selected = false; // If this is the only filter currently selected
            }
            render(state);
        }
    };
}

function newFilters() {
    const filters = [];

    for (const i of VAL) {
        filters.push(new Filter(`${i+1}`,
            function(board, pos) {
                return board.candidates[pos][i];
            }, function(board, pos, v) {
                return i == v && board.candidates[pos][i];
            }, function(board) {
                return POS.some(pos => board.candidates[pos][i]);
            }));
    }

    filters.push(new Filter("xy",
        function(board, pos) {
            return board.candidates[pos].filter(c => c).length == 2;
        }, function(board, pos, v) {
            return true;
        }, function(board) {
            return true;
        }));

    return filters;
}

function GameState() {
    this.board = new Board();
    this.filters = newFilters();
    this.selected = [];
    for (const pos of POS) {
        this.selected[pos] = false;
    }

    this.boardUpdated = function() {
        for (const filter of this.filters) {
            if (filter.selected && !filter.selectable(this.board)) {
                filter.selected = false;
            }
        }
    };
}

function onCellClick(state, pos, shiftOrCtrlKey) {
    if (!state.selected[pos]) {
        if (!shiftOrCtrlKey) {
            for (const pos2 of POS) {
                state.selected[pos2] = false;
            }
        }
        state.selected[pos] = true;
    } else if (shiftOrCtrlKey) {
        state.selected[pos] = false;
    } else if (POS.some(pos2 => pos != pos2 && state.selected[pos2])) {
        for (const pos2 of POS) {
            state.selected[pos2] = false;
        }
        state.selected[pos] = true;
    } else {
        state.selected[pos] = false; // If this is the only cell currently selected
    }
    render(state);
}

function render(state) {
    document.getElementById("game").replaceChildren(
        renderBoard(state),
        document.createElement("br"),
        renderFilters(state));
}

function renderFilters(state) {
    function renderFilter(filter) {
        let div = document.createElement("div");
        div.style.height = "40px";
        div.style.width = "40px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        div.style.fontSize = "40px";
        if (!filter.selectable(state.board)) {
            div.style.color = "darkgray";
            div.style.backgroundColor = "lightgray";
        } else if (filter.selected) {
            div.style.backgroundColor = "lightgreen";
        }
        div.appendChild(document.createTextNode(filter.displayText));
        div.addEventListener("click", function(ev) {
            ev.preventDefault();
            filter.onClick(state, ev.shiftKey || ev.ctrlKey)
        });
        return div;
    }

    var table = document.createElement("table");
    table.style.border = "2px solid";
    table.style.borderCollapse = "collapse";

    var tr = table.insertRow();
    for (const filter of state.filters) {
        let td = tr.insertCell();
        td.style.border = "2px solid";
        td.style.padding = "0";
        td.appendChild(renderFilter(filter));
    }

    return table;
}

function renderBoard(state) {
    function renderCell(pos) {
        let div = document.createElement("div");
        div.style.height = "45px";
        div.style.width = "45px";
        div.style.display = "flex";
        div.style.justifyContent = "center";
        div.style.alignItems = "center";
        div.style.position = "relative";
        div.addEventListener("click", function(ev) {
            ev.preventDefault();
            onCellClick(state, pos, ev.shiftKey || ev.ctrlKey);
        });

        if (state.selected[pos]) {
            let borderDiv = document.createElement("div");
            borderDiv.style.border = "4px solid yellow";
            borderDiv.style.position = "absolute";
            borderDiv.style.left = "0";
            borderDiv.style.top = "0";
            borderDiv.style.width = "37px"; // Outer width - 2*border width
            borderDiv.style.height = "37px";
            div.appendChild(borderDiv);
        }

        const anyFilters = state.filters.some(f => f.selected);
        if (anyFilters && state.filters.filter(f => f.selected).every(f => f.cellMatches(state.board, pos))) {
            div.style.backgroundColor = "lightgreen";
        }

        if (state.board.knowns[pos] !== undefined) {
            div.style.fontSize = "45px";
            if (state.board.givens[pos]) {
                div.style.color = "blue";
            }
            div.appendChild(document.createTextNode(state.board.knowns[pos] + 1));
        } else {
            var table = document.createElement("table");
            for (var i = 0; i < 3; i++) {
                var tr = table.insertRow();
                for (var j = 0; j < 3; j++) {
                    var td = tr.insertCell();
                    td.style.padding = "0";
                    var innerdiv = document.createElement("div");
                    td.appendChild(innerdiv);

                    innerdiv.style.height = "12px";
                    innerdiv.style.width = "12px";
                    innerdiv.style.display = "flex";
                    innerdiv.style.justifyContent = "center";
                    innerdiv.style.alignItems = "center";
                    innerdiv.style.fontSize = "12px";

                    let v = i*3 + j;
                    if (state.board.candidates[pos][v]) {
                        if (anyFilters && !state.filters.some(f => f.selected && f.candidateMatches(state.board, pos, v))) {
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
    board = parseLine(line);
    gameState = new GameState();
    gameState.board = board;
    gameState.boardUpdated();

    render(gameState);
}

function keyNum(key) {
    const SHIFT_NUMS = ["!", "@", "#", "$", "%", "^", "&", "*", "("];
    if (key >= "1" && key <= "9") {
        return parseInt(key) - 1;
    } else if (SHIFT_NUMS.includes(key)) {
        return SHIFT_NUMS.indexOf(key);
    } else {
        return undefined;
    }
}

function onKeyDown(ev) {
    const shiftOrCtrlKey = ev.shiftKey || ev.ctrlKey;
    const altKey = ev.altKey;
    const state = gameState;
    const hasSelected = state.selected.some(s => s);
    if ((altKey || !hasSelected) && (ev.key == "0" || ev.key == ")")) {
        ev.preventDefault();
        state.filters[9].onClick(state, shiftOrCtrlKey);
    } else if ((altKey || !hasSelected) && keyNum(ev.key) != undefined) {
        ev.preventDefault();
        state.filters[keyNum(ev.key)].onClick(state, shiftOrCtrlKey);
    } else if (keyNum(ev.key) != undefined) {
        ev.preventDefault();
        for (const pos in POS) {
            if (state.selected[pos]) {
                if (shiftOrCtrlKey) {
                    state.board.excludeCandidate(pos, keyNum(ev.key));
                } else {
                    state.board.setValue(pos, keyNum(ev.key));
                }
            }
        }
        state.boardUpdated();
        render(state);
        // FIXME - undo/redo
    } else {
        logEvent(ev);
    }
}

document.addEventListener("keydown", onKeyDown)
//document.addEventListener("keyup", logEvent)
document.addEventListener("click", logEvent)
document.addEventListener("dblclick", logEvent)
document.addEventListener("contextmenu", logEvent)

var gameState = new GameState();
render(gameState);

// TODO - fill new game randomly and start it
startGameFromLine();
