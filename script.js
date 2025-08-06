    // DOM Elements
        const cells = document.querySelectorAll('.grid-cell');
        const turnIndicator = document.getElementById('turn-indicator');
        const gameOverModal = document.getElementById('game-over-modal');
        const winnerMessage = document.getElementById('winner-message');
        const gameModeSelection = document.getElementById('game-mode-selection');
        const difficultySelection = document.getElementById('difficulty-selection');
        const playerVsPlayerButton = document.getElementById('player-vs-player');
        const playerVsComputerButton = document.getElementById('player-vs-computer');
        const difficultyDropdown = document.getElementById('difficulty-dropdown');
        const startComputerGameButton = document.getElementById('start-computer-game');
        const gridContainer = document.querySelector('.grid-container');
        const scoreboard = document.getElementById('scoreboard');
        const player1Label = document.getElementById('player1-label');
        const player1Score = document.getElementById('player1-score');
        const drawScore = document.getElementById('draw-score');
        const player2Label = document.getElementById('player2-label');
        const player2Score = document.getElementById('player2-score');
        const playAgainButton = document.getElementById('play-again-button');
        const changeModeButton = document.getElementById('change-mode-button');

        // Game State
        let currentPlayer = 'X';
        let board = ['', '', '', '', '', '', '', '', ''];
        let gameActive = false;
        let gameMode = null; 
        let difficulty = null;
        let score = { X: 0, O: 0, draws: 0 };

        const winningConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
        ];

        const updateScoreboard = () => {
            if (gameMode === 'pvc') {
                player1Label.textContent = `You (X)`;
                player2Label.textContent = `Computer (O)`;
            } else {
                player1Label.textContent = 'Player X';
                player2Label.textContent = 'Player O';
            }
            player1Score.textContent = score.X;
            player2Score.textContent = score.O;
            drawScore.textContent = score.draws;
        };

        const resetBoard = () => {
            gameActive = true;
            currentPlayer = 'X';
            board = Array(9).fill('');
            turnIndicator.textContent = gameMode === 'pvc' ? 'Your Turn' : "Player X's Turn";
            cells.forEach(cell => {
                cell.innerHTML = '';
                cell.classList.remove('winning-cell');
            });
            gameOverModal.style.display = 'none';
            gridContainer.style.cursor = 'pointer';
        };

        const startGame = (mode, diff = null) => {
            if (gameMode !== mode || difficulty !== diff) {
                score = { X: 0, O: 0, draws: 0 };
            }
            gameMode = mode;
            difficulty = diff;
            
            updateScoreboard();
            resetBoard();

            gameModeSelection.classList.add('hidden');
            difficultySelection.classList.add('hidden');
            scoreboard.classList.remove('hidden');
            gridContainer.classList.remove('hidden');
        };

        const handleCellClick = (e) => {
            if (!gameActive) return;
            const clickedCell = e.target.closest('.grid-cell');
            if (!clickedCell) return;
            const clickedCellIndex = Array.from(cells).indexOf(clickedCell);
            if (board[clickedCellIndex] !== '' || (gameMode === 'pvc' && currentPlayer === 'O')) {
                return;
            }
            placeMark(clickedCellIndex);
            if (gameActive && gameMode === 'pvc' && currentPlayer === 'O') {
                gridContainer.style.cursor = 'wait';
                setTimeout(computerMove, 500);
            }
        };

        const placeMark = (index) => {
            board[index] = currentPlayer;
            cells[index].innerHTML = currentPlayer === 'X' ? '<span class="x-symbol">&times;</span>' : '<div class="o-symbol"></div>';
            checkResult();
        };

        const checkResult = () => {
            let roundWon = false;
            let winningLine = [];
            for (const winCondition of winningConditions) {
                const [a, b, c] = winCondition;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                    roundWon = true;
                    winningLine = winCondition;
                    break;
                }
            }
            if (roundWon) {
                endGame(false, winningLine);
            } else if (!board.includes('')) {
                endGame(true);
            } else {
                changePlayer();
            }
        };

        const changePlayer = () => {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            turnIndicator.textContent = gameMode === 'pvc' ? (currentPlayer === 'X' ? 'Your Turn' : "Computer's Turn") : `Player ${currentPlayer}'s Turn`;
        };

        const endGame = (isDraw, winningLine = []) => {
            gameActive = false;
            gridContainer.style.cursor = 'default';
            if (isDraw) {
                winnerMessage.textContent = "It's a Draw!";
                score.draws++;
            } else {
                score[currentPlayer]++;
                winnerMessage.textContent = gameMode === 'pvc' ? (currentPlayer === 'X' ? 'You Win!' : 'Computer Wins!') : `Player ${currentPlayer} Wins!`;
                winningLine.forEach(index => cells[index].classList.add('winning-cell'));
            }
            updateScoreboard();
            setTimeout(() => gameOverModal.style.display = 'flex', 1000);
        };
        
        const backToMenu = () => {
            gameOverModal.style.display = 'none';
            gridContainer.classList.add('hidden');
            scoreboard.classList.add('hidden');
            difficultySelection.classList.add('hidden');
            gameModeSelection.classList.remove('hidden');
            turnIndicator.textContent = 'Select Game Mode';
            gameMode = null;
            difficulty = null;
        };

        // --- AI LOGIC ---
        const computerMove = () => {
            if (!gameActive) return;
            let move;
            switch (difficulty) {
                case 'easy':
                    move = findRandomMove();
                    break;
                case 'medium':
                    move = Math.random() < 0.5 ? findStrategicMove() : findRandomMove();
                    break;
                case 'unbeatable':
                    move = findBestMoveWithMinimax();
                    break;
            }
            placeMark(move);
            gridContainer.style.cursor = 'pointer';
        };

        const findRandomMove = () => {
            const emptyCells = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        };

        const findStrategicMove = () => {
            for (const condition of winningConditions) {
                const [a, b, c] = condition;
                if (board[a] === 'O' && board[b] === 'O' && board[c] === '') return c;
                if (board[a] === 'O' && board[c] === 'O' && board[b] === '') return b;
                if (board[b] === 'O' && board[c] === 'O' && board[a] === '') return a;
            }
            for (const condition of winningConditions) {
                const [a, b, c] = condition;
                if (board[a] === 'X' && board[b] === 'X' && board[c] === '') return c;
                if (board[a] === 'X' && board[c] === 'X' && board[b] === '') return b;
                if (board[b] === 'X' && board[c] === 'X' && board[a] === '') return a;
            }
            if (board[4] === '') return 4;
            const corners = [0, 2, 6, 8].filter(index => board[index] === '');
            if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
            return findRandomMove();
        };

        const findBestMoveWithMinimax = () => {
            let bestScore = -Infinity;
            let move;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, 0, false);
                    board[i] = '';
                    if (score > bestScore) {
                        bestScore = score;
                        move = i;
                    }
                }
            }
            return move;
        };
        
        const scores = { 'X': -10, 'O': 10, 'draw': 0 };

        function minimax(currentBoard, depth, isMaximizing) {
            let result = checkWinner(currentBoard);
            if (result !== null) return scores[result];

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < 9; i++) {
                    if (currentBoard[i] === '') {
                        currentBoard[i] = 'O';
                        let score = minimax(currentBoard, depth + 1, false);
                        currentBoard[i] = '';
                        bestScore = Math.max(score, bestScore);
                    }
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < 9; i++) {
                    if (currentBoard[i] === '') {
                        currentBoard[i] = 'X';
                        let score = minimax(currentBoard, depth + 1, true);
                        currentBoard[i] = '';
                        bestScore = Math.min(score, bestScore);
                    }
                }
                return bestScore;
            }
        }

        function checkWinner(currentBoard) {
            for (const condition of winningConditions) {
                const [a, b, c] = condition;
                if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                    return currentBoard[a];
                }
            }
            return currentBoard.includes('') ? null : 'draw';
        }

        // Event Listeners
        playerVsPlayerButton.addEventListener('click', () => startGame('pvp'));
        playerVsComputerButton.addEventListener('click', () => {
            gameModeSelection.classList.add('hidden');
            difficultySelection.classList.remove('hidden');
            // Initialize the dropdown color on show
            updateDropdownColor(difficultyDropdown.value);
        });
        startComputerGameButton.addEventListener('click', () => {
            const selectedDifficulty = difficultyDropdown.value;
            startGame('pvc', selectedDifficulty);
        });
        cells.forEach(cell => cell.addEventListener('click', handleCellClick));
        playAgainButton.addEventListener('click', resetBoard);
        changeModeButton.addEventListener('click', backToMenu);

        // New function to update dropdown color
        const updateDropdownColor = (difficulty) => {
            // Remove previous color classes
            difficultyDropdown.classList.remove('bg-green-500', 'bg-blue-500', 'bg-gray-500', 'text-white');
            
            // Add new color class based on difficulty
            switch(difficulty) {
                case 'easy':
                    difficultyDropdown.classList.add('bg-green-500', 'text-white');
                    break;
                case 'medium':
                    difficultyDropdown.classList.add('bg-blue-500', 'text-white');
                    break;
                case 'unbeatable':
                    difficultyDropdown.classList.add('bg-gray-500', 'text-white');
                    break;
                default:
                    // Default to white background
                    difficultyDropdown.classList.add('bg-white', 'text-gray-700');
                    break;
            }
        };

        // Event listener for the dropdown's change event
        difficultyDropdown.addEventListener('change', (e) => {
            updateDropdownColor(e.target.value);
        });
