export interface Cell {
    mine: boolean;
    revealed: boolean;
    flagged: boolean;
    count: number;
  }
  
  export interface MinePosition {
    x: number;
    y: number;
  }