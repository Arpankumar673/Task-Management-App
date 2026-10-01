import React from 'react';
import TaskCard from './TaskCard';
import { CheckSquare, AlertCircle, RefreshCw, FilterX } from 'lucide-react';

export default function TaskList({
  tasks,
  loading,
  error,
  isFiltered,
  onRetry,
  onEdit,
  onDelete,
  onStatusChange,
  onCreateClick,
  onClearFilters,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-5 bg-slate-200 rounded w-24"></div>
              <div className="h-5 bg-slate-200 rounded w-16"></div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="h-4 bg-slate-200 rounded w-28"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-md mx-auto my-6 shadow-sm">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to Load Tasks</h3>
        <p className="text-slate-600 text-sm mb-5">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    if (isFiltered) {
      // Empty Search/Filter Result State
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md mx-auto my-6 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-100">
            <FilterX className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Matching Tasks</h3>
          <p className="text-slate-500 text-sm mb-5">
            No tasks match your current search or filter criteria. Try adjusting your filters.
          </p>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <span>Clear Active Filters</span>
          </button>
        </div>
      );
    }

    // Zero Overall Tasks State
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-6">
        <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-100">
          <CheckSquare className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No tasks found</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
          You haven't created any tasks yet. Get started by adding your first task!
        </p>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <span>+ Add Your First Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}
