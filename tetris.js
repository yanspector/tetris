// Tetris game logic moved from HTML to JS file
// https://tetris.fandom.com/wiki/Tetris_Guideline

document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const canvas = document.getElementById('game');
  const context = canvas.getContext('2d');
  const grid = 32;
  const tetrominoSequence = [];
  const playfield = [];
  let score = 0;
  const scoreElem = document.getElementById('score');
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  const tetrominos = {
    'I': [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    'J': [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    'L': [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    'O': [
      [1,1],
      [1,1],
    ],
    'S': [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    'Z': [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ],
    'T': [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ]
  };
  const colors = {
    'I': '#00faff',
    'O': '#ffe600',
    'T': '#a020f0',
    'S': '#00ff7f',
    'Z': '#ff0055',
    'J': '#0055ff',
    'L': '#ff9900'
  };

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }

  function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
      generateSequence();
    }
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;
    return {
      name: name,
      matrix: matrix,
      row: row,
      col: col
    };
  }

  function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
    return result;
  }

  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
            cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            playfield[cellRow + row][cellCol + col])
          ) {
          return false;
        }
      }
    }
    return true;
  }

  function placeTetromino() {
    let linesCleared = 0;
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          if (tetromino.row + row < 0) {
            return showGameOver();
          }
          playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
        }
      }
    }
    for (let row = playfield.length - 1; row >= 0; ) {
      if (playfield[row].every(cell => !!cell)) {
        linesCleared++;
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < playfield[r].length; c++) {
            playfield[r][c] = playfield[r-1][c];
          }
        }
      }
      else {
        row--;
      }
    }
    if (linesCleared > 0) {
      score += [0, 40, 100, 300, 1200][linesCleared]; // Tetris scoring
      scoreElem.textContent = 'Score: ' + score;
    }
    tetromino = getNextTetromino();
  }

  function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
  context.fillStyle = '#222';
  context.globalAlpha = 0.85;
  context.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
  context.globalAlpha = 1;
  context.fillStyle = '#0ff';
  context.font = 'bold 36px Segoe UI, monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  context.font = 'bold 24px Segoe UI, monospace';
  context.fillStyle = '#fff';
  context.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 32);
  }

  let count = 0;
  let tetromino = getNextTetromino();
  let rAF = null;
  let gameOver = false;
  function loop() {
    rAF = requestAnimationFrame(loop);

  stopBtn.addEventListener('click', function() {
    if (rAF) {
      cancelAnimationFrame(rAF);
      rAF = null;
    }
    context.fillStyle = '#222';
    context.globalAlpha = 0.85;
    context.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
    context.globalAlpha = 1;
    context.fillStyle = '#0ff';
    context.font = 'bold 36px Segoe UI, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('Game Stopped', canvas.width / 2, canvas.height / 2);
  });

  startBtn.addEventListener('click', function() {
    // Reset playfield
    for (let row = -2; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
      }
    }
    score = 0;
    scoreElem.textContent = 'Score: 0';
    tetrominoSequence.length = 0;
    tetromino = getNextTetromino();
    gameOver = false;
    count = 0;
    if (!rAF) {
      rAF = requestAnimationFrame(loop);
    }
  });
    context.clearRect(0,0,canvas.width,canvas.height);
    // Draw background
    context.fillStyle = '#181818';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
          const name = playfield[row][col];
          context.shadowColor = '#fff';
          context.shadowBlur = 8;
          context.fillStyle = colors[name];
          context.fillRect(col * grid, row * grid, grid-2, grid-2);
          context.shadowBlur = 0;
        }
      }
    }
    if (tetromino) {
      if (++count > 35) {
        tetromino.row++;
        count = 0;
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
          tetromino.row--;
          placeTetromino();
        }
      }
      context.fillStyle = colors[tetromino.name];
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
            context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
          }
        }
      }
    }
  }
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
    if (e.which === 37 || e.which === 39) {
      const col = e.which === 37
        ? tetromino.col - 1
        : tetromino.col + 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
    if (e.which === 38) {
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
    if(e.which === 40) {
      const row = tetromino.row + 1;
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
      }
      tetromino.row = row;
    }
  });
  rAF = requestAnimationFrame(loop);
});
