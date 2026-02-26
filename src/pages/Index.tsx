import { useState, useCallback, useEffect } from "react";
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

function minimax(board: Player[], isMaximizing: boolean): number {
  const result = getWinner(board);
  if (result?.winner === "O") return 10;
  if (result?.winner === "X") return -10;
  if (board.every(Boolean)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "O";
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = "X";
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board: Player[]): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

const Index = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [thinking, setThinking] = useState(false);

  const result = getWinner(board);
  const isDraw = !result && board.every(Boolean);

  useEffect(() => {
    if (!isXNext && !result && !isDraw) {
      setThinking(true);
      const timer = setTimeout(() => {
        const move = getBestMove([...board]);
        if (move !== -1) {
          const next = [...board];
          next[move] = "O";
          setBoard(next);
          const newResult = getWinner(next);
          if (newResult) {
            setScores((s) => ({ ...s, O: s.O + 1 }));
          }
          setIsXNext(true);
        }
        setThinking(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, result, isDraw]);

  const handleClick = useCallback((i: number) => {
    if (board[i] || result || !isXNext || thinking) return;
    const next = [...board];
    next[i] = "X";
    setBoard(next);

    const newResult = getWinner(next);
    if (newResult) {
      setScores((s) => ({ ...s, X: s.X + 1 }));
    }
    setIsXNext(false);
  }, [board, isXNext, result, thinking]);

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setThinking(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Tic Tac Toe
        </h1>

        <div className="flex gap-6 text-lg font-bold">
          <span className="text-primary">You: {scores.X}</span>
          <span className="text-secondary">AI: {scores.O}</span>
        </div>

        <p className="text-lg font-semibold text-muted-foreground h-7">
          {result
            ? <span className={result.winner === "X" ? "text-primary" : "text-secondary"}>
                {result.winner === "X" ? "You win! 🎉" : "AI wins! 🤖"}
              </span>
            : isDraw
            ? "It's a draw!"
            : thinking
            ? "AI is thinking..."
            : <span className="text-primary">Your turn</span>}
        </p>

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
