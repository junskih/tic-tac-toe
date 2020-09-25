"use strict";

// Player mark "enum"
const playerMarks = {
  X: "X",
  O: "O"
};

// Game module
const Game = (() => {
  let _isOver = false;
  let _currRound = 0;
  let _maxRound = 0;
  let _isAgainstAI = false;
  
  const initGame = (e) => {
    _isOver = false;
    _currRound = 0;
    _isAgainstAI = Display.isAgainstAI();
    
    playerX.resetPoints();
    playerO.resetPoints();
    Display.updatePoints();
    
    Display.hideSettings();
    
    initRound();
  };
  
  const initRound = () => {
    Board.reset();
    Display.renderBoard();
    _currRound++;
    Display.setRound(_currRound, _maxRound);
  };
  
  const resetGame = () => {
    // Display/hide elements
    // Disable board clicks
    return;
  };
  
  const setBoardSize = (e) => {
    let oldSize = Board.getSize();
    let newSize = e.target.value
    Board.setSize(newSize);
    Display.setBoardSize(oldSize, newSize);
  };
  
  const isOver = () => _isOver;
  const getCurrRound = () => _currRound;
  const getMaxRound = () => _maxRound;
  
  const setMaxRound = (e) =>  {
    let newMaxRound = e.target.value;
    _maxRound = newMaxRound;
    Display.setMaxRound(newMaxRound);
  };
  
  return { initGame, initRound, resetGame, setBoardSize, isOver, getCurrRound, getMaxRound, setMaxRound };
})();

// Board module
const Board = (() => {
  let _size = 3;
  let _marks = [];
  
  const getSize = () => _size;
  const getMarks = () => _marks;
  
  const setSize = (size) => {
    _size = size;
  };
  
  const reset = () => {
    for (let i = 0; i < _size ** 2; i++) {
      _marks[i] = "";
    }
  };
  
  const isFull = () => {
    // ...
    return;
  };
  
  const hasStraight = () => {
    // ...
    return;
  };
  
  const isEmptyAt = (index) => {
    // ...
    return;
  };
  
  const addMarkAt = (mark, index) => {
    return;
  };
  
  return { getSize, getMarks, setSize, reset, isFull, hasStraight, isEmptyAt, addMarkAt };
})();

// Display/DOM controller module
const Display = (() => {
  const _board = document.querySelector("#board");
  const _playerInfoArray = document.querySelectorAll(".player-info");
  const _roundInfo = document.querySelector("#round-info");
  const _playerChoiceCheckbox = document.querySelector("#player-choice");
  const _roundLabel = document.querySelector("#round-label");
  const _roundSlider = document.querySelector("#round-slider");
  const _boardSizeLabel = document.querySelector("#board-size-label");
  const _boardSizeSlider = document.querySelector("#board-size-slider");
  const _startButton = document.querySelector("#start-button");
  
  const addListeners = () => {
    _roundSlider.addEventListener("input", Game.setMaxRound);
    _boardSizeSlider.addEventListener("input", Game.setBoardSize);
    _startButton.addEventListener("click", Game.initGame);
  };
  
  const setBoardSize = (oldSize, newSize) => {
    // Add/remove board cells
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
  
  const setMaxRound = (newMaxRound) => {
    _roundLabel.textContent = `Rounds: ${newMaxRound}`;
    _roundInfo.textContent = `Round 0/${newMaxRound}`;
  };
  
  const setRound = (currRound, maxRound) => {
    _roundInfo.textContent = `Round ${currRound}/${maxRound}`;
  };
  
  const enableBoard = () => {
    // Allow player input, add listener
    return;
  };
  
  const disableBoard = () => {
    // Disallow player input, remove listener
    return;
  };
  
  const renderBoard = () => {
    let marks = Board.getMarks();
    let cells = _board.querySelectorAll(".board-cell");
    
    for (let i = 0; i < marks.length; i++) {
      console.log(cells[i]);
    }
  };
  
  const showSettings = () => {
    return;
  };
  
  const hideSettings = () => {
    return;
  };
  
  const updatePoints = (xPoints, yPoints) => {
    // For each player info...
    return;
  };
  
  const isAgainstAI = () => {
    return _playerChoiceCheckbox.checked;
  };
  
  return { addListeners, setBoardSize, setMaxRound, setRound, enableBoard, disableBoard, renderBoard, showSettings, hideSettings, updatePoints, isAgainstAI };
})();

// Player factory function
const Player = (mark) => {
  const _mark = mark;
  let _name;
  let _points = 0;
  let _hasTurn = false;
  
  const getMark = () => _mark;
  const getName = () => _name;
  const setName = (name) => _name = name;
  const getPoints = () => _points;
  const addPoint = () => _points++;
  const resetPoints = () => _points = 0;
  const hasTurn = () => _hasTurn;
  const switchTurn = () => _hasTurn = !_hasTurn;
  
  return { getMark, getName, setName, getPoints, addPoint, resetPoints, hasTurn, switchTurn };
};

// Game logic is driven by player input
const playerX = Player(playerMarks.X);
const playerO = Player(playerMarks.O);
Display.addListeners();
