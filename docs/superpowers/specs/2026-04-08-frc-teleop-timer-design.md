# FRC 2026 REBUILT — Teleop Timer Design

## Overview

A mobile-friendly circular countdown timer for simulating the teleop period of the FRC 2026 game "REBUILT." The timer cycles through 6 phases with distinct visual treatments, using an SVG ring that depletes and changes color as phases progress.

## Game Timing Structure

The teleop period is 2 minutes 20 seconds (140 seconds), broken into:

| Phase | Duration | Ring Color | Description |
|---|---|---|---|
| Transition Shift | 10s | Teal (#26c6da) | Both Hubs active |
| Alliance Shift 1 | 25s | Orange (#FF9800) | Hubs alternate |
| Alliance Shift 2 | 25s | Orange (#FF9800) | Hubs alternate |
| Alliance Shift 3 | 25s | Orange (#FF9800) | Hubs alternate |
| Alliance Shift 4 | 25s | Orange (#FF9800) | Hubs alternate |
| End Game | 30s | Red (#e53935) | Both Hubs active, robots hang |

The timer presents a neutral/field view — no alliance-specific perspective.

## UI Design

### Layout

Circular radial timer, mobile-first, single screen. Components from top to bottom:

1. **Phase progress strip** — 6 horizontal bars showing completed (green), current (phase color), and upcoming (dark grey) phases
2. **Phase label** — uppercase text in the current phase's accent color
3. **SVG ring** — large circle with stroke that depletes clockwise as time runs down; stroke color matches current phase; subtle glow shadow on the ring
4. **Countdown** — large tabular-nums text centered inside the ring, showing total teleop time remaining (M:SS format)
5. **Phase subtitle** — small text inside ring below the countdown (e.g., "SHIFT 2 of 4", "ENDGAME", "TELEOP")
6. **Action button** — single button that changes per state

### States

| State | Phase Label | Ring | Button |
|---|---|---|---|
| Idle | "Ready" (grey) | Grey (#333), full stroke | START (green) |
| Running | Phase name (phase color) | Phase color, depleting stroke, glow | PAUSE (grey) |
| Paused | "Paused" (grey) | Dimmed (#555), frozen, 0.7 opacity | RESUME (green) |
| Finished | "Match Over" (green) | Grey (#333), empty stroke | RESET (green) |

### Ring Behavior

- SVG circle using `stroke-dasharray` and `stroke-dashoffset`
- Ring represents total teleop time (140s), depletes proportionally
- Color transitions happen instantly at phase boundaries
- End Game phase ring has a larger glow (`box-shadow: 0 0 30px`)

### Mobile Considerations

- Full viewport height, centered content
- Touch-friendly button (min 48px tap target, large padding)
- Dark background (#1a1a2e) for outdoor/pit visibility
- No scrolling needed — everything fits in one screen

## Architecture

### Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Main component — renders phase strip, SVG ring, countdown, button |
| `src/useTimer.ts` | Custom hook — timer logic, phase tracking, state machine |
| `src/index.css` | Updated styles — dark theme, mobile-first layout |
| `src/index.html` | Updated title to "FRC Teleop Timer" |

Existing template files to remove: `src/APITester.tsx`, logo SVGs.

### Timer Hook (`useTimer`)

```ts
type Phase = {
  name: string;
  duration: number;
  color: string;
  label: string; // subtitle inside ring
};

type TimerState = "idle" | "running" | "paused" | "finished";

// Returns:
{
  timeLeft: number;          // total seconds remaining (140 → 0)
  currentPhaseIndex: number; // 0-5
  currentPhase: Phase;       // current phase config
  timerState: TimerState;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}
```

**Implementation details:**
- `setInterval` at 1-second ticks
- Tracks `timeLeft` counting down from 140
- Derives `currentPhaseIndex` by comparing elapsed time (140 - timeLeft) against cumulative phase durations
- Cleans up interval on unmount and when paused/finished
- `reset` restores to idle state with timeLeft = 140

### Phase Configuration

Static array, defined once:

```ts
const PHASES: Phase[] = [
  { name: "Transition Shift", duration: 10, color: "#26c6da", label: "TRANSITION" },
  { name: "Alliance Shift 1", duration: 25, color: "#FF9800", label: "SHIFT 1 of 4" },
  { name: "Alliance Shift 2", duration: 25, color: "#FF9800", label: "SHIFT 2 of 4" },
  { name: "Alliance Shift 3", duration: 25, color: "#FF9800", label: "SHIFT 3 of 4" },
  { name: "Alliance Shift 4", duration: 25, color: "#FF9800", label: "SHIFT 4 of 4" },
  { name: "End Game",         duration: 30, color: "#e53935", label: "ENDGAME" },
];
```

### Time Formatting

`timeLeft` (seconds) → `M:SS` string. Example: 140 → "2:20", 85 → "1:25", 8 → "0:08".

## Interactions

- **Tap START** → timer begins at 2:20, counts down, phases auto-advance
- **Tap PAUSE** → timer freezes, ring dims, button becomes RESUME
- **Tap RESUME** → timer continues from where it stopped
- **Timer reaches 0:00** → state becomes "finished", shows "Match Over", button becomes RESET
- **Tap RESET** → returns to idle state

No audio. No vibration. Visual only.

## No-scope

- No alliance selection or alliance-specific coloring
- No autonomous period
- No score tracking
- No audio/vibration cues
- No settings or configuration
- No data persistence
