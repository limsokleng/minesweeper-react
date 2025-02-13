import { revealEmptyCells } from "./revealEmptyCells";
import { checkWin } from "./checkWin";
import { revealAllMines } from "./revealAllMines";
import { placeMines } from "./placeMines";
import { MinePosition } from "./types";

export const revealCell = (
  x: number,
  y: number,
  board: any,
  setBoard: (board: any) => void,
  setGameOver: (gameOver: boolean) => void,
  setLastClickedMine: (mine: MinePosition | null) => void,
  setGameWon: (gameWon: boolean) => void,
  firstClick: boolean,
  setFirstClick: (firstClick: boolean) => void,
  setPoints: (points: number) => void,
  points: number,
  MAX_POINTS: number,
  WIN_POINTS: number,
  gridSize: number,
  numMines: number
) => {
  if (board[x][y].revealed || board[x][y].flagged) return;
  let newBoard = [...board];
  if (firstClick) {
    newBoard = placeMines(board, gridSize, numMines, x, y);
    setFirstClick(false);
  }
  if (newBoard[x][y].mine) {
    setGameOver(true);
    setLastClickedMine({ x, y });
    revealAllMines(newBoard, setBoard);
    return;
  }
  newBoard = revealEmptyCells(newBoard, x, y, gridSize);
  setBoard(newBoard);
  if (checkWin(newBoard)) {
    setGameWon(true);
    if (points < MAX_POINTS) {
      setPoints(Math.min(points + WIN_POINTS, MAX_POINTS));
    }
  }
};