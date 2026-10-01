import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, task = null, isSubmitting = false }) {
  const [error, setError] = useState('');

  if (!isOpen || !task) return null;

  const handleConfirm = async () => {
    setError('');
    try {
      await onConfirm(task.id);
    } catch (err) {
      console.error('Task deletion error:', err);
      setError(err.message || 'Failed to delete task. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div 
        className="relative bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900">
              Delete Task
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{task.title}"</span>? This action cannot be undone.
            </p>

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 flex items-center shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Task'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
