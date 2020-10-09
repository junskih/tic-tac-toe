// Getting index of child node: https://stackoverflow.com/questions/5913927/get-child-node-index
"use strict";

// Player mark "enum"
const playerMarks = {
  X: "X",
  O: "O"
};

// Game module
const Game = (() => {
  let _isOver;
  let _isRoundOver;
  let _currRound;
  let _maxRound;
  let _isPlayerXTurn;
  let _isAgainstAI;
  
  const init = (e) => {
    // TODO: unnecessary "states"?
    _isOver = false;
    _isRoundOver = false;
    _currRound = 0;
    _maxRound = Display.getMaxRound();
    _isPlayerXTurn = true;
    _isAgainstAI = Display.isAgainstAI();

    Display.hideSettings();

    Board.setSize(Display.getBoardSize());
    Board.init();
    
    playerX.resetPoints();
    playerO.resetPoints();
    Display.updatePoints([playerX.getPoints(), playerO.getPoints()]);

    Display.toggleNameEditing();
    let names = Display.getPlayerNames();
    playerX.setName(names[0]);
    playerO.setName(names[1]);
    
    initRound();
  };
  
  const initRound = () => {
    Display.hideMessage();
    Board.reset();
    Display.renderBoard();
    _currRound++;
    Display.setRound(_currRound, _maxRound);
    Display.enableBoard();
  };
  
  const setBoardSize = (e) => {
    let oldSize = Board.getSize();
    let newSize = e.target.value
    Board.setSize(newSize);
    Display.setBoardSize(oldSize, newSize);
  };

  const addMark = (e) => {
    let child = e.target;
    if (child.className === "board-cell") {
      // Get index of cell
      let index = Array.prototype.indexOf.call(child.parentNode.children, child);

      if (Board.isEmptyAt(index)) {
        let mark = _isPlayerXTurn ? playerX.getMark() : playerO.getMark();
        Board.addMarkAt(mark, index);
        Display.renderBoard();

        if (Board.hasStraight()) {
          let roundWinner = _isPlayerXTurn ? playerX : playerO;
          endRound(roundWinner);
        } else if (Board.isFull()) {
          endRound();
        }
        _isPlayerXTurn = !_isPlayerXTurn;

        // TODO: add AI moves
        if (_isAgainstAI) {
          addAIMark();
        }
      }
    }
  };

  const addAIMark = () => {
    
    return;
  };
  
  const endRound = (roundWinner) => {
    Display.disableBoard();

    if (roundWinner) {
      roundWinner.addPoint();
      Display.updatePoints([playerX.getPoints(), playerO.getPoints()]);
    }

    if (_currRound === _maxRound) {
      end(roundWinner);
    } else {
      let message = roundWinner ? `${roundWinner.getName()} wins the round!` : `It's a draw!`;
      Display.showMessage(message);
      window.setTimeout(initRound, 1500);
    }
  };

  const end = (roundWinner) => {
    let message;
    let gameWinner = playerX.getPoints() > playerO.getPoints() ? playerX : playerO;
    gameWinner = playerX.getPoints() !== playerO.getPoints() ? gameWinner : null;

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
    Display.hideMessage();
    Board.reset();
    Display.renderBoard();
    Display.disableBoard();
    Display.showSettings();
    Display.updatePoints();
    Display.toggleNameEditing();
  };
  
  const isOver = () => _isOver;
  const getCurrRound = () => _currRound;
  const getMaxRound = () => _maxRound;
  
  return { init, initRound, end, reset, setBoardSize, addMark, isOver, getCurrRound, getMaxRound };
})();

// Board module
const Board = (() => {
  // TODO: get initial size from slider
  let _size = 3;
  let _marks;
  
  const getSize = () => _size;
  const getMarks = () => _marks;
  
  const setSize = (size) => {
    _size = size;
  };

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
  
  const hasStraight = () => {
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
  
  const isEmptyAt = (index) => {
    return _marks[index] === "";
  };
  
  const addMarkAt = (mark, index) => {
    _marks[index] = mark;
  };
  
  return { getSize, getMarks, setSize, init, reset, isFull, hasStraight, isEmptyAt, addMarkAt };
})();

// Display/DOM controller module
const Display = (() => {
  // TODO: get initial number of rounds from slider
  const _board = document.querySelector("#board");
  const _playerInfos = document.querySelectorAll(".player-info");
  const _roundInfo = document.querySelector("#round-info");
  const _controlContainers = document.querySelectorAll(".control-container");
  const _playerChoiceCheckbox = document.querySelector("#player-choice");
  const _roundLabel = document.querySelector("#round-label");
  const _roundSlider = document.querySelector("#round-slider");
  const _boardSizeLabel = document.querySelector("#board-size-label");
  const _boardSizeSlider = document.querySelector("#board-size-slider");
  const _startButton = document.querySelector("#start-button");
  const _message = document.querySelector("#message");
  
  const addListeners = () => {
    _roundSlider.addEventListener("input", updateMaxRoundLabel);
    _boardSizeSlider.addEventListener("input", Game.setBoardSize);
    _startButton.addEventListener("click", Game.init);
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
    _board.addEventListener("click", Game.addMark);
  };
  
  const disableBoard = () => {
    _board.removeEventListener("click", Game.addMark);
  };
  
  const renderBoard = () => {
    let marks = Board.getMarks();
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
  
  return { addListeners, getBoardSize, setBoardSize, getMaxRound, setMaxRound, setRound,
     enableBoard, disableBoard, renderBoard, showSettings, hideSettings, updatePoints,
     switchToStartButton, switchToResetButton, showMessage, hideMessage, toggleNameEditing,
     getPlayerNames, isAgainstAI };
})();

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

// Game logic is driven by player input
const playerX = Player(playerMarks.X);
const playerO = Player(playerMarks.O);
Display.addListeners();
