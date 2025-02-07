import { Cell } from "./types";

export function generateBoard(gridSize: number): Cell[][] {
  let board = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, count: 0 })));
  return board;
}