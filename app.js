document.addEventListener('DOMContentLoaded', function () {
  // Game State 
  let squares = Array(9).fill(null);
  let xIsNext = true;
  let winner = null;
  let winningLine = null;
  let gameOver = false;
  let isVsComputer = false;

  // --- Player Info ---
  let playerXName = 'Player X';
  let playerOName = 'Player O';

  // --- Scores ---
  let scores = { X: 0, O: 0, draw: 0 };

  // --- History ---
  let gameHistory = [];

  // --- DOM Elements ---
  const boardEl = document.querySelector('.board');
  const squareEls = document.querySelectorAll('.square');
  const statusEl = document.getElementById('status');
  const playerXScoreEl = document.getElementById('player-x-score');
  const playerOScoreEl = document.getElementById('player-o-score');
  const drawsScoreEl = document.getElementById('draws-score');
  const newGameBtn = document.getElementById('new-game');
  const changeNamesBtn = document.getElementById('change-names');
  const showHistoryBtn = document.getElementById('show-history');
  const nameInputsEl = document.getElementById('name-inputs');
  const gameHistoryEl = document.getElementById('game-history');
  const historyListEl = document.getElementById('history-list');
  const resetAllBtn = document.getElementById('reset-all');
  const playerXNameInput = document.getElementById('player-x-name');
  const playerONameInput = document.getElementById('player-o-name');
  const vsComputerBtn = document.getElementById('vs-computer-btn');


  // Define this once globally 
  // for win sound effect rest part in effect.js 
  window.winAudio = new Audio('assets/audio/win-sound.mp3');
  winAudio.volume = 0.7;
  winAudio.preload = 'auto';//  it ensures loaded early

  // Init
  initGame();
  function initGame() {
    // Add event listeners
    squareEls.forEach(square => {
      square.addEventListener('click', () => handleSquareClick(square));
    });

    newGameBtn.addEventListener('click', resetGame);
    changeNamesBtn.addEventListener('click', toggleNameInputs);
    showHistoryBtn.addEventListener('click', toggleGameHistory);
    resetAllBtn.addEventListener('click', resetScores);
    playerXNameInput.addEventListener('input', updatePlayerXName);
    playerONameInput.addEventListener('input', updatePlayerOName);
    vsComputerBtn.addEventListener('click', toggleVsComputerMode);
    // Update UI
    updateStatus();
    updateScores();
  }

  function handleSquareClick(square) {
    const index = square.dataset.index;
    // Return if square is already filled or game is over
    if (squares[index] || gameOver) return;
    // Update game state
    squares[index] = xIsNext ? 'X' : 'O';
    // Update UI
    square.textContent = squares[index];
    square.classList.add(squares[index].toLowerCase());
    // Check for winner
    const result = calculateWinner(squares);
    if (result) {
      winner = result.winner;
      winningLine = result.line;
      gameOver = true;
      // Update scores and history
      scores[winner]++;
      showWinEffect();           //animation
      highlightWinningSquares();    //animation
      saveGameHistory(winner);        //saving result
    } else if (squares.every(sq => sq !== null)) {
      // It's a draw
      gameOver = true;
      scores.draw++;
      shakeBoard();   //animation
      saveGameHistory(null);    // saving result
    } else {
      // Switch turns
      xIsNext = !xIsNext;
    }
    // Update UI
    updateStatus();
    updateScores();
    updateGameHistory();

    if (!gameOver && isVsComputer && !xIsNext) {
      setTimeout(makeComputerMove, 500);
    }
  }

  // computer moves
  function makeComputerMove() {
    let emptyIndices = squares.map((val, i) => val === null ? i : null).filter(v => v !== null);
    if (emptyIndices.length === 0) return;

    let randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    let square = squareEls[randomIndex];
    handleSquareClick(square);
  }

  function calculateWinner(sq) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let [a, b, c] of lines) {
      if (sq[a] &&
        sq[a] === sq[b] &&
        sq[a] === sq[c]
      ) {
        return {
          winner: sq[a],
          line: [a, b, c]
        };
      }
    }
    return null;
  }

  // animation
  function highlightWinningSquares() {
    winningLine.forEach(i => {
      squareEls[i].classList.add('winning');
    });
  }

  //animation
  function showWinEffect() {
    confettiEffect();
  }
  // animation
  function shakeBoard() {
    boardEl.classList.add('shake');
    setTimeout(() => boardEl.classList.remove('shake'), 500);
  }

  function resetGame() {
    stopFireworks(); //  stop the fire show

    // Reset game state
    squares = Array(9).fill(null);
    xIsNext = true;
    winner = null;
    winningLine = null;
    gameOver = false;
    // Reset UI
    squareEls.forEach(sq => {
      sq.textContent = '';
      sq.className = 'square';
    });
    updateStatus();
  }

  function resetScores() {
    scores = {
      X: 0,
      O: 0,
      draw: 0
    };
    gameHistory = [];
    updateScores();
    updateGameHistory();
  }

  function updatePlayerXName(e) {
    playerXName = e.target.value;
    updateStatus();
    updateScores();
  }

  function updatePlayerOName(e) {
    playerOName = e.target.value;
    updateStatus();
    updateScores();
  }

  function updateStatus() {
    if (winner) {
      statusEl.textContent = `Winner: ${winner === 'X' ? playerXName : playerOName}`;
    } else if (gameOver) {
      statusEl.textContent = "It's a draw!";
    } else {
      const nextPlayer = xIsNext ? playerXName : playerOName;
      const symbol = xIsNext ? 'X' : 'O';
      statusEl.textContent = `Next player: ${nextPlayer} (${symbol})`;
    }
  }

  function updateScores() {
    playerXScoreEl.textContent = `${playerXName}: ${scores.X}`;
    playerOScoreEl.textContent = `${playerOName}: ${scores.O}`;
    drawsScoreEl.textContent = `Draws: ${scores.draw}`;
  }

  function toggleNameInputs() {
    const show = nameInputsEl.classList.contains('hidden');
    nameInputsEl.classList.toggle('hidden', !show);
    gameHistoryEl.classList.add('hidden');
    changeNamesBtn.textContent = show ? 'Hide Names' : 'Change Names';
    showHistoryBtn.textContent = 'Game History';
  }

  function toggleGameHistory() {
    const show = gameHistoryEl.classList.contains('hidden');
    gameHistoryEl.classList.toggle('hidden', !show);
    nameInputsEl.classList.add('hidden');
    showHistoryBtn.textContent = show ? 'Hide History' : 'Game History';
    changeNamesBtn.textContent = 'Change Names';
    updateGameHistory();
  }

  function updateGameHistory() {
    // Clear history list
    historyListEl.innerHTML = '';
    if (gameHistory.length === 0) {
      historyListEl.innerHTML = '<li class="empty-history">No games played yet</li>';
      return;
    }
    // Add history items
    gameHistory.forEach(game => {
      const li = document.createElement('li');
      const resultSpan = document.createElement('span');
      resultSpan.textContent = game.winner ? `${game.winner} won` : 'Draw';
      const dateSpan = document.createElement('span');
      dateSpan.textContent = game.date;
      dateSpan.className = 'history-date';
      li.appendChild(resultSpan);
      li.appendChild(dateSpan);
      historyListEl.appendChild(li);
    });
  }

  function saveGameHistory(winnerSymbol) {
    const winnerName = winnerSymbol === 'X' ? playerXName : (winnerSymbol === 'O' ? playerOName : null);
    const result = { winner: winnerName, date: new Date().toLocaleTimeString() };
    gameHistory.unshift(result);
    gameHistory = gameHistory.slice(0, 10);
  }

  function toggleVsComputerMode() {
    stopFireworks(); // 🔥 stop the fire show
    isVsComputer = !isVsComputer;
    vsComputerBtn.textContent = isVsComputer ? 'Switch to PvP' : 'Play vs Computer';
    resetGame();
  }

});
