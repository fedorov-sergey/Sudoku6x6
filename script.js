// ====== Генератор судоку 6×6 ======
class Sudoku6x6 {
    constructor() {
        this.size = 6;
        this.boxRows = 2;
        this.boxCols = 3;
        this.board = [];
        this.solution = [];
        this.fixed = [];
        this.generate();
    }

    generate() {
        this.board = Array.from({ length: 6 }, () => Array(6).fill(0));
        this.solution = Array.from({ length: 6 }, () => Array(6).fill(0));
        this.fixed = Array.from({ length: 6 }, () => Array(6).fill(false));

        this.solveSudoku();
        this.solution = this.board.map(row => [...row]);
        this.removeNumbers(18);
    }

    isValid(board, row, col, num) {
        // Проверка строки
        for (let c = 0; c < 6; c++) {
            if (board[row][c] === num) return false;
        }
        // Проверка столбца
        for (let r = 0; r < 6; r++) {
            if (board[r][col] === num) return false;
        }
        // Проверка блока 2×3
        const startRow = Math.floor(row / 2) * 2;
        const startCol = Math.floor(col / 3) * 3;
        for (let r = startRow; r < startRow + 2; r++) {
            for (let c = startCol; c < startCol + 3; c++) {
                if (board[r][c] === num) return false;
            }
        }
        return true;
    }

    solveSudoku() {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (this.board[r][c] === 0) {
                    const nums = this.shuffle([1, 2, 3, 4, 5, 6]);
                    for (const num of nums) {
                        if (this.isValid(this.board, r, c, num)) {
                            this.board[r][c] = num;
                            if (this.solveSudoku()) return true;
                            this.board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    removeNumbers(count) {
        const positions = [];
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                positions.push([r, c]);
            }
        }
        this.shuffle(positions);
        let removed = 0;
        for (const [r, c] of positions) {
            if (removed >= count) break;
            this.board[r][c] = 0;
            this.fixed[r][c] = false;
            removed++;
        }
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (this.board[r][c] !== 0) {
                    this.fixed[r][c] = true;
                }
            }
        }
    }

    getHint(userBoard) {
        // Проверяем строки
        for (let r = 0; r < 6; r++) {
            const empty = [];
            const present = new Set();
            for (let c = 0; c < 6; c++) {
                if (userBoard[r][c] === 0) {
                    empty.push(c);
                } else {
                    present.add(userBoard[r][c]);
                }
            }
            if (empty.length === 1) {
                const missing = this.findMissing(present);
                if (missing) {
                    const c = empty[0];
                    return {
                        row: r, col: c, value: missing,
                        text: `В ${r+1}-й строке заполнено 5 клеток. Найди число в последней ячейке`
                    };
                }
            }
        }

        // Проверяем столбцы
        for (let c = 0; c < 6; c++) {
            const empty = [];
            const present = new Set();
            for (let r = 0; r < 6; r++) {
                if (userBoard[r][c] === 0) {
                    empty.push(r);
                } else {
                    present.add(userBoard[r][c]);
                }
            }
            if (empty.length === 1) {
                const missing = this.findMissing(present);
                if (missing) {
                    const r = empty[0];
                    return {
                        row: r, col: c, value: missing,
                        text: `В ${c+1}-м столбце заполнено 5 клеток. Найди число в последней ячейке`
                    };
                }
            }
        }

        // Проверяем прямоугольники 2×3
        const blockNames = [
            'левом верхнем', 'правом верхнем',
            'левом среднем', 'правом среднем',
            'левом нижнем', 'правом нижнем'
        ];
        
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 2; bc++) {
                const empty = [];
                const present = new Set();
                const startRow = br * 2;
                const startCol = bc * 3;
                
                for (let r = startRow; r < startRow + 2; r++) {
                    for (let c = startCol; c < startCol + 3; c++) {
                        if (userBoard[r][c] === 0) {
                            empty.push({ row: r, col: c });
                        } else {
                            present.add(userBoard[r][c]);
                        }
                    }
                }
                
                if (empty.length === 1) {
                    const missing = this.findMissing(present);
                    if (missing) {
                        const { row, col } = empty[0];
                        const blockIdx = br * 2 + bc;
                        return {
                            row, col, value: missing,
                            text: `В ${blockNames[blockIdx]} прямоугольнике заполнено 5 клеток. Найди число в последней ячейке`
                        };
                    }
                }
            }
        }

        // Если нет лёгких подсказок — ищем любую пустую ячейку
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (userBoard[r][c] === 0) {
                    const correct = this.solution[r][c];
                    return {
                        row: r, col: c, value: correct,
                        text: `Попробуй найти число в ${r+1}-й строке и ${c+1}-м столбце`
                    };
                }
            }
        }
        return null;
    }

    findMissing(present) {
        for (let n = 1; n <= 6; n++) {
            if (!present.has(n)) return n;
        }
        return null;
    }
}

// ====== Игровой контроллер ======
let game;
let userBoard;
let selectedCell = null;
let highlightedNumber = null;

function initBoard() {
    game = new Sudoku6x6();
    userBoard = game.board.map(row => [...row]);
    renderBoard();
    document.getElementById('hint').textContent = 'Нажми "Подсказка" для помощи';
    highlightedNumber = null;
    selectedCell = null;
}

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            const val = userBoard[r][c];
            if (val !== 0) {
                cell.textContent = val;
                if (game.fixed[r][c]) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.add('editable');
                }
            } else {
                cell.classList.add('editable');
            }
            
            cell.addEventListener('click', () => {
                handleCellClick(r, c);
            });
            
            boardEl.appendChild(cell);
        }
    }
    
    if (highlightedNumber !== null) {
        highlightSameNumbers(highlightedNumber);
    }
}

function handleCellClick(row, col) {
    const val = userBoard[row][col];
    
    if (val !== 0) {
        if (highlightedNumber === val) {
            highlightedNumber = null;
            clearHighlights();
        } else {
            highlightedNumber = val;
            highlightSameNumbers(val);
        }
        if (selectedCell) {
            const prev = document.querySelector(`.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
            if (prev) prev.classList.remove('selected');
            selectedCell = null;
        }
        return;
    }
    
    if (!game.fixed[row][col]) {
        highlightedNumber = null;
        clearHighlights();
        
        if (selectedCell) {
            const prev = document.querySelector(`.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
            if (prev) prev.classList.remove('selected');
        }
        
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('selected');
            selectedCell = { row, col };
        }
    } else {
        selectedCell = null;
    }
}

function highlightSameNumbers(num) {
    clearHighlights();
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (parseInt(cell.textContent) === num) {
            cell.classList.add('highlight-same');
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.cell.highlight-same').forEach(cell => {
        cell.classList.remove('highlight-same');
    });
}

function setNumber(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (game.fixed[row][col]) return;
    
    if (num === 0) {
        userBoard[row][col] = 0;
    } else {
        userBoard[row][col] = num;
    }
    renderBoard();
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) cell.classList.add('selected');
}

document.addEventListener('keydown', (e) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (game.fixed[row][col]) return;
    
    const num = parseInt(e.key);
    if (num >= 1 && num <= 6) {
        setNumber(num);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setNumber(0);
    }
});

document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const num = parseInt(btn.dataset.num);
        setNumber(num);
    });
});

function getHint() {
    const hint = game.getHint(userBoard);
    if (!hint) {
        document.getElementById('hint').textContent = 'Поздравляю! Ты решил всё!';
        return;
    }
    
    document.getElementById('hint').textContent = hint.text;
    
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('hint-highlight', 'hint-target');
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (r === hint.row && c === hint.col) {
            cell.classList.add('hint-highlight', 'hint-target');
            setTimeout(() => {
                cell.classList.remove('hint-highlight', 'hint-target');
            }, 4000);
        }
    });
    
    if (selectedCell) {
        const prev = document.querySelector(`.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
        if (prev) prev.classList.remove('selected');
        selectedCell = null;
    }
    highlightedNumber = null;
    clearHighlights();
}

function newGame() {
    initBoard();
    selectedCell = null;
    highlightedNumber = null;
    clearHighlights();
}

function checkSolution() {
    let correct = true;
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        cell.classList.remove('wrong');
        if (userBoard[r][c] !== game.solution[r][c]) {
            correct = false;
            if (userBoard[r][c] !== 0) {
                cell.classList.add('wrong');
            }
        }
    });
    
    if (correct) {
        document.getElementById('hint').textContent = 'Всё правильно! Ты гений!';
    } else {
        document.getElementById('hint').textContent = 'Есть ошибки. Красным выделены неверные числа.';
    }
}

initBoard();
