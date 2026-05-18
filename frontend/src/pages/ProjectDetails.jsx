import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/CreateTaskModal';
import InviteMemberModal from '../components/InviteMemberModal';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  Plus, 
  Search,
  Filter,
  CheckCircle,
  UserX,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

const ProjectDetails = ({ toggleSidebar }) => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering / Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchProjectWorkspace = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/projects/${projectId}`);
      setProject(response.data.project);
      setTasks(response.data.tasks);
    } catch (err) {
      console.error('Error fetching project workspace:', err);
      setError(err.response?.data?.message || 'Access denied or workspace not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectWorkspace();
  }, [projectId]);

  // Check if current logged-in user is project admin
  const currentMemberRecord = project?.members?.find(
    (m) => m.user?._id === user?._id
  );
  const isUserAdmin = currentMemberRecord?.role === 'admin';

  // --- Task Operations ---
  const handleTaskSubmit = async (taskPayload) => {
    try {
      if (taskToEdit) {
        // Edit Task
        const response = await api.put(`/tasks/${taskToEdit._id}`, taskPayload);
        setTasks((prev) => 
          prev.map((t) => (t._id === taskToEdit._id ? response.data : t))
        );
      } else {
        // Create Task
        const response = await api.post('/tasks', taskPayload);
        setTasks((prev) => [response.data, ...prev]);
      }
      setIsTaskModalOpen(false);
      setTaskToEdit(null);
    } catch (err) {
      console.error('Failed to submit task information:', err);
      throw err.response?.data?.message || 'Failed to sync task';
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((prev) => 
        prev.map((t) => (t._id === taskId ? response.data : t))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task status');
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleTriggerEdit = (task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  // --- Member Operations ---
  const handleInviteMember = async (email) => {
    try {
      const response = await api.post(`/projects/${projectId}/members`, { email });
      setProject(response.data); // Update project details with new member lists
    } catch (err) {
      console.error('Failed to add project member:', err);
      throw err.response?.data?.message || 'Failed to add coworker email';
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this team member from this project?')) return;
    try {
      const response = await api.delete(`/projects/${projectId}/members/${userId}`);
      setProject(response.data);
      
      // Auto-refresh tasks list to ensure removed member's tasks show as unassigned
      const taskRefreshed = await api.get(`/projects/${projectId}`);
      setTasks(taskRefreshed.data.tasks);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove project member');
    }
  };

  // Filter Tasks list in real-time
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in-progress');
  const doneTasks = filteredTasks.filter((t) => t.status === 'done');

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
          <span className="text-sm font-semibold text-slate-400">Loading Workspace Board...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-white mb-1">Access Failure</h3>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-950 transition-standard"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Navbar 
        toggleSidebar={toggleSidebar} 
        title={project?.name || 'Project Workspace'} 
        showSearch={true}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="flex-1 p-6 space-y-6 flex flex-col">
        
        {/* Workspace Banner Info & Actions */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 bg-slate-900/10 border border-slate-800/40 p-5 rounded-2xl glass-panel">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/15 rounded px-2 py-0.5">
                Workspace Active
              </span>
              <span className="text-[10px] text-slate-400">
                Created by {project?.creator?.name}
              </span>
            </div>
            <h2 className="font-heading text-lg font-bold text-white">{project?.name}</h2>
            {project?.description && (
              <p className="text-xs text-slate-400 max-w-2xl">{project.description}</p>
            )}
          </div>

          {/* Action Tools: Member Manager + Add Task */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Search filter for mobile sizes (since navbar search hides) */}
            <div className="md:hidden relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-800/60 bg-slate-950/40 py-2 pl-9 pr-4 text-xs text-slate-200 outline-none focus:border-indigo-500/50"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-950/40 px-3 py-2 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-slate-300 outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Team Members Invite (Admin only) */}
            {isUserAdmin && (
              <button
                onClick={() => setIsMemberModalOpen(true)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 hover:border-indigo-500/50 bg-indigo-500/5 px-4.5 py-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-standard"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </button>
            )}

            {/* New Task creation (Admin only) */}
            {isUserAdmin && (
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4.5 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-98 transition-standard"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            )}

          </div>
        </div>

        {/* Member management panel (Side drawer or top expand bar) */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-4 glass-panel">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Users className="h-4 w-4 text-indigo-400" />
            <span>Workspace Roster ({project?.members?.length || 1})</span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {project?.members?.map((memberObj) => {
              const mUser = memberObj.user;
              if (!mUser) return null;
              
              const isCreator = project.creator?._id === mUser._id;
              const isSelf = user?._id === mUser._id;

              return (
                <div 
                  key={mUser._id} 
                  className={`flex items-center gap-2 rounded-xl bg-slate-950/40 border border-slate-800/40 px-3 py-1.5 text-xs text-slate-300 ${
                    isSelf ? 'border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.2)]' : ''
                  }`}
                >
                  <div 
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ backgroundColor: mUser.avatarColor || '#6366F1' }}
                  >
                    {mUser.name.slice(0,2).toUpperCase()}
                  </div>
                  <span className="font-medium truncate max-w-[100px]">{mUser.name}</span>
                  
                  {/* Role Indicators */}
                  <span className="text-[9px] px-1 bg-slate-800 text-slate-400 rounded uppercase font-semibold">
                    {memberObj.role}
                  </span>

                  {/* Remove User Action (Admin can remove non-creators, and cannot remove themselves) */}
                  {isUserAdmin && !isCreator && !isSelf && (
                    <button
                      onClick={() => handleRemoveMember(mUser._id)}
                      className="ml-1 text-slate-500 hover:text-rose-400 rounded transition-colors duration-150"
                      title={`Remove ${mUser.name}`}
                    >
                      <UserX className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* KANBAN BOARD SYSTEM */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch min-h-[500px]">
          
          {/* COLUMN 1: TODO */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/10 p-4.5 flex flex-col glass-panel">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400 glow-ring-indigo" />
                <h3 className="font-heading text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Todo
                </h3>
              </div>
              <span className="rounded-md bg-slate-850 px-2 py-0.5 text-xs font-semibold text-slate-400">
                {todoTasks.length}
              </span>
            </div>

            {/* Tasks list inside Todo column */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 max-h-[60vh] column-scrollbar">
              {todoTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/60 rounded-xl py-12">
                  <FolderOpen className="h-6 w-6 text-slate-600 mb-2" />
                  <span className="text-xs font-medium text-slate-500">No items drafted</span>
                </div>
              ) : (
                todoTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isUserAdmin}
                    currentUserId={user?._id}
                    onEdit={handleTriggerEdit}
                    onDelete={handleTaskDelete}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 2: IN DEVELOPMENT */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/10 p-4.5 flex flex-col glass-panel">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <h3 className="font-heading text-sm font-bold text-slate-200 uppercase tracking-wider">
                  In Development
                </h3>
              </div>
              <span className="rounded-md bg-slate-850 px-2 py-0.5 text-xs font-semibold text-slate-400">
                {inProgressTasks.length}
              </span>
            </div>

            {/* Tasks list inside In Dev column */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 max-h-[60vh] column-scrollbar">
              {inProgressTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/60 rounded-xl py-12">
                  <FolderOpen className="h-6 w-6 text-slate-600 mb-2" />
                  <span className="text-xs font-medium text-slate-500">No active work</span>
                </div>
              ) : (
                inProgressTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isUserAdmin}
                    currentUserId={user?._id}
                    onEdit={handleTriggerEdit}
                    onDelete={handleTaskDelete}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: COMPLETED */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/10 p-4.5 flex flex-col glass-panel">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <h3 className="font-heading text-sm font-bold text-slate-200 uppercase tracking-wider">
                  Completed
                </h3>
              </div>
              <span className="rounded-md bg-slate-850 px-2 py-0.5 text-xs font-semibold text-slate-400">
                {doneTasks.length}
              </span>
            </div>

            {/* Tasks list inside Done column */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 max-h-[60vh] column-scrollbar">
              {doneTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/60 rounded-xl py-12">
                  <CheckCircle className="h-6 w-6 text-slate-600 mb-2" />
                  <span className="text-xs font-medium text-slate-500">No tasks completed</span>
                </div>
              ) : (
                doneTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    isAdmin={isUserAdmin}
                    currentUserId={user?._id}
                    onEdit={handleTriggerEdit}
                    onDelete={handleTaskDelete}
                    onStatusChange={handleTaskStatusChange}
                  />
                ))
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Task Creation & Editing Dialog Trigger */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        projectId={projectId}
        members={project?.members || []}
        onSubmit={handleTaskSubmit}
        taskToEdit={taskToEdit}
      />

      {/* Roster Coworker Invite Dialog Trigger */}
      <InviteMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
};

export default ProjectDetails;
