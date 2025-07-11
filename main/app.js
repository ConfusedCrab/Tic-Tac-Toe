document.addEventListener('DOMContentLoaded', function () {
  // Game State 
  let squares = Array(9).fill(null);
  let xIsNext = true;
  let winner = null;
  let winningLine = null;
  let gameOver = false;
  let isVsComputer = false;
  let aiMakingMove = false;
  let currentPlayer = 'X';


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
  const statusDisplay = document.getElementById('status');
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

  //   // for draw sound effect rest part in effect.js 
  //   window.drawSound = new Audio('assets/audio/draw.mp3');
  //   drawSound.volume = 0.7;
  //   drawSound.preload = 'auto';//  it ensures loaded early

  //   // for lose sound effect rest part in effect.js 
  // window.loseSound = new Audio('assets/audio/lose.mp3');
  // loseSound.volume = 0.6;
  // loseSound.preload = 'auto';

  // Taunts message List
  const tauntMessages = [
    "Nice try, human 🤖",
    "Try again, fleshbag 💀",
    "Ouch. That was too easy 🤖",
    "Zeroes and ones > your brain 🧠",
    "I'll be nice next time... maybe 🥱",
    "Not even close. Classic human move 😒",
    "You sure you're trying? 😂",
    "Reboot your brain and try again 🧠🔋",
    "You're lucky I'm in easy mode 🐣",
    "Next time, bring a challenge 😎",
    "Next time, try using both hands. 🫠",
    "Was that your strategy, or a cry for help? 😬",
    "You call that a move? I've seen toddlers plan better",
    "Bro brought a spoon to a gunfight 🍽️🔫",
    "You just got outplayed by a tutorial 😎",
    "That wasn’t a game. That was a free lesson",
    "Hope you kept the receipt for that strategy. It’s broken.",
    "This wasn’t a win. This was a mercy kill. 💀",
    "You just opened the center. Rookie mistake."
  ];

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
    if (squares[index] || gameOver || (isVsComputer && !xIsNext && !aiMakingMove)) return;

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

      // Only celebrate if player wins (not AI)
      if (
        (!isVsComputer) ||                            // PvP mode
        (isVsComputer && winner === 'X')              // Player X beat AI
      ) {
        showWinEffect();  // 🎉 Celebrate
        setStatus('🏆', `Player ${winner} wins!`);
      }

      // checks and call lose animation
      if (isVsComputer && winner === 'O') {
        boardEl.classList.add('shake');  //  animation

        // playloseSound();  //sound effect 

        //  remove the shake class after it runs, to allow re-shaking
        setTimeout(() => {
          boardEl.classList.remove('shake');
          setStatus('🤖', 'Computer wins!');
        }, 500);

        //         try {
        //   window.loseSound.currentTime = 0;
        //   window.loseSound.play();
        // } catch (e) {
        //   console.warn('Lose sound error:', e);
        // }
        //  this line to taunt the player
        showTauntMessage(); // No message passed = random insult
      }

      highlightWinningSquares();    //animation
      saveGameHistory(winner);        //saving result

    } else if (squares.every(sq => sq !== null)) {
      // It's a draw
      gameOver = true;
      scores.draw++;
      setStatus('🤝', "It's a draw!");
      saveGameHistory(null);          // saving result
      drawEffect(boardEl, squareEls);           //animation
    } else {
      // Switch turns
      xIsNext = !xIsNext;
    }
    // Update UI
    updateStatus();
    updateScores();
    updateGameHistory();

    if (!gameOver) {
      if (isVsComputer && !xIsNext) {
        currentPlayer = 'O';
        setStatus('⏳', "Computer's turn...");
        setTimeout(makeComputerMove, 500);
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        setStatus('⏳', `Player ${currentPlayer}'s turn`);
      }
    }

  }

  // computer moves
  function makeComputerMove() {
    aiMakingMove = true; // Allow AI to "click"

    let difficulty = document.getElementById('difficulty').value;
    let emptyIndices = squares.map((val, i) => val === null ? i : null).filter(i => i !== null);
    if (emptyIndices.length === 0) {
      aiMakingMove = false;
      return;
    }

    let bestMove;

    switch (difficulty) {
      case 'easy':
        bestMove = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        break;

      case 'medium':
        bestMove = findBestImmediateMove('O') || findBestImmediateMove('X') ||
          emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        break;

      case 'hard':
        bestMove = minimax(squares, 'O').index;
        break;
    }

    if (bestMove != null) {
      let square = squareEls[bestMove];
      handleSquareClick(square);
    }

    aiMakingMove = false; // Done with AI move
  }

  // mediam mode 
  function findBestImmediateMove(player) {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = player;
        let win = checkWinner(squares);  //  pass the current state
        squares[i] = null;
        if (win === player) return i;
      }
    }
    return null;
  }
  // hard mode 
  function minimax(newBoard, player) {
    const availSpots = newBoard.map((v, i) => v === null ? i : null).filter(i => i !== null);
    const opponent = player === 'O' ? 'X' : 'O';

    const winner = checkWinner(newBoard);
    if (winner === 'O') return { score: 10 };
    if (winner === 'X') return { score: -10 };
    if (availSpots.length === 0) return { score: 0 };

    let moves = [];

    for (let i = 0; i < availSpots.length; i++) {
      let index = availSpots[i];
      let move = {};
      move.index = index;
      newBoard[index] = player;

      let result = minimax(newBoard, opponent);
      move.score = result.score;

      newBoard[index] = null;
      moves.push(move);
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = moves[i];
        }
      }
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = moves[i];
        }
      }
    }

    return bestMove;
  }

  function checkWinner(sq) {
    const result = calculateWinner(sq);
    return result ? result.winner : null;
  }

  function calculateWinner(sq) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]          // diags
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
    console.log("Reset called!");

    // Reset UI
    squareEls.forEach(sq => {
      sq.textContent = '';
      sq.className = 'square';
      sq.style.animationDelay = '';
      sq.style.visibility = ''; //  make sure square reappears
    });
    updateStatus();
    boardEl.classList.remove('shake');
    boardEl.classList.remove('draw-pop');
    boardEl.style.display = 'grid';
    newGameBtn.style.display = 'inline-block';
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

  function setStatus(icon, text = '') {
    statusDisplay.textContent = `${icon} ${text}`;
  }

  function updateStatus() {
    if (!gameOver) return; // don't update after game ends

    if (winner) {
      if (isVsComputer && winner === 'O') {
        setStatus('🤖', 'Computer wins!');
      } else {
        setStatus('🏆', `Player ${winner} wins!`);
      }
    } else if (gameOver) {
      setStatus('🤝', "It's a draw!");
    } else {
      if (isVsComputer) {
        if (currentPlayer === 'O') {
          setStatus('⏳', "Computer's turn...");
        } else {
          setStatus('⏳', `Your turn (X)`);
        }
      } else {
        setStatus('⏳', `Next player: Player ${currentPlayer} (${currentPlayer})`);
      }
    }

  }

  function updateScores() {
    playerXScoreEl.textContent = `${playerXName}: ${scores.X}`;
    playerOScoreEl.textContent = `${playerOName}: ${scores.O}`;
    drawsScoreEl.textContent = `Draws: ${scores.draw}`;
  }

  // open change name button
  function toggleNameInputs() {
    const show = nameInputsEl.classList.contains('hidden');
    nameInputsEl.classList.toggle('hidden', !show);
    gameHistoryEl.classList.add('hidden');
    changeNamesBtn.textContent = show ? 'Hide Names' : 'Change Names';
    showHistoryBtn.textContent = 'Game History';
  }

  // open game history
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

  // toggle between modes 
  function toggleVsComputerMode() {
    console.log("Mode changed!");


    stopFireworks(); // Stop the fire show


    isVsComputer = !isVsComputer;

    // Update button text
    vsComputerBtn.textContent = isVsComputer ? 'Switch to PvP' : 'Play vs Computer';

    // Toggle difficulty dropdown visibility
    const difficultyToggle = document.getElementById('difficulty-toggle');
    difficultyToggle.style.display = isVsComputer ? 'flex' : 'none';

    //  Reset just the scores 
    scores = {
      X: 0,
      O: 0,
      draw: 0
    };
    console.log("score reseted to 0 ");
    updateScores(); //  Refresh the UI
    // Reset game
    resetGame();
  }

  // message
  function showTauntMessage(message) {
    const toast = document.getElementById('taunt-toast');
    if (!toast) return;

    // If no specific message passed, pick a random one
    const msg = message || tauntMessages[Math.floor(Math.random() * tauntMessages.length)];

    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 400);
    }, 2500);
  }

});
