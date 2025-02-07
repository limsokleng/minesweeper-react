import { Cell } from "./types";

export function checkWin(board: Cell[][]): boolean {
  return board.every(row => row.every(cell => cell.revealed || cell.mine));
}