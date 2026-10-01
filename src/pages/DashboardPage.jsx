import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/taskService';
import { useDebounce } from '../hooks/useDebounce';
import TaskStats from '../components/dashboard/TaskStats';
import TaskFilterBar from '../components/tasks/TaskFilterBar';
import TaskList from '../components/tasks/TaskList';
import TaskFormModal from '../components/tasks/TaskFormModal';
import DeleteConfirmModal from '../components/tasks/DeleteConfirmModal';
import { LogOut, CheckSquare, User, Plus, WifiOff } from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  // Task & Stats State
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    completed: 0,
    lowPriority: 0,
    mediumPriority: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realtimeWarning, setRealtimeWarning] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // 300ms search debouncing
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Delete Modal State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch Stats from Supabase
  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await taskService.getTaskStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load task stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Tasks with active filters
  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskService.getTasks({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Unable to fetch tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  // Load tasks on debouncedSearch or filter change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Initial load for statistics
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Realtime Subscription Setup & Lifecycle Management
  useEffect(() => {
    if (!user?.id) return;

    let channel = null;
    try {
      channel = taskService.subscribeToTaskChanges(user.id, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        if (eventType === 'INSERT') {
          loadTasks();
          loadStats();
          showToast('New task added!', 'info');
        } else if (eventType === 'UPDATE') {
          loadTasks();
          loadStats();
        } else if (eventType === 'DELETE') {
          loadTasks();
          loadStats();
        }
      });
    } catch (err) {
      console.warn('Realtime subscription connection issue:', err);
      setRealtimeWarning(true);
    }

    // Cleanup subscription on unmount or user change
    return () => {
      if (channel) {
        taskService.unsubscribe(channel);
      }
    };
  }, [user?.id, loadTasks, loadStats]);

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Close Form Modal
  const handleCloseFormModal = () => {
    if (!isFormSubmitting) {
      setIsFormOpen(false);
      setEditingTask(null);
    }
  };

  // Submit Create or Edit Form
  const handleFormSubmit = async (taskData) => {
    setIsFormSubmitting(true);
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, taskData);
        showToast('Task updated successfully!');
      } else {
        await taskService.createTask(taskData);
        showToast('Task created successfully!');
      }
      setIsFormOpen(false);
      setEditingTask(null);
      await Promise.all([loadTasks(), loadStats()]);
    } catch (err) {
      console.error('Save task error:', err);
      throw err;
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (task) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  };

  // Close Delete Modal
  const handleCloseDeleteModal = () => {
    if (!isDeleteSubmitting) {
      setIsDeleteOpen(false);
      setDeletingTask(null);
    }
  };

  // Confirm Delete Action
  const handleDeleteConfirm = async (taskId) => {
    setIsDeleteSubmitting(true);
    try {
      await taskService.deleteTask(taskId);
      showToast('Task deleted successfully!');
      setIsDeleteOpen(false);
      setDeletingTask(null);
      await Promise.all([loadTasks(), loadStats()]);
    } catch (err) {
      console.error('Delete task error:', err);
      throw err;
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  // Quick Status Change from TaskCard
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      showToast('Status updated!');
      await Promise.all([loadTasks(), loadStats()]);
    } catch (err) {
      console.error('Quick status update failed:', err);
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const displayName = user?.user_metadata?.full_name || user?.email || 'User';
  const isFiltered = Boolean(
    (search && search.trim() !== '') ||
    (statusFilter && statusFilter !== 'ALL') ||
    (priorityFilter && priorityFilter !== 'ALL')
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center space-x-2 ${
              toast.type === 'error'
                ? 'bg-red-600 text-white'
                : toast.type === 'info'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-900 text-white'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shadow-sm">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-slate-900">Task Manager</span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <User className="w-4 h-4 text-slate-500" />
              <span className="font-medium truncate max-w-[140px] sm:max-w-none">
                {displayName}
              </span>
            </div>

            <button
              onClick={handleSignOut}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-red-600 hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Realtime Non-Blocking Warning */}
        {realtimeWarning && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center space-x-2">
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>Live sync is operating in fallback polling mode. Manual updates will continue to save normally.</span>
          </div>
        )}

        {/* Workspace Title & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Task Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Organize, track, search, and manage your personal tasks
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Dashboard Overview Statistics */}
        <TaskStats stats={stats} loading={statsLoading} />

        {/* Search & Filter Bar */}
        <TaskFilterBar
          search={search}
          status={statusFilter}
          priority={priorityFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onClearFilters={handleClearFilters}
        />

        {/* Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          error={error}
          isFiltered={isFiltered}
          onRetry={loadTasks}
          onEdit={handleOpenEditModal}
          onDelete={handleOpenDeleteModal}
          onStatusChange={handleStatusChange}
          onCreateClick={handleOpenCreateModal}
          onClearFilters={handleClearFilters}
        />
      </main>

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        initialData={editingTask}
        isSubmitting={isFormSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        task={deletingTask}
        isSubmitting={isDeleteSubmitting}
      />
    </div>
  );
}
