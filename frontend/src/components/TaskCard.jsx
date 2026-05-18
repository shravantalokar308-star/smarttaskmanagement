import React from 'react';
import { Calendar, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';

const TaskCard = ({ task, isAdmin, onEdit, onDelete, onStatusChange, currentUserId }) => {
  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date();
  
  // Format due date elegantly
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Curated status styling
  const statusColors = {
    'todo': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'done': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  // Curated priority styling
  const priorityColors = {
    'low': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'medium': 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    'high': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  };

  const isAssignedToCurrentUser = task.assignedTo && task.assignedTo._id === currentUserId;

  return (
    <div className={`group relative rounded-xl border p-4.5 transition-all duration-300 glass-panel shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_-4px_rgba(139,92,246,0.15)] ${
      isOverdue 
        ? 'border-red-500/40 bg-red-950/10 shadow-[0_0_15px_-4px_rgba(239,68,68,0.15)]' 
        : 'border-slate-800/60 hover:border-slate-700/80 bg-slate-900/30'
    }`}>
      {/* Top Banner: Status & Priority Indicators */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex gap-1.5 flex-wrap">
          {/* Status Pill */}
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[task.status]}`}>
            {task.status}
          </span>
          {/* Priority Pill */}
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>

        {/* Administration Actions */}
        {isAdmin && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-950/60 hover:text-slate-200"
              title="Edit Task"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(task._id)}
              className="rounded-lg p-1 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
              title="Delete Task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Task Content */}
      <h4 className="font-medium text-slate-100 text-sm mb-1 leading-snug line-clamp-1 group-hover:text-white transition-colors duration-200">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Overdue Warning Indicator */}
      {isOverdue && (
        <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-2.5 py-1 text-[11px] font-medium text-red-400 mb-4 animate-pulse">
          <AlertCircle className="h-3.5 w-3.5" />
          Overdue Deadline!
        </div>
      )}

      {/* Footer: Due Date, Assignee, Status Change Dropdown */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/40">
        {/* Due Date Indicator */}
        <div className={`flex items-center gap-1.5 text-[11px] font-medium ${
          isOverdue ? 'text-red-400' : 'text-slate-400'
        }`}>
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(task.dueDate)}</span>
        </div>

        {/* Dynamic Assignment / Member controls */}
        <div className="flex items-center gap-2">
          {/* Status Quick Update for Assignees or Admins */}
          {(isAdmin || isAssignedToCurrentUser) ? (
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task._id, e.target.value)}
              className="rounded-md border border-slate-800/60 bg-slate-950/60 px-1.5 py-0.5 text-[10px] font-medium text-slate-300 outline-none transition-standard focus:border-indigo-500/50 hover:bg-slate-900/80 cursor-pointer"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Dev</option>
              <option value="done">Done</option>
            </select>
          ) : (
            task.status === 'done' && (
              <span className="inline-flex items-center text-emerald-400" title="Completed">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            )
          )}

          {/* Assignee Avatar */}
          {task.assignedTo ? (
            <div 
              className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-[9px] font-bold text-white border border-white/5"
              style={{ backgroundColor: task.assignedTo.avatarColor || '#6366F1' }}
              title={`Assigned to ${task.assignedTo.name}`}
            >
              {task.assignedTo.name.slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <div 
              className="flex h-6.5 w-6.5 items-center justify-center rounded-full text-[9px] font-medium text-slate-500 border border-slate-800/60 bg-slate-950/20"
              title="Unassigned"
            >
              --
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
