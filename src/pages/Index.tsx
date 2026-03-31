import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { playPlaceX, playPlaceO, playWin, playDraw } from "@/hooks/useSoundEffects";
import confetti from "canvas-confetti";

type Player = "X" | "O" | null;
type Difficulty = "easy" | "medium" | "hard";
type Mode = "ai" | "local";

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
      if (!board[i]) { board[i] = "O"; best = Math.max(best, minimax(board, false)); board[i] = null; }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) { board[i] = "X"; best = Math.min(best, minimax(board, true)); board[i] = null; }
    }
    return best;
  }
}

function getBestMove(board: Player[]): number {
  let bestScore = -Infinity, bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) { board[i] = "O"; const s = minimax(board, false); board[i] = null; if (s > bestScore) { bestScore = s; bestMove = i; } }
  }
  return bestMove;
}

function getRandomMove(board: Player[]): number {
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
}

function getAIMove(board: Player[], difficulty: Difficulty): number {
  const rand = Math.random();
  if (difficulty === "easy") return rand < 0.8 ? getRandomMove(board) : getBestMove([...board]);
  if (difficulty === "medium") return rand < 0.4 ? getRandomMove(board) : getBestMove([...board]);
  return getBestMove([...board]);
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = { easy: "🟢 Easy", medium: "🟡 Medium", hard: "🔴 Hard" };

const Index = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [thinking, setThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [mode, setMode] = useState<Mode>("ai");
  // Track which cells were just placed for animation
  const [lastPlaced, setLastPlaced] = useState<number | null>(null);

  const result = getWinner(board);
  const isDraw = !result && board.every(Boolean);
  const currentPlayer = isXNext ? "X" : "O";

  useEffect(() => {
    if (mode === "ai" && !isXNext && !result && !isDraw) {
      setThinking(true);
      const timer = setTimeout(() => {
        const move = getAIMove([...board], difficulty);
        if (move !== -1) {
          const next = [...board];
          next[move] = "O";
          setBoard(next);
          setLastPlaced(move);
          playPlaceO();
          const w = getWinner(next);
          if (w) { setScores((s) => ({ ...s, O: s.O + 1 })); playWin(); }
          else if (next.every(Boolean)) playDraw();
          setIsXNext(true);
          setIsXNext(true);
        }
        setThinking(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, result, isDraw, difficulty, mode]);

  const handleClick = useCallback((i: number) => {
    if (board[i] || result) return;
    if (mode === "ai" && (!isXNext || thinking)) return;

    const next = [...board];
    next[i] = currentPlayer;
    setBoard(next);
    setLastPlaced(i);
    if (currentPlayer === "X") playPlaceX(); else playPlaceO();

    const newResult = getWinner(next);
    if (newResult) { setScores((s) => ({ ...s, [currentPlayer]: s[currentPlayer as "X" | "O"] + 1 })); playWin(); }
    else if (next.every(Boolean)) playDraw();
    setIsXNext(!isXNext);
  }, [board, isXNext, result, thinking, mode, currentPlayer]);

  const resetBoard = () => { setBoard(Array(9).fill(null)); setIsXNext(true); setThinking(false); setLastPlaced(null); };
  const changeMode = (m: Mode) => { setMode(m); resetBoard(); setScores({ X: 0, O: 0 }); };
  const changeDifficulty = (d: Difficulty) => { setDifficulty(d); resetBoard(); setScores({ X: 0, O: 0 }); };

  const statusText = () => {
    if (result) {
      if (mode === "ai") return result.winner === "X" ? "You win! 🎉" : "AI wins! 🤖";
      return `${result.winner} wins! 🎉`;
    }
    if (isDraw) return "It's a draw!";
    if (mode === "ai") return thinking ? "AI is thinking..." : "Your turn";
    return `${currentPlayer}'s turn`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-4xl font-black tracking-tight text-foreground">Tic Tac Toe</h1>

        <div className="flex gap-2">
          {([["ai", "🤖 vs AI"], ["local", "👥 2 Players"]] as [Mode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => changeMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-muted text-muted-foreground hover:bg-accent cursor-pointer"}`}>
              {label}
            </button>
          ))}
        </div>

        {mode === "ai" && (
          <div className="flex gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button key={d} onClick={() => changeDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${difficulty === d ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-muted text-muted-foreground hover:bg-accent cursor-pointer"}`}>
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6 text-lg font-bold">
          <span className="text-primary">{mode === "ai" ? "You" : "X"}: {scores.X}</span>
          <span className="text-secondary">{mode === "ai" ? "AI" : "O"}: {scores.O}</span>
        </div>

        <p className="text-lg font-semibold text-muted-foreground h-7">
          {result ? (
            <span className={result.winner === "X" ? "text-primary" : "text-secondary"}>{statusText()}</span>
          ) : (
            <span className={isDraw ? "" : isXNext ? "text-primary" : "text-secondary"}>{statusText()}</span>
          )}
        </p>

        <Card className="p-3 shadow-lg">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, i) => {
              const isWinCell = result?.line.includes(i);
              const justPlaced = lastPlaced === i;
              return (
                <button key={i} onClick={() => handleClick(i)}
                  className={`w-24 h-24 rounded-lg text-4xl font-black transition-all duration-150 flex items-center justify-center
                    ${cell ? "" : "hover:bg-muted cursor-pointer"}
                    ${!cell ? "bg-background border-2 border-border" : ""}
                    ${cell === "X" ? "text-primary bg-primary/10 border-2 border-primary/30" : ""}
                    ${cell === "O" ? "text-secondary bg-secondary/10 border-2 border-secondary/30" : ""}
                    ${isWinCell ? "animate-win-bounce animate-win-glow" : ""}
                  `}>
                  {cell && (
                    <span key={`${i}-${cell}`} className={justPlaced ? "animate-pop-in inline-block" : "inline-block"}>
                      {cell}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {(result || isDraw) && (
          <Button onClick={resetBoard} size="lg" className="font-bold text-base animate-pop-in">Play Again</Button>
        )}
      </div>
    </div>
  );
};

export default Index;
