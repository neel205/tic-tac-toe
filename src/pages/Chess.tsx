import { useState, useCallback, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PIECE_UNICODE: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["8", "7", "6", "5", "4", "3", "2", "1"];

const Chess$ = () => {
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const makeMove = useCallback((from: Square, to: Square, promotionPiece?: string) => {
    const g = new Chess(game.fen());
    try {
      const move = g.move({ from, to, promotion: promotionPiece });
      if (move) {
        setGame(g);
        setLastMove({ from, to });
        setSelected(null);
        setLegalMoves([]);
        return true;
      }
    } catch {}
    return false;
  }, [game]);

  const handleSquareClick = useCallback((sq: Square) => {
    if (promotion) return;

    const piece = game.get(sq);

    if (selected) {
      if (sq === selected) {
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      // Check if this is a promotion move
      const moves = game.moves({ square: selected, verbose: true });
      const moveToSq = moves.find(m => m.to === sq);
      if (moveToSq && moveToSq.flags.includes("p")) {
        setPromotion({ from: selected, to: sq });
        return;
      }
      if (makeMove(selected, sq)) return;
      // If clicking own piece, select it instead
      if (piece && piece.color === game.turn()) {
        setSelected(sq);
        setLegalMoves(game.moves({ square: sq, verbose: true }).map(m => m.to as Square));
        return;
      }
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    if (piece && piece.color === game.turn()) {
      setSelected(sq);
      setLegalMoves(game.moves({ square: sq, verbose: true }).map(m => m.to as Square));
    }
  }, [game, selected, makeMove, promotion]);

  const handlePromotion = (piece: string) => {
    if (promotion) {
      makeMove(promotion.from, promotion.to, piece);
      setPromotion(null);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
    setPromotion(null);
  };

  const undoMove = () => {
    const g = new Chess(game.fen());
    g.undo();
    setGame(g);
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
  };

  const statusText = () => {
    if (game.isCheckmate()) return `Checkmate! ${game.turn() === "w" ? "Black" : "White"} wins!`;
    if (game.isStalemate()) return "Stalemate! It's a draw.";
    if (game.isDraw()) return "Draw!";
    if (game.isCheck()) return `${game.turn() === "w" ? "White" : "Black"} is in check!`;
    return `${game.turn() === "w" ? "White" : "Black"}'s turn`;
  };

  const isGameOver = game.isGameOver();

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 80%, hsl(var(--accent) / 0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.08) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")
        `,
      }}
    >
      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-lg relative">
        {/* Top bar */}
        <div className="flex w-full justify-between items-center">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg border-2 border-border bg-background text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-2xl sm:text-4xl tracking-tight text-foreground"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            Chess
          </h1>
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-lg border-2 border-border bg-background text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Status */}
        <p
          className={`text-base sm:text-lg font-bold ${game.isCheck() || game.isCheckmate() ? "text-secondary" : "text-foreground"}`}
          style={{ fontFamily: "'Permanent Marker', cursive" }}
        >
          {statusText()}
        </p>

        {/* Board */}
        <div className="relative">
          <div className="grid grid-cols-8 border-2 border-foreground rounded-sm overflow-hidden"
            style={{ width: "clamp(280px, 85vw, 480px)", height: "clamp(280px, 85vw, 480px)" }}>
            {RANKS.map((rank, ri) =>
              FILES.map((file, fi) => {
                const sq = `${file}${rank}` as Square;
                const piece = game.get(sq);
                const isLight = (ri + fi) % 2 === 0;
                const isSelected = selected === sq;
                const isLegal = legalMoves.includes(sq);
                const isLastMove = lastMove?.from === sq || lastMove?.to === sq;
                const hasPiece = !!piece;

                return (
                  <button
                    key={sq}
                    onClick={() => handleSquareClick(sq)}
                    className={`relative flex items-center justify-center cursor-pointer transition-colors
                      ${isSelected ? "ring-2 ring-inset ring-primary" : ""}
                      ${isLastMove ? "ring-2 ring-inset ring-accent" : ""}
                    `}
                    style={{
                      backgroundColor: isSelected
                        ? "hsl(var(--primary) / 0.35)"
                        : isLastMove
                        ? "hsl(var(--accent) / 0.4)"
                        : isLight
                        ? "hsl(39 30% 82%)"
                        : "hsl(30 15% 45%)",
                      aspectRatio: "1",
                    }}
                  >
                    {/* Legal move indicator */}
                    {isLegal && !hasPiece && (
                      <div className="absolute w-[30%] h-[30%] rounded-full bg-foreground/25" />
                    )}
                    {isLegal && hasPiece && (
                      <div className="absolute inset-0 border-4 border-foreground/30 rounded-sm" />
                    )}
                    {/* Piece */}
                    {piece && (
                      <span
                        className="text-[clamp(1.5rem,8vw,3rem)] leading-none select-none"
                        style={{
                          color: piece.color === "w" ? "hsl(39 30% 95%)" : "hsl(30 10% 10%)",
                          textShadow: piece.color === "w"
                            ? "0 1px 3px rgba(0,0,0,0.6)"
                            : "0 1px 2px rgba(255,255,255,0.2)",
                          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
                        }}
                      >
                        {PIECE_UNICODE[`${piece.color}${piece.type}`]}
                      </span>
                    )}
                    {/* Coordinates */}
                    {fi === 0 && (
                      <span className={`absolute top-0.5 left-0.5 text-[0.5rem] font-bold ${isLight ? "text-foreground/40" : "text-background/40"}`}>
                        {rank}
                      </span>
                    )}
                    {ri === 7 && (
                      <span className={`absolute bottom-0.5 right-0.5 text-[0.5rem] font-bold ${isLight ? "text-foreground/40" : "text-background/40"}`}>
                        {file}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Promotion dialog */}
          {promotion && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-sm z-20">
              <div className="flex gap-2 bg-card p-4 rounded-lg border-2 border-border shadow-lg">
                {["q", "r", "b", "n"].map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePromotion(p)}
                    className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-3xl sm:text-4xl rounded-lg border-2 border-border hover:border-primary hover:bg-accent/30 cursor-pointer transition-all"
                  >
                    {PIECE_UNICODE[`${game.turn()}${p}`]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={undoMove}
            variant="outline"
            className="rounded-lg border-2 font-bold"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
            disabled={game.history().length === 0}
          >
            <RotateCcw size={16} />
            Undo
          </Button>
          <Button
            onClick={resetGame}
            className="rounded-lg border-2 border-primary font-bold"
            style={{ fontFamily: "'Permanent Marker', cursive" }}
          >
            {isGameOver ? "New Game" : "Reset"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chess$;
