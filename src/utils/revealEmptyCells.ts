import { Cell } from "./types";

export function revealEmptyCells(board: Cell[][], x: number, y: number, gridSize: number): Cell[][] {
  let newBoard = board.map(row => row.map(cell => ({ ...cell })));
  let stack = [[x, y]];

  while (stack.length > 0) {
    let [cx, cy] = stack.pop()!;
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