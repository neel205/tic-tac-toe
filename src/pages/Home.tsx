import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

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
      <div className="flex flex-col items-center gap-6 sm:gap-8 w-full max-w-md relative">
        <button
          onClick={() => setDark(!dark)}
          className="absolute top-0 right-0 p-2 rounded-lg border-2 border-border bg-background text-foreground hover:bg-accent/40 transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <h1
          className="text-4xl sm:text-6xl tracking-tight text-foreground"
          style={{ fontFamily: "'Permanent Marker', cursive" }}
        >
          Game Hub
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg text-center" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          Choose a game to play
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => navigate("/tictactoe")}
            className="w-full px-6 py-5 rounded-lg border-2 border-border bg-card text-card-foreground hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group"
          >
            <span
              className="text-2xl sm:text-3xl font-bold block group-hover:scale-105 transition-transform"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              ✕ Tic Tac Toe ○
            </span>
            <span className="text-muted-foreground text-sm mt-1 block">Classic 3×3 grid game</span>
          </button>

          <button
            onClick={() => navigate("/chess")}
            className="w-full px-6 py-5 rounded-lg border-2 border-border bg-card text-card-foreground hover:border-primary hover:bg-accent/30 transition-all cursor-pointer group"
          >
            <span
              className="text-2xl sm:text-3xl font-bold block group-hover:scale-105 transition-transform"
              style={{ fontFamily: "'Permanent Marker', cursive" }}
            >
              ♚ Chess ♛
            </span>
            <span className="text-muted-foreground text-sm mt-1 block">Full chess with all rules</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
