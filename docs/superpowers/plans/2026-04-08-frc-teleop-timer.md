# FRC 2026 REBUILT Teleop Timer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-friendly circular countdown timer that simulates the FRC 2026 REBUILT teleop period, cycling through 6 phases with color-coded SVG ring visualization.

**Architecture:** Single-page React app with one custom hook (`useTimer`) for timer logic and one component (`App`) for rendering. Phase config is a static array. SVG circle with `stroke-dasharray`/`stroke-dashoffset` for the ring animation.

**Tech Stack:** React 19, Tailwind CSS v4, Bun, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-08-frc-teleop-timer-design.md`

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/useTimer.ts` | Create | Timer state machine: countdown, phase tracking, start/pause/resume/reset |
| `src/App.tsx` | Rewrite | Render phase strip, SVG ring, countdown, action button |
| `src/index.css` | Rewrite | Dark theme, mobile-first centered layout |
| `src/index.html` | Modify | Update title and favicon reference |
| `src/index.ts` | Modify | Remove API routes, serve only the HTML |
| `src/APITester.tsx` | Delete | No longer needed |
| `src/logo.svg` | Delete | No longer needed |
| `src/react.svg` | Delete | No longer needed |

---

### Task 1: Clean up template files and update entry points

**Files:**
- Delete: `src/APITester.tsx`, `src/logo.svg`, `src/react.svg`
- Modify: `src/index.html`
- Modify: `src/index.ts`

- [ ] **Step 1: Delete template files**

```bash
rm src/APITester.tsx
```

Also delete any SVG files in `src/`:
```bash
rm src/logo.svg src/react.svg
```

- [ ] **Step 2: Update `src/index.html`**

Replace the full contents with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <title>FRC Teleop Timer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

Key changes: updated title, added `user-scalable=no` for mobile, removed favicon link to deleted SVG.

- [ ] **Step 3: Simplify `src/index.ts`**

Replace full contents with:

```ts
import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    "/*": index,
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`Server running at ${server.url}`);
```

Removes the API routes that were part of the template.

- [ ] **Step 4: Verify the dev server starts**

```bash
bun run dev
```

Expected: Server starts without errors. Browser shows a blank page (App.tsx still references deleted files, which is fine — we'll rewrite it next).

Kill the server after confirming it starts.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove template files, update entry points for timer app"
```

---

### Task 2: Create the timer hook (`useTimer`)

**Files:**
- Create: `src/useTimer.ts`

- [ ] **Step 1: Create `src/useTimer.ts`**

```ts
import { useState, useRef, useCallback, useEffect } from "react";

export type Phase = {
  name: string;
  duration: number;
  color: string;
  label: string;
};

export type TimerState = "idle" | "running" | "paused" | "finished";

export const PHASES: Phase[] = [
  { name: "Transition Shift", duration: 10, color: "#26c6da", label: "TRANSITION" },
  { name: "Alliance Shift 1", duration: 25, color: "#FF9800", label: "SHIFT 1 of 4" },
  { name: "Alliance Shift 2", duration: 25, color: "#FF9800", label: "SHIFT 2 of 4" },
  { name: "Alliance Shift 3", duration: 25, color: "#FF9800", label: "SHIFT 3 of 4" },
  { name: "Alliance Shift 4", duration: 25, color: "#FF9800", label: "SHIFT 4 of 4" },
  { name: "End Game", duration: 30, color: "#e53935", label: "ENDGAME" },
];

export const TOTAL_TIME = PHASES.reduce((sum, p) => sum + p.duration, 0);

function getPhaseIndex(timeLeft: number): number {
  let elapsed = TOTAL_TIME - timeLeft;
  for (let i = 0; i < PHASES.length; i++) {
    if (elapsed < PHASES[i].duration) return i;
    elapsed -= PHASES[i].duration;
  }
  return PHASES.length - 1;
}

export function useTimer() {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setTimerState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    setTimerState("paused");
  }, [clearTimer]);

  const resume = useCallback(() => {
    setTimerState("running");
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setTimerState("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setTimeLeft(TOTAL_TIME);
    setTimerState("idle");
  }, [clearTimer]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const currentPhaseIndex = getPhaseIndex(timeLeft);
  const currentPhase = PHASES[currentPhaseIndex];

  return {
    timeLeft,
    currentPhaseIndex,
    currentPhase,
    timerState,
    start,
    pause,
    resume,
    reset,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
bunx tsc --noEmit src/useTimer.ts
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/useTimer.ts
git commit -m "feat: add useTimer hook with phase tracking and state machine"
```

---

### Task 3: Rewrite `App.tsx` — timer UI with SVG ring

**Files:**
- Rewrite: `src/App.tsx`

- [ ] **Step 1: Rewrite `src/App.tsx`**

```tsx
import { useTimer, PHASES, TOTAL_TIME, type TimerState } from "./useTimer";
import "./index.css";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const RING_SIZE = 200;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function PhaseStrip({ currentIndex, timerState }: { currentIndex: number; timerState: TimerState }) {
  return (
    <div className="flex gap-1 w-full max-w-xs justify-center mb-6">
      {PHASES.map((phase, i) => {
        let bg: string;
        if (timerState === "idle") {
          bg = "#444";
        } else if (i < currentIndex) {
          bg = "#4CAF50";
        } else if (i === currentIndex) {
          bg = timerState === "paused" ? "#555" : phase.color;
        } else {
          bg = "#444";
        }
        return (
          <div
            key={i}
            className="h-1.5 rounded-full"
            style={{
              flex: phase.duration,
              backgroundColor: bg,
              opacity: timerState === "paused" && i === currentIndex ? 0.5 : 1,
            }}
          />
        );
      })}
    </div>
  );
}

function TimerRing({
  timeLeft,
  color,
  timerState,
}: {
  timeLeft: number;
  color: string;
  timerState: TimerState;
}) {
  const progress = timeLeft / TOTAL_TIME;
  const offset = CIRCUMFERENCE * (1 - progress);

  const ringColor = timerState === "idle" || timerState === "finished" ? "#333" : timerState === "paused" ? "#555" : color;
  const glowColor = timerState === "running" ? color : "transparent";
  const isEndGame = color === "#e53935" && timerState === "running";

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      className="mb-6"
      style={{
        filter: timerState === "running" ? `drop-shadow(0 0 ${isEndGame ? "15px" : "10px"} ${glowColor}40)` : "none",
        opacity: timerState === "paused" ? 0.7 : 1,
      }}
    >
      {/* Background track */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="#222"
        strokeWidth={STROKE_WIDTH}
      />
      {/* Progress ring */}
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={ringColor}
        strokeWidth={STROKE_WIDTH}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        style={{ transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease" }}
      />
    </svg>
  );
}

export function App() {
  const { timeLeft, currentPhaseIndex, currentPhase, timerState, start, pause, resume, reset } =
    useTimer();

  let phaseLabel: string;
  let labelColor: string;
  if (timerState === "idle") {
    phaseLabel = "Ready";
    labelColor = "#888";
  } else if (timerState === "paused") {
    phaseLabel = "Paused";
    labelColor = "#aaa";
  } else if (timerState === "finished") {
    phaseLabel = "Match Over";
    labelColor = "#4CAF50";
  } else {
    phaseLabel = currentPhase.name;
    labelColor = currentPhase.color;
  }

  let ringSubtitle: string;
  if (timerState === "idle") {
    ringSubtitle = "TELEOP";
  } else if (timerState === "paused") {
    ringSubtitle = "PAUSED";
  } else if (timerState === "finished") {
    ringSubtitle = "COMPLETE";
  } else {
    ringSubtitle = currentPhase.label;
  }

  let buttonLabel: string;
  let buttonAction: () => void;
  let buttonColor: string;
  if (timerState === "idle") {
    buttonLabel = "START";
    buttonAction = start;
    buttonColor = "#4CAF50";
  } else if (timerState === "running") {
    buttonLabel = "PAUSE";
    buttonAction = pause;
    buttonColor = "#666";
  } else if (timerState === "paused") {
    buttonLabel = "RESUME";
    buttonAction = resume;
    buttonColor = "#4CAF50";
  } else {
    buttonLabel = "RESET";
    buttonAction = reset;
    buttonColor = "#4CAF50";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 select-none">
      <PhaseStrip currentIndex={currentPhaseIndex} timerState={timerState} />

      <div
        className="text-xs uppercase tracking-[0.2em] mb-2 transition-colors duration-300"
        style={{ color: labelColor }}
      >
        {phaseLabel}
      </div>

      <div className="relative">
        <TimerRing
          timeLeft={timeLeft}
          color={currentPhase.color}
          timerState={timerState}
        />
        {/* Centered text inside ring */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
          <div
            className="text-xs mt-1 transition-colors duration-300"
            style={{ color: timerState === "running" ? currentPhase.color : "#888" }}
          >
            {ringSubtitle}
          </div>
        </div>
      </div>

      <button
        onClick={buttonAction}
        className="px-12 py-3.5 rounded-xl text-lg font-semibold text-white transition-all duration-200 active:scale-95 cursor-pointer"
        style={{ backgroundColor: buttonColor }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

export default App;
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: implement circular timer UI with SVG ring and phase strip"
```

---

### Task 4: Update styles (`index.css`)

**Files:**
- Rewrite: `src/index.css`

- [ ] **Step 1: Rewrite `src/index.css`**

```css
@import "tailwindcss";

@layer base {
  :root {
    color: rgba(255, 255, 255, 0.87);
    background: #1a1a2e;
    font-family: system-ui, -apple-system, sans-serif;
  }

  body {
    margin: 0;
    min-height: 100dvh;
    min-width: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  #root {
    width: 100%;
  }
}
```

Uses `100dvh` (dynamic viewport height) for proper mobile sizing when the browser chrome hides/shows. Removes all template-specific styles (background pattern, spin animation, etc.).

- [ ] **Step 2: Commit**

```bash
git add src/index.css
git commit -m "feat: update styles to dark theme mobile-first layout"
```

---

### Task 5: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
bun run dev
```

- [ ] **Step 2: Open in browser and verify all states**

Open the URL logged by the server (typically `http://localhost:3000`). Verify:

1. **Idle:** Grey ring, "2:20" displayed, "Ready" label, green START button, all phase bars are grey
2. **Tap START:** Timer counts down, ring turns teal (Transition Shift), first phase bar lights up teal
3. **Wait 10s:** Phase transitions to Alliance Shift 1, ring turns orange, "SHIFT 1 of 4" label, first bar turns green, second bar turns orange
4. **Tap PAUSE:** Ring dims, "Paused" label, RESUME button appears green
5. **Tap RESUME:** Timer continues from paused position
6. **Let timer run to 0:30:** End Game phase, ring turns red with glow, "ENDGAME" label
7. **Let timer reach 0:00:** "Match Over" label, ring grey, RESET button
8. **Tap RESET:** Returns to idle state

- [ ] **Step 3: Test on mobile viewport**

Open browser DevTools, toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M). Select a phone preset (e.g., iPhone 14). Verify:
- Everything fits without scrolling
- Button is easily tappable
- Text is readable

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: address issues found during smoke test"
```

Only commit if changes were needed. Skip if everything passed.
