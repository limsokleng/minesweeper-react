import { revealEmptyCells } from "./revealEmptyCells";
import { checkWin } from "./checkWin";
import { revealAllMines } from "./revealAllMines";

export const revealNeighbors = (
  board: any,
  x: number,
  y: number,
  gridSize: number,
  setBoard: (board: any) => void,
  setGameOver: (gameOver: boolean) => void,
  setLastClickedMine: (mine: { x: number; y: number } | null) => void,
  setGameWon: (gameWon: boolean) => void
) => {
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
  if (flagCount !== board[x][y].count) return; // Ensure the function only triggers when the number of flagged cells matches the number on the cell
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
            revealAllMines(newBoard, setBoard);
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
    revealAllMines(board, setBoard);
  }
};