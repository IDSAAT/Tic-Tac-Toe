// ========== DOM Elements ==========
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('statusText');
const resetBtn = document.getElementById('resetBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const pvpModeBtn = document.getElementById('pvpMode');
const pveModeBtn = document.getElementById('pveMode');
const xScoreEl = document.getElementById('xScore');
const oScoreEl = document.getElementById('oScore');
const drawScoreEl = document.getElementById('drawScore');

// ========== Game State ==========
let boardState = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isAIEnabled = false;
let scores = {
    X: 0,
    O: 0,
    draw: 0
};

// ========== Winning Combinations ==========
const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]              // Diagonals
];

// ========== Initialize Game ==========
function init() {
    // Add click listeners to all cells
    for (let i = 0; i < cells.length; i++) {
        cells[i].addEventListener('click', function() {
            handleCellClick(parseInt(cells[i].getAttribute('data-index')));
        });
    }
    
    resetBtn.addEventListener('click', resetGame);
    resetScoreBtn.addEventListener('click', resetScores);
    pvpModeBtn.addEventListener('click', function() { setMode(false); });
    pveModeBtn.addEventListener('click', function() { setMode(true); });
    
    updateScoresDisplay();
    updateStatusText();
}

// ========== Set Game Mode ==========
function setMode(isAI) {
    isAIEnabled = isAI;
    
    if (isAI) {
        pveModeBtn.classList.add('active');
        pvpModeBtn.classList.remove('active');
    } else {
        pvpModeBtn.classList.add('active');
        pveModeBtn.classList.remove('active');
    }
    
    resetGame();
}

// ========== Handle Cell Click ==========
function handleCellClick(index) {
    console.log("Cell clicked:", index); // Debug: check if function runs
    
    // Check if cell is empty, game is active
    if (boardState[index] !== '' || !gameActive) {
        console.log("Invalid move: cell occupied or game not active");
        return;
    }
    
    // In AI mode, only allow moves when it's X's turn (player is X)
    if (isAIEnabled && currentPlayer !== 'X') {
        console.log("AI turn, waiting...");
        return;
    }
    
    // Make the move
    makeMove(index, currentPlayer);
}

// ========== Make a Move ==========
function makeMove(index, player) {
    // Update board state
    boardState[index] = player;
    
    // Update UI
    const cell = cells[index];
    cell.textContent = player;
    cell.classList.add(player === 'X' ? 'x-move' : 'o-move');
    
    // Check for win or draw
    if (checkWin(player)) {
        handleWin(player);
    } else if (checkDraw()) {
        handleDraw();
    } else {
        // Switch player
        currentPlayer = (player === 'X') ? 'O' : 'X';
        updateStatusText();
        
        // If AI mode and now it's O's turn, trigger AI move
        if (isAIEnabled && gameActive && currentPlayer === 'O') {
            setTimeout(function() { aiMove(); }, 300);
        }
    }
}

// ========== AI Move ==========
function aiMove() {
    if (!gameActive) return;
    
    let moveIndex = -1;
    
    // 1. Check if AI (O) can win
    moveIndex = getWinningMove('O');
    
    // 2. Block player (X) from winning
    if (moveIndex === -1) {
        moveIndex = getWinningMove('X');
    }
    
    // 3. Take center if available
    if (moveIndex === -1 && boardState[4] === '') {
        moveIndex = 4;
    }
    
    // 4. Take corners
    if (moveIndex === -1) {
        const corners = [0, 2, 6, 8];
        const availableCorners = [];
        for (let i = 0; i < corners.length; i++) {
            if (boardState[corners[i]] === '') {
                availableCorners.push(corners[i]);
            }
        }
        if (availableCorners.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableCorners.length);
            moveIndex = availableCorners[randomIndex];
        }
    }
    
    // 5. Take any empty cell
    if (moveIndex === -1) {
        const emptyCells = [];
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                emptyCells.push(i);
            }
        }
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            moveIndex = emptyCells[randomIndex];
        }
    }
    
    if (moveIndex !== -1) {
        makeMove(moveIndex, 'O');
    }
}

// ========== Find Winning Move ==========
function getWinningMove(player) {
    for (let i = 0; i < winningCombos.length; i++) {
        const combo = winningCombos[i];
        const a = combo[0], b = combo[1], c = combo[2];
        
        if (boardState[a] === player && boardState[b] === player && boardState[c] === '') {
            return c;
        }
        if (boardState[a] === player && boardState[c] === player && boardState[b] === '') {
            return b;
        }
        if (boardState[b] === player && boardState[c] === player && boardState[a] === '') {
            return a;
        }
    }
    return -1;
}

// ========== Check Win ==========
function checkWin(player) {
    for (let i = 0; i < winningCombos.length; i++) {
        const combo = winningCombos[i];
        const a = combo[0], b = combo[1], c = combo[2];
        
        if (boardState[a] === player && boardState[b] === player && boardState[c] === player) {
            highlightWinningCells(combo);
            return true;
        }
    }
    return false;
}

// ========== Highlight Winning Cells ==========
function highlightWinningCells(combo) {
    for (let i = 0; i < combo.length; i++) {
        cells[combo[i]].classList.add('winner');
    }
}

// ========== Check Draw ==========
function checkDraw() {
    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === '') {
            return false;
        }
    }
    return true;
}

// ========== Handle Win ==========
function handleWin(player) {
    gameActive = false;
    statusText.textContent = '🎉 Player ' + player + ' wins! 🎉';
    
    if (player === 'X') {
        scores.X++;
    } else {
        scores.O++;
    }
    updateScoresDisplay();
}

// ========== Handle Draw ==========
function handleDraw() {
    gameActive = false;
    statusText.textContent = '🤝 It\'s a draw! 🤝';
    scores.draw++;
    updateScoresDisplay();
}

// ========== Reset Game ==========
function resetGame() {
    // Reset board state
    for (let i = 0; i < boardState.length; i++) {
        boardState[i] = '';
    }
    currentPlayer = 'X';
    gameActive = true;
    
    // Clear UI
    for (let i = 0; i < cells.length; i++) {
        cells[i].textContent = '';
        cells[i].classList.remove('x-move', 'o-move', 'winner');
    }
    
    updateStatusText();
}

// ========== Reset Scores ==========
function resetScores() {
    scores = { X: 0, O: 0, draw: 0 };
    updateScoresDisplay();
    resetGame();
}

// ========== Update Status Text ==========
function updateStatusText() {
    if (isAIEnabled) {
        if (currentPlayer === 'X') {
            statusText.textContent = 'Your turn (Player X)';
        } else {
            statusText.textContent = 'AI is thinking... (Player O)';
        }
    } else {
        statusText.textContent = 'Player ' + currentPlayer + '\'s turn';
    }
}

// ========== Update Scores Display ==========
function updateScoresDisplay() {
    xScoreEl.textContent = scores.X;
    oScoreEl.textContent = scores.O;
    drawScoreEl.textContent = scores.draw;
}

// ========== Start Game ==========
init();