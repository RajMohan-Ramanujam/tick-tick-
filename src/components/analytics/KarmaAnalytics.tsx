import React from 'react';
import { Flame, Award, CheckCircle2, Timer, Heart, Zap, TrendingUp, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KarmaAnalytics: React.FC = () => {
  const { karma } = useApp();

  const nextLevelScore =
    karma.score < 400
      ? 400
      : karma.score < 800
      ? 800
      : karma.score < 1200
      ? 1200
      : karma.score < 2000
      ? 2000
      : 5000;

  const currentLevelProgress = Math.min(100, Math.round((karma.score / nextLevelScore) * 100));

  const stats = [
    {
      title: 'Tasks Completed',
      value: karma.tasksCompletedTotal,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      bg: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: 'Focus Time Logged',
      value: `${karma.focusMinutesTotal} mins`,
      icon: <Timer className="w-5 h-5 text-amber-500" />,
      bg: 'bg-amber-500/10 text-amber-500',
    },
    {
      title: 'Habit Check-ins',
      value: karma.habitsCompletedTotal,
      icon: <Heart className="w-5 h-5 text-rose-500" />,
      bg: 'bg-rose-500/10 text-rose-500',
    },
    {
      title: 'Productivity Level',
      value: karma.level,
      icon: <Trophy className="w-5 h-5 text-indigo-500" />,
      bg: 'bg-indigo-500/10 text-indigo-500',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#18181c] text-slate-100 overflow-y-auto p-8 space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight m-0">
          ⚡ Karma & Productivity Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Track your productivity Karma score, unlock achievements, and measure daily focus output
        </p>
      </div>

      {/* Main Karma Score Hero Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30">
            <Flame className="w-10 h-10 fill-white animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
              Current Productivity Level
            </span>
            <h1 className="text-3xl font-black text-white m-0 tracking-tight">
              {karma.score} <span className="text-lg font-normal text-slate-400">Karma Points</span>
            </h1>
            <p className="text-sm font-semibold text-amber-400 mt-0.5">
              Rank: {karma.level}
            </p>
          </div>
        </div>

        {/* Level Progress Indicator */}
        <div className="w-full md:w-72 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Next Rank Goal</span>
            <span>{karma.score} / {nextLevelScore} pts</span>
          </div>
          <div className="w-full h-3 bg-[#242428] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
              style={{ width: `${currentLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#1e1e22] border border-[#2e2e34] shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-2xl ${s.bg}`}>{s.icon}</div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block">{s.title}</span>
              <span className="text-lg font-bold text-white">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* How to Earn Karma Info Box */}
      <div className="p-6 rounded-3xl bg-[#1e1e22] border border-[#2e2e34] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          How to Earn Karma Points:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#141416] border border-[#2a2a30]">
            <h4 className="font-bold text-emerald-500 mb-1">+15 Karma Points</h4>
            <p className="text-slate-400">
              For every completed task and cleared subtask checklist item.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#141416] border border-[#2a2a30]">
            <h4 className="font-bold text-amber-500 mb-1">+20 Karma Points</h4>
            <p className="text-slate-400">
              For completing a 25-minute Pomodoro focus session.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-[#141416] border border-[#2a2a30]">
            <h4 className="font-bold text-rose-500 mb-1">+10 Karma Points</h4>
            <p className="text-slate-400">
              For every daily habit check-in and active streak day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
