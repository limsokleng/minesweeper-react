import { useState, useEffect } from "react";
import "./Minesweeper.css";

const INITIAL_GRID_SIZE = 8;
const INITIAL_NUM_MINES = 10;

function generateBoard(gridSize) {
  let board = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 })));
  return board;
}

function placeMines(board, gridSize, numMines, firstClickX, firstClickY) {
  let newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let minesPlaced = 0;
  while (minesPlaced < numMines) {
    let x = Math.floor(Math.random() * gridSize);
    let y = Math.floor(Math.random() * gridSize);
    if (!newBoard[x][y].mine && !(x === firstClickX && y === firstClickY)) {
      newBoard[x][y].mine = true;
      minesPlaced++;
    }
  }
  
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!newBoard[x][y].mine) {
        let count = 0;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = x + dx;
            let ny = y + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && newBoard[nx][ny].mine) {
              count++;
            }
          }
        }
        newBoard[x][y].count = count;
      }
    }
  }
  return newBoard;
}

function revealEmptyCells(board, x, y, gridSize) {
  let newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let stack = [[x, y]];

  while (stack.length > 0) {
    let [cx, cy] = stack.pop();
    if (!newBoard[cx][cy].revealed && !newBoard[cx][cy].flagged) {
      newBoard[cx][cy].revealed = true;
      if (newBoard[cx][cy].count === 0) {
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            let nx = cx + dx;
            let ny = cy + dy;
            if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !newBoard[nx][ny].revealed) {
              stack.push([nx, ny]);
            }
          }
        }
      }
    }
  }
  return newBoard;
}

function checkWin(board) {
  return board.every(row => row.every(cell => cell.revealed || cell.mine));
}

export default function Minesweeper() {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [numMines, setNumMines] = useState(INITIAL_NUM_MINES);
  const [board, setBoard] = useState(generateBoard(gridSize));
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [lastClickedMine, setLastClickedMine] = useState(null);
  const [flagsLeft, setFlagsLeft] = useState(numMines);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (gameWon) {
      setGridSize(gridSize + 1);
      setNumMines(numMines + 2);
      setLevel(level + 1);
      setBoard(generateBoard(gridSize + 1));
      setGameOver(false);
      setGameWon(false);
      setFirstClick(true);
      setLastClickedMine(null);
      setFlagsLeft(numMines + 2);
    }
  }, [gameWon]);

  const revealCell = (x, y) => {
    if (gameOver || gameWon || board[x][y].revealed || board[x][y].flagged) return;
    let newBoard = [...board];
    if (firstClick) {
      newBoard = placeMines(board, gridSize, numMines, x, y);
      setFirstClick(false);
    }
    if (newBoard[x][y].mine) {
      setGameOver(true);
      setLastClickedMine({ x, y });
      return;
    }
    newBoard = revealEmptyCells(newBoard, x, y, gridSize);
    setBoard(newBoard);
    if (checkWin(newBoard)) {
      setGameWon(true);
    }
  };

  const revealNeighbors = (x, y) => {
    if (!board[x][y].revealed || board[x][y].count === 0) return;
    let flagCount = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let nx = x + dx;
        let ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && board[nx][ny].flagged) {
          flagCount++;
        }
      }
    }
    if (flagCount === board[x][y].count) {
      let newBoard = [...board];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let nx = x + dx;
          let ny = y + dy;
          if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !newBoard[nx][ny].flagged && !newBoard[nx][ny].revealed) {
            newBoard = revealEmptyCells(newBoard, nx, ny, gridSize);
          }
        }
      }
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setGameWon(true);
      }
    }
  };

  const flagNeighbors = (x, y) => {
    if (!board[x][y].revealed || board[x][y].count === 0) return;
    let remainingCells = 0;
    let flagCount = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let nx = x + dx;
        let ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          if (!board[nx][ny].revealed && !board[nx][ny].flagged) {
            remainingCells++;
          }
          if (board[nx][ny].flagged) {
            flagCount++;
          }
        }
      }
    }
    if (remainingCells + flagCount === board[x][y].count) {
      let newBoard = [...board];
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let nx = x + dx;
          let ny = y + dy;
          if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && !newBoard[nx][ny].revealed && !newBoard[nx][ny].flagged) {
            newBoard[nx][ny].flagged = true;
            setFlagsLeft(flagsLeft - 1);
          }
        }
      }
      setBoard(newBoard);
    }
  };

  const toggleFlag = (e, x, y) => {
    e.preventDefault();
    if (board[x][y].revealed || gameOver || gameWon) return;
    let newBoard = [...board];
    newBoard[x][y].flagged = !newBoard[x][y].flagged;
    setBoard(newBoard);
    setFlagsLeft(newBoard[x][y].flagged ? flagsLeft - 1 : flagsLeft + 1);
  };

  const newGame = () => {
    setGridSize(INITIAL_GRID_SIZE);
    setNumMines(INITIAL_NUM_MINES);
    setBoard(generateBoard(INITIAL_GRID_SIZE));
    setGameOver(false);
    setGameWon(false);
    setFirstClick(true);
    setLastClickedMine(null);
    setFlagsLeft(INITIAL_NUM_MINES);
    setLevel(1);
  };

  return (
    <div className="container">
      <header>
        <h1>Minesweeper</h1>
      </header>
      <p>Mines left: {flagsLeft} | Level: {level}</p>
      {gameOver && (
        <div className="modal">
          <div className="modal-content">
            <h2>You Lose!</h2>
            <button onClick={newGame} className="reset-btn">Restart Game</button>
          </div>
        </div>
      )}
      {gameWon && <p className="game-won">You Win!</p>}
      <div className={`grid ${gameOver || gameWon ? "disabled" : ""}`} style={{ gridTemplateColumns: `repeat(${gridSize}, 40px)` }}>
        {board.map((row, x) =>
          row.map((cell, y) => (
            <button
              key={`${x}-${y}`}
              className={`cell ${cell.revealed ? (cell.mine ? (lastClickedMine?.x === x && lastClickedMine?.y === y ? "mine-hit" : "mine") : "revealed") : ""} ${cell.flagged ? "flagged" : ""}`}
              onClick={() => {
                if (board[x][y].revealed) {
                  revealNeighbors(x, y);
                } else {
                  revealCell(x, y);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (board[x][y].revealed) {
                  flagNeighbors(x, y);
                } else {
                  toggleFlag(e, x, y);
                }
              }}
              style={lastClickedMine?.x === x && lastClickedMine?.y === y ? { backgroundColor: "red" } : {}}
            >
              {cell.revealed && !cell.mine ? (cell.count > 0 ? cell.count : "") : cell.flagged ? "🚩" : ""}
            </button>
          ))
        )}
      </div>
      <footer>
        <p>Created by Steve Lim</p>
      </footer>
    </div>
  );
}