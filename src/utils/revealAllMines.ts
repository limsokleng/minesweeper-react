export const revealAllMines = (board: any, setBoard: (board: any) => void) => {
    const newBoard = board.map((row: any) =>
      row.map((cell: any) => {
        if (cell.mine) {
          cell.revealed = true;
        }
        return cell;
      })
    );
    setBoard(newBoard);
  };