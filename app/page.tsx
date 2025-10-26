"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// Violet Type – Typing Test + Reaction Test (keyboard-only, timed)
export default function VioletType() {
  type Mode = "typing" | "reaction";
  const [mode, setMode] = useState<Mode>("typing");

  type CalibrationMap = Record<string, number>;
  const CALIBRATION: CalibrationMap = {
   A: 460, G: 416, U: 532, R: 448, H: 498, P: 524, Y: 479, W: 406, X: 533,
  I: 506, Q: 553, E: 492, K: 478, L: 560, B: 573, T: 567, Z: 530, V: 512,
  F: 499, M: 527, N: 512, C: 536, S: 557, J: 583, D: 533, O: 439,
  }

  // default if no calibration yet

const DEFAULT_BENCHMARK = 500;

const benchmarkFor = React.useCallback((letter: string) => {
  const v = CALIBRATION[letter?.toUpperCase()]; // <-- NOTE: toUpperCase
  if (Number.isFinite(v)) return Math.round(v);
  const vals = Object.values(CALIBRATION);
  if (vals.length) return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return DEFAULT_BENCHMARK;
}, []);

  

  // ===================== Typing Test =====================
  const [wordCount, setWordCount] = useState<number>(50); // default 50
  const TARGET_LINE_HEIGHT_REM = 2.0;

  const dictionary = useMemo(
    () => [
      "the",
      "of",
      "and",
      "to",
      "in",
      "is",
      "you",
      "that",
      "it",
      "he",
      "was",
      "for",
      "on",
      "are",
      "as",
      "with",
      "his",
      "they",
      "i",
      "at",
      "be",
      "this",
      "have",
      "from",
      "or",
      "one",
      "had",
      "by",
      "word",
      "but",
      "not",
      "what",
      "all",
      "were",
      "we",
      "when",
      "your",
      "can",
      "there",
      "use",
      "an",
      "each",
      "which",
      "she",
      "do",
      "how",
      "their",
      "if",
      "will",
      "up",
      "other",
      "about",
      "out",
      "many",
      "then",
      "them",
      "these",
      "so",
      "some",
      "her",
      "would",
      "make",
      "like",
      "him",
      "into",
      "time",
      "has",
      "look",
      "two",
      "more",
      "write",
      "go",
      "see",
      "number",
      "no",
      "way",
      "could",
      "people",
      "my",
      "than",
      "first",
      "water",
      "been",
      "call",
      "who",
      "oil",
      "its",
      "now",
      "find",
      "long",
      "down",
      "day",
      "did",
      "get",
      "come",
      "made",
      "may",
      "part",
    ],
    []
  );

  const makeText = useCallback(() => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(dictionary[Math.floor(Math.random() * dictionary.length)]);
    }
    return words.join(" ") + " "; // trailing space for predictable flow
  }, [wordCount, dictionary]);

  const [text, setText] = useState("");
  const [cursor, setCursor] = useState(0);
  const [inputs, setInputs] = useState<string[]>([]);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [beatsCount, setBeatsCount] = useState(0);
  const [trialCount, setTrialCount] = useState(0);
  const [lastTarget, setLastTarget] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentCharRef = useRef<HTMLSpanElement | null>(null);

  // Regenerate on word-count change
  useEffect(() => {
    setText(makeText());
    setCursor(0);
    setInputs([]);
    setStarted(false);
    setPaused(false);
    setFinished(false);
    setSeconds(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [makeText]);

  // Typing timer
  useEffect(() => {
    if (mode !== "typing") return;
    if (!started || paused || finished) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [mode, started, paused, finished]);

  // Stats
  const correctCount = useMemo(() => {
    let c = 0;
    for (let i = 0; i < inputs.length; i++) if (inputs[i] === text[i]) c++;
    return c;
  }, [inputs, text]);

  const accuracy = useMemo(
    () =>
      inputs.length === 0
        ? 100
        : Math.round((correctCount / inputs.length) * 100),
    [inputs.length, correctCount]
  );

  const wpm = useMemo(() => {
    if (seconds === 0) return 0;
    const words = correctCount / 5;
    return Math.round((words / seconds) * 60);
  }, [correctCount, seconds]);

  // Keep current line centered
  useEffect(() => {
    if (mode !== "typing") return;
    if (!containerRef.current || !currentCharRef.current) return;
    const container = containerRef.current;
    const caret = currentCharRef.current;
    const caretTop = caret.offsetTop;
    const caretHeight = caret.offsetHeight || TARGET_LINE_HEIGHT_REM * 16;
    const containerHeight = container.clientHeight;
    const desiredTop = caretTop - containerHeight / 2 + caretHeight / 2;
    container.scrollTo({ top: Math.max(desiredTop, 0), behavior: "smooth" });
  }, [mode, cursor]);

  const restartTyping = () => {
    setText(makeText());
    setCursor(0);
    setInputs([]);
    setStarted(false);
    setPaused(false);
    setFinished(false);
    setSeconds(0);
  };

  // Typing key handling (Enter restarts when finished)
  useEffect(() => {
    if (mode !== "typing") return;
    const onKey = (e: KeyboardEvent) => {
      if (paused) {
        e.preventDefault();
        setPaused(false);
        return;
      }
      if (finished) {
        if (e.key === "Enter") {
          e.preventDefault();
          restartTyping();
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setPaused((p) => !p);
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (!started) setStarted(true);

      if (e.key === "Backspace") {
        e.preventDefault();
        if (cursor > 0) {
          setCursor((c) => c - 1);
          setInputs((prev) => prev.slice(0, -1));
        }
        return;
      }

      const isLetter = /^[a-z ]$/.test(e.key);
      if (!isLetter) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      setInputs((prev) => [...prev, e.key]);
      setCursor((c) => {
        const next = c + 1;
        if (next >= text.length - 1) setFinished(true);
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, paused, finished, started, cursor, text.length]);

  const renderChar = (ch: string, idx: number) => {
    let cls = "";
    if (idx < inputs.length)
      cls =
        inputs[idx] === ch
          ? "text-emerald-700 dark:text-emerald-400"
          : "text-rose-600 dark:text-rose-400";
    else if (idx === cursor) cls = "relative text-zinc-950 dark:text-zinc-100";
    else cls = "text-zinc-500 dark:text-zinc-400";

    return (
      <span
        key={idx}
        ref={idx === cursor ? currentCharRef : undefined}
        className={"inline whitespace-pre-wrap break-words " + cls}
      >
        {ch === " " ? " " : ch}
        {idx === cursor && (
          <span
            className="absolute -bottom-0.5 left-0 right-0 h-0.5 animate-pulse bg-zinc-800/60 dark:bg-zinc-100/60"
            aria-hidden
          />
        )}
      </span>
    );
  };

  const charSpans = useMemo(
    () => text.split("").map(renderChar),
    [text, inputs, cursor]
  );

  // Dynamic padding (fewer words => more breathing room)
  const padClass = useMemo(() => {
    if (wordCount < 20) return "p-10";
    if (wordCount < 50) return "p-8";
    if (wordCount < 120) return "p-6";
    return "p-4";
  }, [wordCount]);

  // ===================== Reaction Test (keyboard only, TIMED) =====================
  const benchmarkMs = 500; // Trevor's baseline
  const letters = useMemo(
    () => Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i)),
    []
  );

  const [rPaused, setRPaused] = useState(false);
  const [rStarted, setRStarted] = useState(false);
  const [rFinished, setRFinished] = useState(false);

  const [rDuration, setRDuration] = useState<number>(30); // seconds; selectable in 30s steps
  const [rTimeLeft, setRTimeLeft] = useState<number>(rDuration);

  const [target, setTarget] = useState<string>("?");
  const [showTarget, setShowTarget] = useState(false);
  const [trialStart, setTrialStart] = useState<number | null>(null);

  const [lastMs, setLastMs] = useState<number | null>(null);

  const newTrial = useCallback(() => {
    const next = letters[Math.floor(Math.random() * letters.length)];
    setTarget(next);
    setShowTarget(true);
    setTrialStart(performance.now());
  }, [letters]);

  const hardResetReaction = useCallback(() => {
    setRStarted(false);
    setRFinished(false);
    setRPaused(false);
    setRTimeLeft(rDuration);
    setTarget("?");
    setShowTarget(false);
    setTrialStart(null);
    setLastMs(null);
    setBeatsCount(0);
    setTrialCount(0);
  }, [rDuration]);

  const startReaction = useCallback(() => {
    setRStarted(true);
    setRFinished(false);
    setRPaused(false);
    setLastMs(null);
    setRTimeLeft(rDuration);
    setShowTarget(false);
    setTimeout(() => newTrial(), 0);
    setBeatsCount(0);
    setTrialCount(0);
  }, [rDuration, newTrial]);

  // Countdown timer (ticks only when active)
  useEffect(() => {
    if (mode !== "reaction") return;
    if (!rStarted || rPaused || rFinished) return;

    const id = setInterval(() => {
      setRTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(id);
          setRFinished(true);
          setShowTarget(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [mode, rStarted, rPaused, rFinished]);

  // Reaction key handling
  useEffect(() => {
    if (mode !== "reaction") return;
    const onKey = (e: KeyboardEvent) => {
      // Pause toggle
      if (e.key === "Escape") {
        e.preventDefault();
        setRPaused((p) => !p);
        return;
      }

      // If paused: any key resumes
      if (rPaused) {
        e.preventDefault();
        setRPaused(false);
        return;
      }

      // Not started: Enter to start
      if (!rStarted && e.key === "Enter") {
        e.preventDefault();
        startReaction();
        return;
      }

      // Finished: Enter to start a new timed run
      if (rFinished && e.key === "Enter") {
        e.preventDefault();
        startReaction();
        return;
      }

      if (!rStarted || rFinished) return;

      // During trial: record reaction on correct key
if (showTarget && e.key.length === 1 && e.key.toLowerCase() === target) {
          const now = performance.now();
          const elapsed = Math.round(now - (trialStart ?? now));

          setLastTarget(target);     // NEW
          setLastMs(elapsed);
          setShowTarget(false);

          // If you added totals earlier:
          setTrialCount((t) => t + 1);
          if (elapsed <= benchmarkFor(target)) setBeatsCount((b) => b + 1);

  setTimeout(() => { if (!rFinished) newTrial(); }, 350);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    mode,
    rPaused,
    rStarted,
    rFinished,
    showTarget,
    target,
    trialStart,
    startReaction,
    newTrial,
  ]);

  const activeLetter = (lastTarget ?? target) || "a";
  const currentBenchmark = benchmarkFor(activeLetter);

  const comparisonColor =
    lastMs == null
      ? "text-zinc-800 dark:text-zinc-100"
      : lastMs <= currentBenchmark
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  // ===================== UI =====================
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold tracking-tight">Violet Type</h1>
            <div className="hidden sm:flex items-center gap-4 text-md text-zinc-600 dark:text-zinc-300 bg-gray-400/10 px-3 py-1 rounded-2xl">
              {mode === "typing" ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">WPM</span>
                    <span className="tabular-nums">{wpm}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Accuracy</span>
                    <span className="tabular-nums">{accuracy}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Chars</span>
                    <span className="tabular-nums">{inputs.length}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Time Left</span>
                    <span className="tabular-nums">{rTimeLeft}s</span>
                  </div>
                  <div className="flex items-center gap-1"></div>
                </>
              )}
            </div>
          </div>

          {/* Mode switch & controls */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-zinc-300/70 dark:border-zinc-700 overflow-hidden">
              <button
                onClick={() => setMode("typing")}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  mode === "typing"
                    ? "bg-white dark:bg-zinc-800"
                    : "bg-transparent"
                }`}
              >
                Typing
              </button>
              <button
                onClick={() => {
                  setMode("reaction");
                  hardResetReaction();
                }}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  mode === "reaction"
                    ? "bg-white dark:bg-zinc-800"
                    : "bg-transparent"
                }`}
              >
                Reaction
              </button>
            </div>

            {mode === "typing" ? (
              <>
                <button
                  onClick={() => setPaused((p) => !p)}
                  className="rounded-2xl border cursor-pointer border-zinc-300/80 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
                >
                  {paused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={restartTyping}
                  className="rounded-2xl border cursor-pointer border-zinc-300/80 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
                >
                  Restart
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setRPaused((p) => !p)}
                  className="rounded-2xl border cursor-pointer border-zinc-300/80 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
                >
                  {rPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={() => {
                    hardResetReaction();
                    startReaction();
                  }}
                  className="rounded-2xl border cursor-pointer border-zinc-300/80 bg-white/70 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-800"
                >
                  Restart
                </button>
              </>
            )}
          </div>
        </div>

        {/* Typing sub-controls */}
        {mode === "typing" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <label className="text-zinc-600 dark:text-zinc-300">Words:</label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value))}
              className="cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              {[10, 25, 50, 75, 100, 150, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Reaction sub-controls */}
        {mode === "reaction" && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <label className="text-zinc-600 dark:text-zinc-300">
              Duration:
            </label>
            <select
              value={rDuration}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setRDuration(v);
                setRTimeLeft(v);
                hardResetReaction();
              }}
              className="cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            >
              {[30, 60, 90, 120].map((n) => (
                <option key={n} value={n}>
                  {n}s
                </option>
              ))}
            </select>
            <span className="text-xs text-zinc-500">
              Press Enter to start. Escape to pause.
            </span>
          </div>
        )}

        {/* Center header row */}
        <div className="mt-6 flex items-center justify-center">
          {mode === "typing" ? (
            <div className="rounded-2xl border border-zinc-200 bg-white/70 px-6 py-3 text-3xl font-semibold tabular-nums shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/70">
              {Math.floor(seconds / 60)
                .toString()
                .padStart(2, "0")}
              :{(seconds % 60).toString().padStart(2, "0")}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white/70 px-6 py-3 text-2xl font-semibold tabular-nums shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/70">
              {rStarted ? (
                <span className="flex flex-col items-center gap-4">
                  <span>Time Left: {rTimeLeft}s</span>
                  <>
                 <div className={`text-sm font-semibold ${comparisonColor}`}>
  {lastMs == null ? "—" : `Yours - ${lastMs} ms`}
  <span className="mx-1 text-zinc-700 dark:text-zinc-300">·</span>
  Trevors - {currentBenchmark}ms
</div>
                  </>
                </span>
              ) : rFinished ? (
                <span className="flex items-center gap-4">
                  <span>Finished</span>
              <div className={`text-sm font-semibold ${comparisonColor}`}>
  {lastMs == null ? "—" : `Yours - ${lastMs} ms`}
  <span className="mx-1 text-zinc-700 dark:text-zinc-300">·</span>
  Trevors - {currentBenchmark}ms
</div>

                  <span className="text-zinc-600 dark:text-zinc-300">
                    Press Enter to run again
                  </span>
                </span>
              ) : (
                <span>Press Enter to start</span>
              )}
            </div>
          )}
        </div>

        {/* Game screen */}
        <div className="mt-6 grid place-items-center">
          <div
            className={`relative aspect-square w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 ${padClass} shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/80`}
          >
            {/* Typing viewport */}
            {mode === "typing" && (
              <div
                ref={containerRef}
                className="h-full w-full overflow-y-auto rounded-2xl bg-zinc-50 p-6 font-mono text-xl leading-8 tracking-wide text-zinc-800 shadow-inner dark:bg-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words"
                style={{ lineHeight: `${TARGET_LINE_HEIGHT_REM}rem` }}
              >
                <div className="select-none whitespace-pre-wrap break-words">
                  {charSpans}
                </div>
              </div>
            )}

            {/* Reaction viewport */}
            {mode === "reaction" && (
              <div className="h-full w-full rounded-2xl bg-zinc-50 p-6 text-zinc-900 shadow-inner dark:bg-zinc-900 dark:text-zinc-100">
                <div className="flex h-full flex-col items-center justify-center gap-6">
                  <div className="text-7xl font-black tracking-tight select-none">
                    {showTarget
                      ? target.toUpperCase()
                      : rStarted && !rFinished
                      ? ""
                      : ""}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">
                    {rStarted && !rFinished && (
                      <span>Press the matching key on your keyboard.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Overlays for typing */}
            {mode === "typing" && (!started || paused || finished) && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl">
                <div
                  className={
                    "pointer-events-auto flex flex-col items-center gap-3 rounded-2xl border px-5 py-4 text-center shadow-xl " +
                    (paused
                      ? "border-amber-300/50 bg-amber-100/80 dark:border-amber-400/30 dark:bg-amber-900/40"
                      : finished
                      ? "border-emerald-300/50 bg-emerald-100/80 dark:border-emerald-400/30 dark:bg-emerald-900/40"
                      : "border-sky-300/50 bg-sky-100/80 dark:border-sky-400/30 dark:bg-sky-900/40")
                  }
                >
                  <div className="text-lg font-semibold">
                    {paused ? "Paused" : finished ? "Finished" : "Ready?"}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-200">
                    {paused && "Press any key to resume."}
                    {finished && (
                      <span>
                        WPM{" "}
                        <span className="font-semibold tabular-nums">
                          {wpm}
                        </span>{" "}
                        · Accuracy{" "}
                        <span className="font-semibold tabular-nums">
                          {accuracy}%
                        </span>
                      </span>
                    )}
                    {!paused &&
                      !finished &&
                      !started &&
                      "Start typing to begin."}
                  </div>
                  {finished && (
                    <div className="mt-2 text-xs text-zinc-700 dark:text-zinc-200">
                      Press{" "}
                      <kbd className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                        Enter
                      </kbd>{" "}
                      to restart
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Overlay for reaction paused / pre-start */}
            {mode === "reaction" && (rPaused || !rStarted) && !rFinished && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl">
                <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-sky-300/50 bg-sky-100/80 px-5 py-4 text-center shadow-xl dark:border-sky-400/30 dark:bg-sky-900/40">
                  <div className="text-lg font-semibold">
                    {!rStarted ? "Reaction Test" : "Paused"}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-200">
                    {!rStarted
                      ? "Press Enter to begin."
                      : "Press any key to resume."}
                  </div>
                </div>
              </div>
            )}

            {/* Overlay when reaction finished */}
            {mode === "reaction" && rFinished && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-3xl">
                <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-2xl border border-emerald-300/50 bg-emerald-100/80 px-5 py-4 text-center shadow-xl dark:border-emerald-400/30 dark:bg-emerald-900/40">
                  <div className="text-lg font-semibold">Finished</div>
                  <div className={`text-sm font-semibold ${comparisonColor}`}>
                    {lastMs == null ? "—" : `Yours - ${lastMs} ms`}{" "}
                    <span className="mx-1 text-zinc-700 dark:text-zinc-300">
                      ·
                    </span>{" "}
                    Trevors - {benchmarkMs}ms
                  </div>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    You beat your glorious king of a brother{" "}
                    <span className="tabular-nums">{beatsCount}</span>{" "}
                    {beatsCount === 1 ? "time" : "times"}
                    {typeof trialCount === "number" ? (
                      <>
                        {" "}
                        (out of{" "}
                        <span className="tabular-nums">{trialCount}</span>{" "}
                        go&apos;s)
                      </>
                    ) : null}
                  </div>
                  <div className="text-xs text-zinc-700 dark:text-zinc-200">
                    Press Enter to run again
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer tips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          {mode === "typing" ? (
            <>
              <div>
                Press{" "}
                <kbd className="rounded bg-zinc-200 px-1 py-0.5 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50">
                  Esc
                </kbd>{" "}
                or use the button to pause
              </div>
              <div>When paused, press any key to resume</div>
              <div>
                When finished, press{" "}
                <kbd className="rounded bg-zinc-200 px-1 py-0.5 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-50">
                  Enter
                </kbd>{" "}
                to restart
              </div>
            </>
          ) : (
            <>
              <div>
                Timed reaction test with {rDuration}s runs. Press the shown
                letter quickly.
              </div>
              <div>
                Result shows <span className="tabular-nums">Yours – X ms</span>{" "}
                vs <span className="tabular-nums">Trevors – 500ms</span> (green
                if faster, red if slower).
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
