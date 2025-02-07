import { Cell } from "./types";

export function flagNeighbors(board: Cell[][], x: number, y: number, gridSize: number, flagsLeft: number, setFlagsLeft: (flagsLeft: number) => void): Cell[][] {
  if (!board[x][y].revealed || board[x][y].count === 0) return board;
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
    return newBoard;
  }
  return board;
}