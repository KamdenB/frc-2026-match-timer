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

  // Calculate time remaining in the current phase
  let elapsed = TOTAL_TIME - timeLeft;
  for (let i = 0; i < currentPhaseIndex; i++) {
    elapsed -= PHASES[i].duration;
  }
  const phaseTimeLeft = currentPhase.duration - elapsed;

  return {
    timeLeft,
    phaseTimeLeft,
    currentPhaseIndex,
    currentPhase,
    timerState,
    start,
    pause,
    resume,
    reset,
  };
}
