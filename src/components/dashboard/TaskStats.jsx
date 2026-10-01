import React from 'react';
import { CheckSquare, Clock, Flame, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function TaskStats({ stats, loading = false }) {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: CheckSquare,
      bgColor: 'bg-sky-50 text-sky-600 border-sky-100',
      valueColor: 'text-slate-900',
    },
    {
      title: 'To Do',
      value: stats?.todo ?? 0,
      icon: Clock,
      bgColor: 'bg-slate-100 text-slate-600 border-slate-200',
      valueColor: 'text-slate-800',
    },
    {
      title: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Flame,
      bgColor: 'bg-amber-50 text-amber-600 border-amber-100',
      valueColor: 'text-amber-900',
    },
    {
      title: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      valueColor: 'text-emerald-900',
    },
    {
      title: 'High Priority',
      value: stats?.highPriority ?? 0,
      icon: AlertTriangle,
      bgColor: 'bg-rose-50 text-rose-600 border-rose-100',
      valueColor: 'text-rose-900',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-pulse flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-slate-200 rounded w-16"></div>
              <div className="h-5 bg-slate-200 rounded w-10"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3 hover:border-slate-300 transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${card.bgColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                {card.title}
              </p>
              <p className={`text-xl font-extrabold ${card.valueColor}`}>
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
