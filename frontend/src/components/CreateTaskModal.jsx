import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const CreateTaskModal = ({ isOpen, onClose, projectId, members = [], onSubmit, taskToEdit = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setAssignedTo(taskToEdit.assignedTo?._id || '');
      setPriority(taskToEdit.priority || 'medium');
      setStatus(taskToEdit.status || 'todo');
      
      // Format ISO Date to YYYY-MM-DD for input field
      if (taskToEdit.dueDate) {
        const date = new Date(taskToEdit.dueDate);
        const formatted = date.toISOString().split('T')[0];
        setDueDate(formatted);
      } else {
        setDueDate('');
      }
    } else {
      // Clear fields for fresh task creation
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setStatus('todo');
      setDueDate('');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!dueDate) {
      setError('Please set a due date deadline');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const taskPayload = {
        title,
        description,
        project: projectId,
        assignedTo: assignedTo || null,
        priority,
        status,
        dueDate,
      };

      await onSubmit(taskPayload);
      onClose();
    } catch (err) {
      setError(err || 'Failed to submit task information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={taskToEdit ? 'Configure Task details' : 'Draft New Team Task'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Wireframe User Interface"
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specify context, constraints, and success markers..."
            rows={3}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 resize-none"
          />
        </div>

        {/* Member Assignment Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Assign Team Member
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          >
            <option value="">Unassigned (Leave empty)</option>
            {members.map((memberObj) => (
              <option key={memberObj.user._id} value={memberObj.user._id}>
                {memberObj.user.name} ({memberObj.user.email})
              </option>
            ))}
          </select>
        </div>

        {/* Priority & Status Controls */}
        <div className="grid grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={status}
              disabled={!taskToEdit} // Fresh drafts default to Todo
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Dev</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Due Date Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Due Date Deadline
          </label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 px-3.5 py-2 text-xs text-slate-200 outline-none transition-standard focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-medium text-slate-400 hover:bg-slate-950/60 hover:text-slate-200 transition-standard"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:brightness-110 active:scale-98 transition-standard disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : taskToEdit ? 'Save Settings' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
