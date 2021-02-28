// Getting index of child node: https://stackoverflow.com/questions/5913927/get-child-node-index
// Minimax algorithm for tic tac toe: https://www.freecodecamp.org/news/how-to-make-your-tic-tac-toe-game-unbeatable-by-using-the-minimax-algorithm-9d690bad4b37/
// Getting indexes of max elements: https://stackoverflow.com/questions/55284833/javascript-return-all-indexes-of-highest-values-in-an-array
// Finding object with max attribute: https://stackoverflow.com/questions/4020796/finding-the-max-value-of-an-attribute-in-an-array-of-objects
// Shuffling array: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
"use strict";

// Player mark "enum"
const playerMarks = {
  X: "X",
  O: "O"
};

// Player factory function
const Player = (mark) => {
  const _mark = mark;
  let _name;
  let _points = 0;
  
  const getMark = () => _mark;
  const getName = () => _name;
  const setName = (name) => _name = name;
  const getPoints = () => _points;
  const addPoint = () => _points++;
  const resetPoints = () => _points = 0;
  
  return { getMark, getName, setName, getPoints, addPoint, resetPoints };
};

// Board factory function (need multiple boards for minimax/negamax)
const Board = (marks) => {
  // TODO: get initial size from slider
  let _size = 3;
  let _marks = marks;
  
  const getSize = () => _size;
  const getMarks = () => _marks;
  const getMarkAt = (index) => _marks[index];
  const setSize = (size) => _size = size;

  const init = () => {
    _marks = [];
    for (let i = 0; i < _size ** 2; i++) {
      _marks.push("");
    }
  };
  
  const reset = () => {
    for (let i = 0; i < _size ** 2; i++) {
      _marks[i] = "";
    }
  };
  
  const isFull = () => {
    return _marks.indexOf("") === -1;
  };

  const isEmptyAt = (index) => {
    return _marks[index] === "";
  };
  
  const setMarkAt = (mark, index) => {
    _marks[index] = mark;
  };
  
  const hasStraight = () => {
    // Checks board of any size for winning states
    let prev, next;
    let rowStraight = false;
    let colStraight = false;
    let diagStraight = false;

    for (let i = 0; i < _size; i++) {
      // Rows
      for (let j = 0; j < _size - 1; j++) {
        prev = _marks[i * _size + j];
        next = _marks[i * _size + j + 1];
        rowStraight = prev === next && prev !== "";
        if (!rowStraight) break;
      }

      // Columns
      for (let j = 0; j < _size - 1; j++) {
        prev = _marks[i + j * _size];
        next = _marks[i + (j + 1) * _size];
        colStraight = prev === next && prev !== "";
        if (!colStraight) break;
      }

      if (rowStraight || colStraight) break;
    }

    // Diagonals
    if (!rowStraight && !colStraight) {
      for (let i = 0; i < _size - 1; i++) {
        prev = _marks[i + i * _size];
        next = _marks[(i + 1) + (i + 1) * _size];
        diagStraight = prev === next && prev !== "";
        if (!diagStraight) break;
      }

      if (!diagStraight) {
        for (let i = _size - 1; i > 0; i--) {
          prev = _marks[i + (_size - 1 - i) * _size];
          next = _marks[(i - 1) + (_size - 1 - (i - 1)) * _size];
          diagStraight = prev === next && prev !== "";
          if (!diagStraight) break;
        }
      }
    }

    return rowStraight || colStraight || diagStraight;
  };

  const hasStraightSimple = () => {
    // For 3x3 board only
    return (
      (_marks[0] == _marks[1] && _marks[1] == _marks[2] && _marks[0] != "") ||
      (_marks[3] == _marks[4] && _marks[4] == _marks[5] && _marks[3] != "") ||
      (_marks[6] == _marks[7] && _marks[7] == _marks[8] && _marks[6] != "") ||
      (_marks[0] == _marks[3] && _marks[3] == _marks[6] && _marks[0] != "") ||
      (_marks[1] == _marks[4] && _marks[4] == _marks[7] && _marks[1] != "") ||
      (_marks[2] == _marks[5] && _marks[5] == _marks[8] && _marks[2] != "") ||
      (_marks[0] == _marks[4] && _marks[4] == _marks[8] && _marks[0] != "") ||
      (_marks[2] == _marks[4] && _marks[4] == _marks[6] && _marks[2] != "")
      );
  };
  
  return { getSize, getMarks, getMarkAt, setSize, init, reset, isFull, isEmptyAt, setMarkAt, hasStraight, hasStraightSimple };
};

// Game module
const Game = (() => {
  const _board = Board(['','','','','','','','','']);
  const _playerX = Player(playerMarks.X);
  const _playerO = Player(playerMarks.O);

  let _isOver;
  let _currRound;
  let _maxRound;
  let _isPlayerXTurn;
  let _isAgainstAI;
  let _moves = new Map();
  
  const init = (e) => {
    // TODO: unnecessary "states"?
    _isOver = false;
    _currRound = 0;
    _maxRound = Display.getMaxRound();
    _isPlayerXTurn = true;
    _isAgainstAI = Display.isAgainstAI();

    Display.hideSettings();

    _board.setSize(Display.getBoardSize());
    _board.init();
    
    _playerX.resetPoints();
    _playerO.resetPoints();
    Display.updatePoints([_playerX.getPoints(), _playerO.getPoints()]);

    Display.toggleNameEditing();
    let names = Display.getPlayerNames();
    _playerX.setName(names[0]);
    _playerO.setName(names[1]);
    
    initRound();
  };
  
  const initRound = () => {
    _currRound++;
    _isPlayerXTurn = true;
    _board.reset();
    Display.hideMessage();
    Display.renderBoard(_board.getMarks());
    Display.setRound(_currRound, _maxRound);
    Display.highlightPlayerTurn(_isPlayerXTurn);
    Display.enableBoard();
  };
  
  const setBoardSize = (e) => {
    let oldSize = _board.getSize();
    let newSize = e.target.value
    _board.setSize(newSize);
    Display.setBoardSize(oldSize, newSize);
  };

  const handleBoardClick = (e) => {
    if (e.target.classList.contains('board-cell')) {
      let index = Array.prototype.indexOf.call(e.target.parentNode.children, e.target);
      addMark(index);
    } else {
      console.log('Board clicked but something went wrong');
    }
  };

  const addMark = (index) => {
    if (!_board.isEmptyAt(index)) return;

    let mark = _isPlayerXTurn ? _playerX.getMark() : _playerO.getMark();
    _board.setMarkAt(mark, index);
    Display.renderBoard(_board.getMarks());

    if (_board.hasStraight()) {
      let roundWinner = _isPlayerXTurn ? _playerX : _playerO;
      endRound(roundWinner);
    } else if (_board.isFull()) {
      endRound();
    } else {
      _isPlayerXTurn = !_isPlayerXTurn;
      Display.highlightPlayerTurn(_isPlayerXTurn);

      if (!_isPlayerXTurn && _isAgainstAI) {
        // Wait for player's mark to render
        setTimeout(addAIMark, 0);
      }
    }
  };

  const addAIMark = () => {
    Display.disableBoard();
    let index = minimax(_board, 0, true, -Infinity, Infinity);
    //let index = negamax(_board, 0, true, -Infinity, Infinity);
    addMark(index);
    Display.enableBoard();
  };

  // This doesnt work well for whatever reason
  /*
  const negamax = (board, depth, maximize, alpha, beta) => {
    if (depth === 0) _moves.clear();
    
    // Terminal node, return node value
    if (board.hasStraight()) {
      return maximize ? 100 - depth : depth - 100;
    } else if (board.isFull()) {
      return 0;
    }

    // Non-terminal node
    let value;
    let player;
    let newBoard;

    for (const [index, mark] of board.getMarks().entries()) {
      if (mark !== '') continue;
      value = -Infinity;
      player = maximize ? _playerX : _playerO;

      // Simulate next move on new board
      newBoard = Board(board.getMarks());
      newBoard.setMarkAt(player.getMark(), index);

      // Continue recursion
      value = Math.max(value, -negamax(newBoard, depth + 1, !maximize, -beta, -alpha));
      newBoard.setMarkAt('', index);

      // Prune unnecessary branches
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;

      if (depth === 0) _moves.set(index, value);
    }

    // Choose move with highest score and return its index
    if (depth === 0) {
      let bestScore = -Infinity;
      let bestMoves = [];

      for (let [key, value] of _moves) {
        if (value > bestScore) {
          bestScore = value;
          bestMoves = [];
          bestMoves.push(key);
        } else if (value === bestScore) {
          bestMoves.push(key);
        }
      }
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    // At lower depths return node value
    return value;
  };
  */

  const minimax = (board, depth, maximize, alpha, beta) => {
    if (depth === 0) _moves.clear();

    // Terminal node, return node value
    if (board.hasStraight()) {
      if (maximize) return 100 - depth;
      return depth - 100;
    } else if (board.isFull()) {
      return 0;
    }

    // Non-terminal node
    let value;
    let player;
    let newBoard;

    for (const [index, mark] of board.getMarks().entries()) {
      if (mark !== '') continue;
      value = maximize ? Infinity : -Infinity;
      player = maximize ? _playerX : _playerO;

      // Simulate next move on new board
      newBoard = Board(board.getMarks());
      newBoard.setMarkAt(player.getMark(), index);
      
      // Continue recursion
      value = maximize ? Math.min(value, minimax(board, depth + 1, alpha, beta, true))
      : Math.max(value, minimax(board, depth + 1, alpha, beta, false));

      newBoard.setMarkAt('', index);
      if (depth === 0) _moves.set(index, value);

      // Prune unnecessary branches
      if (maximize) {
        beta = Math.min(beta, value);
      } else {
        alpha = Math.max(alpha, value);
      }
      if (alpha >= beta) break;
    }

    // Choose move with highest score and return its index
    if (depth === 0) {
      let bestScore = -Infinity;
      let bestMoves = [];

      for (let [key, value] of _moves) {
        if (value > bestScore) {
          bestScore = value;
          bestMoves = [];
          bestMoves.push(key);
        } else if (value === bestScore) {
          bestMoves.push(key);
        }
      }
      // If multiple moves of same value, choose at random
      return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    }
    // At lower depths return node value
    return value;
  };
  
  const endRound = (roundWinner=undefined) => {
    Display.disableBoard();

    if (roundWinner) {
      roundWinner.addPoint();
      Display.updatePoints([_playerX.getPoints(), _playerO.getPoints()]);
    }

    if (_currRound === _maxRound) {
      end(roundWinner);
    } else {
      let message = roundWinner ? `${roundWinner.getName()} wins the round!` : `It's a draw!`;
      Display.showMessage(message);
      window.setTimeout(initRound, 2000);
    }
  };

  const end = (roundWinner=undefined) => {
    let message;
    let gameWinner = _playerX.getPoints() > _playerO.getPoints() ? _playerX : _playerO;
    gameWinner = _playerX.getPoints() !== _playerO.getPoints() ? gameWinner : null;

    if (!roundWinner && !gameWinner) {
      message = `The game is a draw!`;
    } else if (!roundWinner && gameWinner) {
      message = `The round is a draw but ${gameWinner.getName()} wins the game!`;
    } else if (roundWinner && !gameWinner) {
      message = `${roundWinner.getName()} wins the round, but the game is a draw!`;
    } else if (roundWinner && roundWinner !== gameWinner) {
      message = `${roundWinner.getName()} wins the round, but ${gameWinner.getName()} wins the game!`;
    } else if (roundWinner === gameWinner) {
      message = `${roundWinner.getName()} wins the round and the game!`;
    }
    Display.showMessage(message);
  };
  
  const reset = (e) => {
    Display.clearPlayerTurnHighlight();
    Display.hideMessage();
    _board.reset();
    Display.renderBoard(_board.getMarks());
    Display.disableBoard();
    Display.showSettings();
    Display.updatePoints();
    Display.toggleNameEditing();
  };
  
  const isOver = () => _isOver;
  const getCurrRound = () => _currRound;
  const getMaxRound = () => _maxRound;
  
  return { init, initRound, end, reset, setBoardSize, handleBoardClick, addMark, isOver, getCurrRound, getMaxRound };
})();

// Display/DOM controller module
const Display = (() => {
  // TODO: get initial number of rounds from slider
  const _board = document.querySelector("#board");
  const _playerInfos = document.querySelectorAll(".player-info");
  const _playerNames = document.querySelectorAll(".player-name");
  const _roundInfo = document.querySelector("#round-info");
  const _controlContainers = document.querySelectorAll(".control-container");
  const _playerCounts = document.querySelectorAll(".player-count");
  const _playerChoiceCheckbox = document.querySelector("#player-choice");
  const _roundLabel = document.querySelector("#round-label");
  const _roundSlider = document.querySelector("#round-slider");
  const _boardSizeLabel = document.querySelector("#board-size-label");
  const _boardSizeSlider = document.querySelector("#board-size-slider");
  const _startButton = document.querySelector("#start-button");
  const _message = document.querySelector("#message");
  
  const init = () => {
    _playerChoiceCheckbox.addEventListener("input", highlightPlayerCount);
    _roundSlider.addEventListener("input", updateMaxRoundLabel);
    _boardSizeSlider.addEventListener("input", Game.setBoardSize);
    _startButton.addEventListener("click", Game.init);
    
    highlightPlayerCount();
  };

  const getBoardSize = () => {
    return _boardSizeSlider.value;
  };

  const updateMaxRoundLabel = (e) => {
    _roundLabel.textContent = `Rounds: ${e.target.value}`;
  };
  
  const setBoardSize = (oldSize, newSize) => {
    // Add/remove as many board cells as required
    let diff = newSize ** 2 - oldSize ** 2;

    for (let i = 0; i < Math.abs(diff); i++) {
      if (diff < 0) {
        _board.removeChild(_board.lastChild);
      } else {
        let cell = document.createElement("div");
        _board.appendChild(cell).className = "board-cell";
      }
    }
    _board.style.setProperty("--board-size", newSize);
    _boardSizeLabel.textContent = `Board size: ${newSize}`;
  };
  
  const getMaxRound = () => {
    return parseInt(_roundSlider.value);
  };

  const setMaxRound = (newMaxRound) => {
    _roundLabel.textContent = `Rounds: ${newMaxRound}`;
    _roundInfo.textContent = `Round 0/${newMaxRound}`;
  };
  
  const setRound = (currRound, maxRound) => {
    _roundInfo.textContent = `Round ${currRound}/${maxRound}`;
  };
  
  const enableBoard = () => {
    _board.addEventListener("click", Game.handleBoardClick);
  };
  
  const disableBoard = () => {
    _board.removeEventListener("click", Game.handleBoardClick);
  };
  
  const renderBoard = (marks) => {
    let cells = _board.querySelectorAll(".board-cell");
    for (let i = 0; i < marks.length; i++) {
      cells[i].textContent = marks[i];
    }
  };
  
  const showSettings = () => {
    _controlContainers.forEach(container => {
      container.style.setProperty("display", "flex");
    });
    _roundInfo.style.setProperty("display", "none");
    switchToStartButton();
  };
  
  const hideSettings = () => {
    _controlContainers.forEach(container => {
      container.style.setProperty("display", "none");
    });
    _roundInfo.style.setProperty("display", "block");
    switchToResetButton();
  };

  const highlightPlayerCount = () => {
    let onIndex = _playerChoiceCheckbox.checked ? 1 : 0;
    let offIndex = !_playerChoiceCheckbox.checked ? 1 : 0;
    _playerCounts[onIndex].classList.add("player-count--active");
    if (_playerCounts[offIndex].classList.contains("player-count--active")) {
      _playerCounts[offIndex].classList.remove("player-count--active");
    }
  };

  const highlightPlayerTurn = (isPlayerXTurn) => {
    let onIndex = isPlayerXTurn ? 0 : 1;
    let offIndex = !isPlayerXTurn ? 0 : 1;
    _playerNames[onIndex].classList.add("player-name--active");
    if (_playerNames[offIndex].classList.contains("player-name--active")) {
      _playerNames[offIndex].classList.remove("player-name--active");
    }
  };

  const clearPlayerTurnHighlight = () => {
    _playerNames.forEach(playerName => {
      if (playerName.classList.contains("player-name--active")) {
        playerName.classList.remove("player-name--active");
      }
    });
  };

  const switchToStartButton = () => {
    _startButton.removeEventListener("click", Game.reset);
    _startButton.addEventListener("click", Game.init);
    _startButton.textContent = "Play";
  };

  const switchToResetButton = () => {
    _startButton.removeEventListener("click", Game.init);
    _startButton.addEventListener("click", Game.reset);
    _startButton.textContent = "Reset";
  };
  
  const updatePoints = (points) => {
    for (let i = 0; i < _playerInfos.length; i++) {
      let text = points ? `${points[i]} points`: "";
      _playerInfos[i].lastElementChild.textContent = text;
    }
  };

  const showMessage = (message) => {
    _message.textContent = message;
    _message.style.visibility = "visible";
  };

  const hideMessage = () => {
    _message.style.visibility = "hidden";
  };

  const toggleNameEditing = () => {
    _playerInfos.forEach(playerInfo => {
      let playerName = playerInfo.firstElementChild;
      playerName.setAttribute("contenteditable", (!playerName.isContentEditable).toString());
      if (playerName.isContentEditable && playerName.classList.contains("player-name--hover-disabled")) {
        playerName.classList.remove("player-name--hover-disabled");
      } else {
        playerName.classList.add("player-name--hover-disabled");
      }
    });
  };

  const getPlayerNames = () => {
    return Array.from(_playerInfos).map(playerInfo => {
      return playerInfo.firstElementChild.textContent;
    });
  };
  
  const isAgainstAI = () => {
    return !_playerChoiceCheckbox.checked;
  };
  
  return { init, getBoardSize, setBoardSize, getMaxRound, setMaxRound, setRound,
     enableBoard, disableBoard, renderBoard, showSettings, hideSettings, updatePoints,
     highlightPlayerCount, highlightPlayerTurn, clearPlayerTurnHighlight,
     switchToStartButton, switchToResetButton, showMessage, hideMessage, toggleNameEditing,
     getPlayerNames, isAgainstAI };
})();

Display.init();
           