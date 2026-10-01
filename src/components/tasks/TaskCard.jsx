import React from 'react';
import { Calendar, Edit2, Trash2, Clock } from 'lucide-react';

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'IN_PROGRESS':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'TODO':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'TODO':
      default:
        return 'To Do';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Priority Badge */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPriorityBadge(task.priority)}`}>
              {task.priority} Priority
            </span>

            {/* Quick Status Dropdown */}
            <select
              value={task.status}
              onChange={(e) => onStatusChange && onStatusChange(task.id, e.target.value)}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${getStatusBadge(task.status)}`}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onEdit && onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit Task"
              aria-label="Edit Task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete && onDelete(task)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Task"
              aria-label="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className={`text-base font-semibold text-slate-900 mb-1.5 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-slate-600 mb-4 line-clamp-3">
            {task.description}
          </p>
        )}
      </div>

      {/* Dates Footer */}
      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-1" title="Creation Date">
          <Clock className="w-3.5 h-3.5" />
          <span>Created {formatDate(task.created_at)}</span>
        </div>

        {task.due_date && (
          <div className={`flex items-center space-x-1 font-medium ${new Date(task.due_date) < new Date() && task.status !== 'COMPLETED' ? 'text-red-600' : 'text-slate-600'}`} title="Due Date">
            <Calendar className="w-3.5 h-3.5" />
            <span>Due {formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
