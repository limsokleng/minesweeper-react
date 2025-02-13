import { useState, useEffect } from "react";
import axios from "axios";
import "./Minesweeper.css";
import { generateBoard } from "./utils/generateBoard";
import { placeMines } from "./utils/placeMines";
import { revealEmptyCells } from "./utils/revealEmptyCells";
import { checkWin } from "./utils/checkWin";
import { flagNeighbors } from "./utils/flagNeighbors";
import { revealNeighbors } from "./utils/revealNeighbors";
import { revealAllMines } from "./utils/revealAllMines";
import { revealCell } from "./utils/revealCell";
import { useHint } from "./utils/useHint";
import { MinePosition } from "./utils/types";

const INITIAL_GRID_SIZE = 8;
const INITIAL_NUM_MINES = 10;
const MAX_POINTS = 250;
const WIN_POINTS = 25;
const HINT_COST = 50;

interface Score {
  highscore: number;
}

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
  const [highestLevel, setHighestLevel] = useState(0); // Initialize with 0
  const [points, setPoints] = useState(MAX_POINTS);

  useEffect(() => {
    // Fetch the highest level from the backend
    const fetchHighestLevel = async () => {
      try {
        const response = await axios.get("https://minesweeper-server-limsokleng-sokleng-lims-projects.vercel.app/api/highscore");
        if (response.data) {
          const highest = response.data.reduce((max: number, score: Score) => score.highscore > max ? score.highscore : max, 0);
          setHighestLevel(highest);
        }
      } catch (err) {
        console.error("Error fetching highest level", err);
      }
    };

    fetchHighestLevel();
  }, []);

  useEffect(() => {
    if (gameOver && level > highestLevel) {
      setHighestLevel(level);
      // Update the highest level in the backend
      axios.post("https://minesweeper-server-limsokleng-sokleng-lims-projects.vercel.app/api/highscore", { highscore: level })
        .then(response => {
          console.log("Highest level updated:", response.data);
        })
        .catch(err => {
          console.error("Error updating highest level", err);
        });
    }
  }, [gameOver]);

  const toggleFlag = (e: React.MouseEvent | React.TouchEvent, x: number, y: number) => {
    e.preventDefault();
    if (board[x][y].revealed || gameOver || gameWon) return;
    let newBoard = [...board];
    newBoard[x][y].flagged = !newBoard[x][y].flagged;
    setBoard(newBoard);
    setFlagsLeft(newBoard[x][y].flagged ? flagsLeft - 1 : flagsLeft + 1);
  };

  const handleFlagNeighbors = (x: number, y: number) => {
    const newBoard = flagNeighbors(board, x, y, gridSize, flagsLeft, setFlagsLeft);
    setBoard(newBoard);
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
    setPoints(MAX_POINTS);
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
    setLevel(level + 1);
    if (points < MAX_POINTS) {
      setPoints(Math.min(points + WIN_POINTS, MAX_POINTS));
    }
  };

  return (
    <div className="container">
      <header className="header">
        <img
          src="https://raw.githubusercontent.com/limsokleng/minesweeper-react/main/image/minesweeper.png"
          alt="Minesweeper Logo"
          className="logo"
          style={{ width: "350px", height: "auto" }}
        />
      </header>
      <h4 className="info" style={{ textAlign: "center" }}>💣: {flagsLeft} | Difficulty: {level} | Highest Level: {highestLevel} </h4>

      <button
        onClick={() =>
          useHint(
            board,
            setBoard,
            setPoints,
            points,
            HINT_COST,
            gridSize,
            setGameOver,
            setLastClickedMine,
            setGameWon,
            firstClick,
            setFirstClick,
            MAX_POINTS,
            WIN_POINTS,
            numMines
          )
        }
        className="hint-btn"
        disabled={points < HINT_COST || gameOver || gameWon}
        style={{ '--points': `${points}`, '--max-points': `${MAX_POINTS}` } as React.CSSProperties}
      >
        <span className="icon">🔍</span>
        <span style={{ fontSize: "12px" }}>Hints ({points}/{MAX_POINTS})</span>
      </button>



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
      <div className={`grid ${gameOver || gameWon ? "disabled" : ""}`} style={{ gridTemplateColumns: `repeat(${gridSize}, 30px)` }}>
        {board.map((row, x) =>
          row.map((cell, y) => (
            <button
              key={`${x}-${y}`}
              className={`cell ${cell.revealed ? (cell.mine ? (lastClickedMine?.x === x && lastClickedMine?.y === y ? "mine-hit" : "mine") : "revealed") : ""} ${cell.flagged ? "flagged" : ""}`}
              onClick={() => {
                if (board[x][y].revealed) {
                  revealNeighbors(board, x, y, gridSize, setBoard, setGameOver, setLastClickedMine, setGameWon);
                } else {
                  revealCell(x, y, board, setBoard, setGameOver, setLastClickedMine, setGameWon, firstClick, setFirstClick, setPoints, points, MAX_POINTS, WIN_POINTS, gridSize, numMines);
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