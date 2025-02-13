import { revealCell } from "./revealCell";
import { MinePosition } from "./types";

export const useHint = (
  board: any,
  setBoard: (board: any) => void,
  setPoints: (points: number) => void,
  points: number,
  HINT_COST: number,
  gridSize: number,
  setGameOver: (gameOver: boolean) => void,
  setLastClickedMine: (mine: MinePosition | null) => void,
  setGameWon: (gameWon: boolean) => void,
  firstClick: boolean,
  setFirstClick: (firstClick: boolean) => void,
  MAX_POINTS: number,
  WIN_POINTS: number,
  numMines: number // Add numMines as the 15th argument
) => {
  if (points < HINT_COST) return;
  let unrevealedCells = [];
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!board[x][y].revealed && !board[x][y].flagged && !board[x][y].mine) {
        unrevealedCells.push({ x, y });
      }
    }
  }
  if (unrevealedCells.length > 0) {
    const randomCell = unrevealedCells[Math.floor(Math.random() * unrevealedCells.length)];
    revealCell(randomCell.x, randomCell.y, board, setBoard, setGameOver, setLastClickedMine, setGameWon, firstClick, setFirstClick, setPoints, points, MAX_POINTS, WIN_POINTS, gridSize, numMines);
    setPoints(points - HINT_COST);
  }
};