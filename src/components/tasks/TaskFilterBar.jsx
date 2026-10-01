import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

export default function TaskFilterBar({
  search,
  status,
  priority,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onClearFilters,
}) {
  const isFiltered = Boolean(
    (search && search.trim() !== '') ||
    (status && status !== 'ALL') ||
    (priority && priority !== 'ALL')
  );

  const activeFilterCount =
    (search && search.trim() !== '' ? 1 : 0) +
    (status && status !== 'ALL' ? 1 : 0) +
    (priority && priority !== 'ALL' ? 1 : 0);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns & Reset Row */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Dropdown */}
        <div className="relative min-w-[130px]">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <div className="relative min-w-[130px]">
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}
