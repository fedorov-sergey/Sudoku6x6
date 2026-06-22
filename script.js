// ====== Генератор судоку 6×6 ======
// Блоки: 2 строки × 3 столбца (каждый блок 2×3)

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
        // Создаём пустую доску
        this.board = Array.from({ length: 6 }, () => Array(6).fill(0));
        this.solution = Array.from({ length: 6 }, () => Array(6).fill(0));
        this.fixed = Array.from({ length: 6 }, () => Array(6).fill(false));

        // Заполняем диагональные блоки (они независимы)
        this.fillDiagonalBlocks();
        // Решаем остальное
        this.solveSudoku();
        // Копируем решение
        this.solution = this.board.map(row => [...row]);

        // Удаляем часть чисел для создания головоломки
        this.removeNumbers(18); // оставляем ~18 подсказок
    }

    fillDiagonalBlocks() {
        // Блоки по диагонали: (0,0), (0,3), (2,0), (2,3), (4,0), (4,3)
        for (let r = 0; r < 6; r += 2) {
            for (let c = 0; c < 6; c += 3) {
                this.fillBlock(r, c);
            }
        }
    }

    fillBlock(row, col) {
        const nums = this.shuffle([1, 2, 3, 4, 5, 6]);
        let idx = 0;
        for (let r = row; r < row + 2; r++) {
            for (let c = col; c < col + 3; c++) {
                this.board[r][c] = nums[idx++];
            }
        }
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
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
        // Помечаем оставшиеся как фиксированные
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (this.board[r][c] !== 0) {
                    this.fixed[r][c] = true;
                }
            }
        }
    }

    // Получить подсказку (находит пустую ячейку и возвращает описание)
    getHint(userBoard) {
        // Находим первую пустую ячейку
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 6; c++) {
                if (userBoard[r][c] === 0 || userBoard[r][c] !== this.solution[r][c]) {
                    const correctNum = this.solution[r][c];
                    // Генерируем разные типы подсказок
                    const hintType = Math.floor(Math.random() * 4);
                    let hintText = '';
                    const rowNum = r + 1;
                    const colNum = c + 1;
                    const blockRow = Math.floor(r / 2) + 1;
                    const blockCol = Math.floor(c / 3) + 1;
                    const blockNames = ['левом верхнем', 'правом верхнем', 'левом среднем', 'правом среднем', 'левом нижнем', 'правом нижнем'];
                    const blockIdx = (blockRow - 1) * 2 + (blockCol - 1);
                    
                    switch(hintType) {
                        case 0:
                            hintText = `🔍 Найди число ${correctNum} в ${rowNum}-й строке`;
                            break;
                        case 1:
                            hintText = `🔍 Найди число ${correctNum} в ${colNum}-м столбце`;
                            break;
                        case 2:
                            hintText = `🔍 Найди число ${correctNum} в ${blockNames[blockIdx]} прямоугольнике`;
                            break;
                        case 3:
                            hintText = `🔍 В ${rowNum}-й строке, ${colNum}-м столбце должно быть число ${correctNum}`;
                            break;
                    }
                    return { row: r, col: c, value: correctNum, text: hintText };
                }
            }
        }
        return null; // всё решено
    }
}

// ====== Игровой контроллер ======
let game;
let userBoard;
let selectedCell = null;
let hintActive = false;

function initBoard() {
    game = new Sudoku6x6();
    userBoard = game.board.map(row => [...row]);
    renderBoard();
    document.getElementById('hint').textContent = '💡 Нажми "Подсказка" для помощи';
    hintActive = false;
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
            
            // Обработка клика для ввода чисел
            cell.addEventListener('click', () => {
                if (selectedCell) {
                    const prev = document.querySelector(`.cell[data-row="${selectedCell.row}"][data-col="${selectedCell.col}"]`);
                    if (prev) prev.classList.remove('selected');
                }
                if (!game.fixed[r][c] && userBoard[r][c] === 0) {
                    cell.classList.add('selected');
                    selectedCell = { row: r, col: c };
                } else {
                    selectedCell = null;
                }
            });
            
            boardEl.appendChild(cell);
        }
    }
}

// Обработка ввода с клавиатуры
document.addEventListener('keydown', (e) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (game.fixed[row][col]) return;
    
    const num = parseInt(e.key);
    if (num >= 1 && num <= 6) {
        userBoard[row][col] = num;
        renderBoard();
        // Выделяем снова
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add('selected');
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        userBoard[row][col] = 0;
        renderBoard();
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add('selected');
    }
});

function getHint() {
    const hint = game.getHint(userBoard);
    if (!hint) {
        document.getElementById('hint').textContent = '🎉 Поздравляю! Ты решил всё!';
        return;
    }
    
    // Показываем подсказку
    document.getElementById('hint').textContent = hint.text;
    
    // Визуально подсвечиваем ячейку
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('hint-highlight');
        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);
        if (r === hint.row && c === hint.col) {
            cell.classList.add('hint-highlight');
            setTimeout(() => cell.classList.remove('hint-highlight'), 3000);
        }
    });
    
    // Автоматически ставим число (можно закомментировать, если хотите, чтобы пользователь сам вводил)
    // userBoard[hint.row][hint.col] = hint.value;
    // renderBoard();
}

function newGame() {
    initBoard();
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
        document.getElementById('hint').textContent = '🎉 Всё правильно! Ты гений!';
    } else {
        document.getElementById('hint').textContent = '❌ Есть ошибки. Красным выделены неверные числа.';
    }
}

// Запуск
initBoard();