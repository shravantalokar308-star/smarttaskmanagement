import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  ArrowRight,
  TrendingUp,
  Calendar,
  Layers3
} from 'lucide-react';

const Dashboard = ({ toggleSidebar }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/tasks/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Could not download workspace statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
          <span className="text-sm font-semibold text-slate-400">Restoring Synapse Dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-white mb-1">Data Fetch Failure</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-950 transition-standard"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { stats, assignedTasks = [], projectsProgress = [] } = data || {};

  // Calculate overall completion percent
  const overallProgress = stats?.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar toggleSidebar={toggleSidebar} title="Dashboard Overview" />
      
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-2xl border border-slate-800/40 p-6 shadow-inner">
          <div>
            <h2 className="font-heading text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Hello Workspace Collaborator! 👋
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Track projects, invite members, assign tasks, and visualize team velocity in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:brightness-110 active:scale-98 transition-standard"
            >
              Browse Projects
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Tasks */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 glass-panel">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Tasks</span>
              <div className="rounded-lg bg-slate-800/60 p-2 text-slate-300">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold text-white">{stats?.totalTasks}</span>
              <span className="text-[10px] text-slate-500">global count</span>
            </div>
          </div>

          {/* Card 2: Completed Tasks */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 glass-panel">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Completed</span>
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold text-emerald-400">{stats?.completedTasks}</span>
              <span className="text-[10px] text-slate-500">done status</span>
            </div>
          </div>

          {/* Card 3: Pending Tasks */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-5 glass-panel">
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Pending</span>
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-2xl font-extrabold text-amber-400">{stats?.pendingTasks}</span>
              <span className="text-[10px] text-slate-500">todo & progress</span>
            </div>
          </div>

          {/* Card 4: Overdue Tasks */}
          <div className={`rounded-2xl border p-5 glass-panel ${
            stats?.overdueTasks > 0 ? 'border-red-500/40 bg-red-950/10 shadow-[0_0_15px_-4px_rgba(239,68,68,0.15)]' : 'border-slate-800/60 bg-slate-900/30'
          }`}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Overdue</span>
              <div className={`rounded-lg p-2 ${
                stats?.overdueTasks > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/60 text-slate-400'
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`font-heading text-2xl font-extrabold ${stats?.overdueTasks > 0 ? 'text-red-400' : 'text-slate-300'}`}>
                {stats?.overdueTasks}
              </span>
              <span className="text-[10px] text-slate-500">past deadline</span>
            </div>
          </div>

        </div>

        {/* Dashboard Detailed Grid: Assigned Tasks vs Project Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3 width): User's Assigned Tasks */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 glass-panel flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800/50 mb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-white tracking-wide">
                  Your Task Queue
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Tasks explicitly assigned to your profile</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {assignedTasks.length} Assigned
              </span>
            </div>

            {/* Task list container */}
            <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
              {assignedTasks.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center p-8">
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 mb-3 text-slate-500">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300">Zero Pending Tasks!</h4>
                  <p className="text-xs text-slate-500 max-w-[240px] mt-1">
                    Relax! Or head to the projects page to find more things to contribute to.
                  </p>
                </div>
              ) : (
                assignedTasks.map((task) => {
                  const isTaskOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date();
                  return (
                    <div 
                      key={task._id} 
                      onClick={() => navigate(`/projects/${task.project}`)}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4.5 bg-slate-950/30 hover:bg-slate-950/60 border-slate-800/60 hover:border-indigo-500/20 transition-standard cursor-pointer ${
                        isTaskOverdue ? 'border-red-500/25 bg-red-950/5' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[9px] font-bold text-indigo-400 tracking-wider uppercase bg-indigo-500/10 border border-indigo-500/15 rounded px-1.5 py-0.5">
                            {task.project?.name || 'Workspace'}
                          </span>
                          <span className={`text-[9px] font-bold tracking-wider uppercase rounded px-1.5 py-0.5 border ${
                            task.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/15' : 'bg-slate-800 text-slate-400 border-slate-700/60'
                          }`}>
                            {task.priority} Priority
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Right details: Status & Due Date */}
                      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t sm:border-t-0 border-slate-800/50 pt-2.5 sm:pt-0">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                          task.status === 'done' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' 
                            : task.status === 'in-progress' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/15' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/15'
                        }`}>
                          {task.status}
                        </span>
                        
                        <div className={`flex items-center gap-1.5 text-[11px] font-medium mt-1 ${
                          isTaskOverdue ? 'text-red-400 font-semibold' : 'text-slate-400'
                        }`}>
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column (1/3 width): Overall Velocity & Project Progress */}
          <div className="space-y-6">
            
            {/* Progress Circular Gauge Card */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 glass-panel text-center flex flex-col items-center">
              <h3 className="font-heading text-sm font-bold text-white tracking-wide mb-5 w-full text-left">
                Overall Task Velocity
              </h3>
              
              {/* SVG Circular Progress Meter */}
              <div className="relative flex items-center justify-center mb-4">
                <svg className="h-32 w-32">
                  {/* Track ring */}
                  <circle
                    className="stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                  {/* Progress indicator */}
                  <circle
                    className="stroke-indigo-500 progress-ring-circle"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - overallProgress / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                </svg>
                {/* Center text overlay */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-heading text-2xl font-extrabold text-white tracking-tight">
                    {overallProgress}%
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Done</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                <TrendingUp className="h-4 w-4" />
                <span>Overall project efficiency looks healthy</span>
              </div>
            </div>

            {/* Project Progress Lists Card */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 glass-panel">
              <h3 className="font-heading text-sm font-bold text-white tracking-wide mb-4">
                Workspace Projects
              </h3>
              
              <div className="space-y-4">
                {projectsProgress.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No active projects found.</p>
                ) : (
                  projectsProgress.map((project) => (
                    <div 
                      key={project._id}
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="group cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 group-hover:text-indigo-400 transition-colors duration-200">
                          {project.name}
                        </span>
                        <span className="font-semibold text-slate-400">{project.progress}%</span>
                      </div>
                      
                      {/* Custom styled progress bars */}
                      <div className="relative h-1.5 w-full rounded-full bg-slate-800/60 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{project.completedTasks} of {project.totalTasks} tasks done</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;
