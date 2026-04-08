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
