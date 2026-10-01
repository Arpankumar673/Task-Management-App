import { supabase } from '../lib/supabase';

/**
 * Escapes PostgREST special characters from search string to prevent query breakage.
 */
function sanitizeSearchTerm(term) {
  if (!term) return '';
  // Remove PostgREST operator delimiters: commas, parentheses, quotes
  const cleaned = term.replace(/[\(\),"\\]/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned;
}

export const taskService = {
  /**
   * Fetch tasks for the authenticated user with optional search, status, and priority filters.
   * Scoped automatically by PostgreSQL Row Level Security (RLS).
   */
  async getTasks(filters = {}) {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    // Status filter
    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'ALL') {
      query = query.eq('priority', filters.priority);
    }

    // Search query across title and description (case-insensitive & sanitized)
    if (filters.search && filters.search.trim()) {
      const cleanTerm = sanitizeSearchTerm(filters.search);
      if (cleanTerm) {
        const pattern = `%${cleanTerm}%`;
        query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error(error.message || 'Failed to fetch tasks from database');
    }

    return data || [];
  },

  /**
   * Get overall task statistics for the authenticated user.
   */
  async getTaskStats() {
    const { data, error } = await supabase
      .from('tasks')
      .select('status, priority');

    if (error) {
      console.error('Error fetching task stats:', error);
      throw new Error(error.message || 'Failed to fetch task statistics');
    }

    const stats = {
      total: data.length,
      todo: data.filter((t) => t.status === 'TODO').length,
      inProgress: data.filter((t) => t.status === 'IN_PROGRESS').length,
      completed: data.filter((t) => t.status === 'COMPLETED').length,
      lowPriority: data.filter((t) => t.priority === 'LOW').length,
      mediumPriority: data.filter((t) => t.priority === 'MEDIUM').length,
      highPriority: data.filter((t) => t.priority === 'HIGH').length,
    };

    return stats;
  },

  /**
   * Create a new task.
   */
  async createTask(taskData) {
    const { title, description, status = 'TODO', priority = 'MEDIUM', due_date } = taskData;

    const trimmedTitle = title ? title.trim() : '';
    if (!trimmedTitle) {
      throw new Error('Task title cannot be empty');
    }

    const payload = {
      title: trimmedTitle,
      description: description ? description.trim() : null,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      due_date: due_date || null,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw new Error(error.message || 'Failed to create task');
    }

    return data;
  },

  /**
   * Update an existing task.
   */
  async updateTask(taskId, updates) {
    if (!taskId) {
      throw new Error('Task ID is required for update');
    }

    const payload = {};
    if (updates.title !== undefined) {
      const trimmedTitle = updates.title ? updates.title.trim() : '';
      if (!trimmedTitle) {
        throw new Error('Task title cannot be empty');
      }
      payload.title = trimmedTitle;
    }

    if (updates.description !== undefined) {
      payload.description = updates.description ? updates.description.trim() : null;
    }

    if (updates.status !== undefined) {
      payload.status = updates.status;
    }

    if (updates.priority !== undefined) {
      payload.priority = updates.priority;
    }

    if (updates.due_date !== undefined) {
      payload.due_date = updates.due_date || null;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw new Error(error.message || 'Failed to update task');
    }

    return data;
  },

  /**
   * Delete a task.
   */
  async deleteTask(taskId) {
    if (!taskId) {
      throw new Error('Task ID is required for deletion');
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw new Error(error.message || 'Failed to delete task');
    }

    return true;
  },

  /**
   * Subscribe to real-time changes on public.tasks table for the current user.
   */
  subscribeToTaskChanges(userId, callback) {
    if (!userId) return null;

    const channelName = `public:tasks:${userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (callback) callback(payload);
        }
      )
      .subscribe((status, err) => {
        if (err || status === 'CHANNEL_ERROR') {
          console.warn('Supabase Realtime channel status:', status, err);
        }
      });

    return channel;
  },

  /**
   * Unsubscribe and remove Supabase channel.
   */
  unsubscribe(channel) {
    if (channel) {
      supabase.removeChannel(channel);
    }
  },
};
