import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Player = "X" | "O" | null;

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function getWinner(board: Player[]): { winner: Player; line: number[] } | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

const Index = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const result = getWinner(board);
  const isDraw = !result && board.every(Boolean);
  const currentPlayer = isXNext ? "X" : "O";

  const handleClick = useCallback((i: number) => {
    if (board[i] || result) return;
    const next = [...board];
    next[i] = currentPlayer;
    setBoard(next);

    const newResult = getWinner(next);
    if (newResult) {
      setScores((s) => ({ ...s, [newResult.winner!]: s[newResult.winner as "X" | "O"] + 1 }));
    }
    setIsXNext(!isXNext);
  }, [board, currentPlayer, isXNext, result]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Tic Tac Toe
        </h1>

        {/* Scoreboard */}
        <div className="flex gap-6 text-lg font-bold">
          <span className="text-primary">X: {scores.X}</span>
          <span className="text-secondary">O: {scores.O}</span>
        </div>

        {/* Status */}
        <p className="text-lg font-semibold text-muted-foreground h-7">
          {result
            ? <span className={result.winner === "X" ? "text-primary" : "text-secondary"}>
                {result.winner} wins! 🎉
              </span>
            : isDraw
            ? "It's a draw!"
            : <>Turn: <span className={isXNext ? "text-primary" : "text-secondary"}>{currentPlayer}</span></>}
        </p>

        {/* Board */}
        <Card className="p-3 shadow-lg">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => {
              const isWinCell = result?.line.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  className={`
                    w-24 h-24 rounded-lg text-4xl font-black transition-all duration-150
                    flex items-center justify-center
                    ${cell ? "" : "hover:bg-muted cursor-pointer"}
                    ${!cell ? "bg-background border-2 border-border" : ""}
                    ${cell === "X" ? "text-primary bg-primary/10 border-2 border-primary/30" : ""}
                    ${cell === "O" ? "text-secondary bg-secondary/10 border-2 border-secondary/30" : ""}
                    ${isWinCell ? "scale-110 shadow-md" : ""}
                  `}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </Card>

        {(result || isDraw) && (
          <Button onClick={reset} size="lg" className="font-bold text-base">
            Play Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
