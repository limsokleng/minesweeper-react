import { useState, useEffect } from "react";
import "./Minesweeper.css";
import { generateBoard } from "./utils/generateBoard";
import { placeMines } from "./utils/placeMines";
import { revealEmptyCells } from "./utils/revealEmptyCells";
import { checkWin } from "./utils/checkWin";
import { flagNeighbors } from "./utils/flagNeighbors";
import { MinePosition } from "./utils/types";

const INITIAL_GRID_SIZE = 8;
const INITIAL_NUM_MINES = 10;

export default function Minesweeper() {
  const [gridSize, setGridSize] = useState(INITIAL_GRID_SIZE);
  const [numMines, setNumMines] = useState(INITIAL_NUM_MINES);
  const [board, setBoard] = useState(generateBoard(gridSize));
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [lastClickedMine, setLastClickedMine] = useState<MinePosition | null>(null);
  const [flagsLeft, setFlagsLeft] = useState(numMines);
  const [level, setLevel] = useState(1);
  const [highestLevel, setHighestLevel] = useState(() => {
    return parseInt(localStorage.getItem('highestLevel') || '1', 10);
  });

  useEffect(() => {
    if (gameWon) {
      const newLevel = level + 1;
      setLevel(newLevel);

      if (newLevel > highestLevel) {
        setHighestLevel(newLevel);
        localStorage.setItem('highestLevel', newLevel.toString());
      }
    }
  }, [gameWon]);

  const revealCell = (x: number, y: number) => {
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

  const revealNeighbors = (x: number, y: number) => {
    if (!board[x][y].revealed || board[x][y].count === 0) return;
    let flagCount = 0;
    let incorrectFlag = false;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        let nx = x + dx;
        let ny = y + dy;
        if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize) {
          if (board[nx][ny].flagged) {
            flagCount++;
            if (!board[nx][ny].mine) {
              incorrectFlag = true;
            }
          }
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
            if (newBoard[nx][ny].mine) {
              setGameOver(true);
              setLastClickedMine({ x: nx, y: ny });
              return;
            }
            newBoard = revealEmptyCells(newBoard, nx, ny, gridSize);
          }
        }
      }
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setGameWon(true);
      }
    } else if (incorrectFlag) {
      setGameOver(true);
      setLastClickedMine({ x, y });
    }
  };

  const handleFlagNeighbors = (x: number, y: number) => {
    const newBoard = flagNeighbors(board, x, y, gridSize, flagsLeft, setFlagsLeft);
    setBoard(newBoard);
  };

  const toggleFlag = (e: React.MouseEvent | React.TouchEvent, x: number, y: number) => {
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

  const nextLevel = () => {
    setGameWon(false);
    const newGridSize = gridSize + 1;
    const newNumMines = numMines + 2;
    setGridSize(newGridSize);
    setNumMines(newNumMines);
    setBoard(generateBoard(newGridSize));
    setGameOver(false);
    setFirstClick(true);
    setLastClickedMine(null);
    setFlagsLeft(newNumMines);
  };

  return (
    <div className="container">
      <header className="header">
        <img src="image/minesweeper.png" alt="Minesweeper Logo" className="logo" style={{ width: "350px", height: "auto" }} />
      </header>
      <h4 className="info" style={{textAlign: "center"}}>💣: {flagsLeft} | Difficulty: {level} | Highest Level: {highestLevel}</h4>
      {gameOver && (
        <div className="modal">
          <div className="modal-content">
            <h2>You Lose! ☠️</h2>
            <button onClick={newGame} className="reset-btn">Restart Game</button>
          </div>
        </div>
      )}
      {gameWon && (
        <div className="modal">
          <div className="modal-content">
            <h2>Congratulations!</h2>
            <p>You have won this level.</p>
            <button onClick={nextLevel} className="reset-btn">Next Level</button>
          </div>
        </div>
      )}
      <div className={`grid ${gameOver || gameWon ? "disabled" : ""}`} style={{ gridTemplateColumns: `repeat(${gridSize}, 50px)` }}>
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
                handleFlagNeighbors(x, y);
                toggleFlag(e, x, y);
              }}
              style={lastClickedMine?.x === x && lastClickedMine?.y === y ? { backgroundColor: "red" } : {}}
            >
              {cell.revealed && !cell.mine ? (cell.count > 0 ? cell.count : "") : cell.flagged ? "🚩" : ""}
              {lastClickedMine?.x === x && lastClickedMine?.y === y && cell.mine ? "💣" : ""}
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