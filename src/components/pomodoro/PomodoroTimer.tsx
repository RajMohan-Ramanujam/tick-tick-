import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundEngine } from '../../utils/audio';

export const PomodoroTimer: React.FC = () => {
  const {
    tasks,
    activeFocusTaskId,
    setActiveFocusTaskId,
    addFocusTime,
  } = useApp();

  // Mode: Countdown (Timer) or Stopwatch (Count up)
  const [focusMode, setFocusMode] = useState<'pomo' | 'stopwatch'>('pomo');

  // User-configurable duration in minutes (Default: 25 mins)
  const [durationMins, setDurationMins] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionName, setSessionName] = useState<string>('');
  const [showSessionName, setShowSessionName] = useState<boolean>(true);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const presetTimes = [5, 10, 15, 20, 25, 30, 45, 60];

  // Set custom duration
  const setCustomDuration = (mins: number) => {
    const valid = Math.max(1, Math.min(240, mins));
    setDurationMins(valid);
    if (!isRunning) {
      setTimeLeft(valid * 60);
    }
  };

  // Reset timer whenever mode changes
  useEffect(() => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (focusMode === 'pomo') {
      setTimeLeft(durationMins * 60);
    } else {
      setStopwatchTime(0);
    }
  }, [focusMode, durationMins]);

  // Timer Tick Logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (focusMode === 'pomo') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              setIsRunning(false);
              soundEngine.playCompleteChime();
              setIsCompletedModalOpen(true);
              addFocusTime(durationMins, activeFocusTaskId || undefined);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setStopwatchTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, focusMode, durationMins, activeFocusTaskId, addFocusTime]);

  const toggleTimer = () => {
    if (focusMode === 'pomo' && timeLeft === 0) {
      setTimeLeft(durationMins * 60);
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (focusMode === 'pomo') {
      setTimeLeft(durationMins * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate circular progress percentage
  const totalSeconds = durationMins * 60;
  const progressRatio = focusMode === 'pomo'
    ? totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0
    : 0;

  const activeTask = tasks.find((t) => t.id === activeFocusTaskId);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121214] select-none text-slate-200 overflow-y-auto">
      {/* 1. Simple Top Header */}
      <div className="h-14 px-6 border-b border-[#202024] bg-[#161618] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-extrabold text-white tracking-tight m-0">
            Focus Timer
          </h2>
        </div>

        {/* Mode Switcher Pill */}
        <div className="bg-[#202024] p-1 rounded-xl border border-[#2c2c34] flex items-center gap-1">
          <button
            onClick={() => setFocusMode('pomo')}
            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              focusMode === 'pomo'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => setFocusMode('stopwatch')}
            className={`px-3.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              focusMode === 'stopwatch'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* 2. Main Centered Simple Timer Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 max-w-xl mx-auto w-full">
        {/* Custom Session Name (User can type any name they like or remove it completely) */}
        {showSessionName ? (
          <div className="flex items-center gap-2 bg-[#18181c] px-3.5 py-1.5 rounded-full border border-[#2a2a32] text-xs shadow-sm hover:border-[#3a3a44] transition-all">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name (e.g. Study, Work)..."
              className="bg-transparent text-white font-medium text-xs focus:outline-none w-48 placeholder:text-slate-500"
            />
            {sessionName && (
              <button
                type="button"
                onClick={() => setSessionName('')}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                title="Clear name"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setShowSessionName(false);
                setSessionName('');
              }}
              className="text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer ml-1"
              title="Remove name"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSessionName(true)}
            className="text-[11px] text-slate-500 hover:text-blue-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer py-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add Session Name</span>
          </button>
        )}

        {/* Large Circular Timer Ring */}
        <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r="135"
              className="stroke-[#222228]"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Active colored progress ring */}
            <circle
              cx="160"
              cy="160"
              r="135"
              className="stroke-blue-500 transition-all duration-1000 ease-linear"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 135}
              strokeDashoffset={
                focusMode === 'pomo'
                  ? 2 * Math.PI * 135 * (1 - progressRatio)
                  : 0
              }
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Time Digits in Center */}
          <div className="absolute flex flex-col items-center justify-center">
            <div className="font-mono text-5xl md:text-6xl font-black text-white tracking-tight">
              {focusMode === 'pomo' ? formatTime(timeLeft) : formatTime(stopwatchTime)}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2">
              {isRunning
                ? focusMode === 'pomo'
                  ? 'Focusing...'
                  : 'Timing...'
                : focusMode === 'pomo'
                ? `${durationMins} Minutes Goal`
                : 'Stopwatch'}
            </span>
          </div>
        </div>

        {/* 3. TIME PICKER / ADJUSTER (User sets whatever time they want!) */}
        {focusMode === 'pomo' && (
          <div className="w-full space-y-3 bg-[#18181b] p-4 rounded-2xl border border-[#242428] shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Set Focus Duration:
              </span>
              {/* Stepper with - and + */}
              <div className="flex items-center gap-2 bg-[#202024] px-2 py-1 rounded-xl border border-[#2c2c34]">
                <button
                  type="button"
                  onClick={() => setCustomDuration(durationMins - 5)}
                  disabled={isRunning}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282e] disabled:opacity-30 cursor-pointer"
                  title="Subtract 5 mins"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={durationMins}
                    disabled={isRunning}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setCustomDuration(val);
                    }}
                    className="w-12 text-center font-mono font-bold text-sm bg-transparent text-white focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-xs font-semibold text-slate-400">mins</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCustomDuration(durationMins + 5)}
                  disabled={isRunning}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#28282e] disabled:opacity-30 cursor-pointer"
                  title="Add 5 mins"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {presetTimes.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setCustomDuration(mins)}
                  disabled={isRunning}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    durationMins === mins
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400'
                      : 'bg-[#202024] hover:bg-[#28282e] text-slate-300 hover:text-white border border-[#2a2a30]'
                  } disabled:opacity-50`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Main Action Buttons: Start / Pause & Reset */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={toggleTimer}
            className={`px-10 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          {(isRunning || (focusMode === 'pomo' && timeLeft !== durationMins * 60) || (focusMode === 'stopwatch' && stopwatchTime > 0)) && (
            <button
              type="button"
              onClick={handleReset}
              className="p-3 rounded-2xl bg-[#202024] hover:bg-[#28282e] border border-[#2e2e36] text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Completion Modal Celebration */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1c1c20] border border-[#2e2e38] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white m-0">Focus Session Complete!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Awesome work! You completed {durationMins} minutes of uninterrupted focus.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCompletedModalOpen(false);
                setTimeLeft(durationMins * 60);
              }}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
