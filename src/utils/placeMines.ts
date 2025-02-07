import { Cell } from "./types";

export function placeMines(board: Cell[][], gridSize: number, numMines: number, firstClickX: number, firstClickY: number): Cell[][] {
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