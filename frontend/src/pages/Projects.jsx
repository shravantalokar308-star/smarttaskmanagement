import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import CreateProjectModal from '../components/CreateProjectModal';
import { useAuth } from '../context/AuthContext';
import { 
  FolderGit2, 
  Plus, 
  Users, 
  ChevronRight,
  ShieldCheck,
  User,
  AlertCircle
} from 'lucide-react';

const Projects = ({ toggleSidebar }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Could not retrieve projects list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const response = await api.post('/projects', projectData);
      // Append the newly created project to the beginning of the list
      setProjects((prev) => [response.data, ...prev]);
      // Navigate straight to the detail page for the project to invite members!
      navigate(`/projects/${response.data._id}`);
    } catch (err) {
      console.error('Failed to create project workspace:', err);
      throw err.response?.data?.message || 'Failed to create workspace project';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Navbar toggleSidebar={toggleSidebar} title="Workspace Projects" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Action Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg md:text-xl font-bold text-white tracking-wide">
              All Workspace Projects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select or bootstrap a collaborative team workspace below
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:brightness-110 active:scale-98 transition-standard"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />
              <span className="text-xs text-slate-400">Loading projects list...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-center max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-white">Error Downloading Data</h4>
            <p className="text-xs text-slate-400 mt-1 mb-3">{error}</p>
            <button
              onClick={fetchProjects}
              className="rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-white hover:bg-slate-950 transition-standard"
            >
              Retry Sync
            </button>
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/10 p-12 text-center max-w-lg mx-auto mt-8 glass-panel">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 mb-4 text-slate-500 inline-flex">
              <FolderGit2 className="h-8 w-8" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-2">
              No Projects Workspace Setup
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed">
              It looks like you aren't part of any project workspace yet. Bootstrap your own project and invite coworkers to start managing tasks together!
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/10 hover:brightness-110 mx-auto transition-standard"
            >
              <Plus className="h-4 w-4" />
              Bootstrap First Project
            </button>
          </div>
        ) : (
          /* Project Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              // Locate current user in project members to get their specific role badge
              const userMember = project.members.find(
                (m) => m.user?._id === user?._id
              );
              const isUserAdmin = userMember?.role === 'admin';

              return (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/20 p-5 glass-panel glass-panel-hover flex flex-col justify-between cursor-pointer min-h-[190px]"
                >
                  <div className="space-y-3.5">
                    {/* Header: Project Name & Role Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400 border border-indigo-500/15">
                        <FolderGit2 className="h-5 w-5" />
                      </div>
                      
                      {/* Project specific Role Badge */}
                      {isUserAdmin ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
                          <ShieldCheck className="h-3 w-3" />
                          Admin Creator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                          <User className="h-3 w-3" />
                          Member
                        </span>
                      )}
                    </div>

                    {/* Description Details */}
                    <div>
                      <h3 className="font-heading text-sm font-bold text-slate-100 group-hover:text-white transition-colors duration-200 line-clamp-1">
                        {project.name}
                      </h3>
                      {project.description ? (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {project.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 italic mt-1.5">No workspace description.</p>
                      )}
                    </div>
                  </div>

                  {/* Footer Details: Members & Link triggers */}
                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-4 mt-5">
                    {/* Members Count with visuals */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="h-4 w-4" />
                      <span>{project.members?.length || 1} team members</span>
                    </div>

                    {/* Forward Pointer */}
                    <div className="rounded-lg p-1 text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/5 transition-standard">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Creation Modal Hook */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};

export default Projects;
