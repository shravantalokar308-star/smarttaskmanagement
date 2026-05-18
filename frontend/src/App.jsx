import React, { useState } from 'react';
  import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  import { AuthProvider, useAuth } from './context/AuthContext';
  import Sidebar from './components/Sidebar';
  import Dashboard from './pages/Dashboard';
  import Projects from './pages/Projects';
  import ProjectDetails from './pages/ProjectDetails';
  import Login from './pages/Login';
  import Register from './pages/Register';

  import { GoogleOAuthProvider } from '@react-oauth/google';

// Protecting Private Routes with Loading guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0B0D19]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-750 border-t-indigo-500" />
          <span className="text-xs font-semibold text-slate-400">Loading Workspace Credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Standard Shell Layout wrapping all Protected Content
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="relative flex min-h-screen w-full bg-[#0B0D19] overflow-hidden">
      {/* Glowing Ambient Mesh Orbs */}
      <div className="synapse-bg" />

      {/* Modular Sticky Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Scrollable primary content window */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Routes>
          <Route path="/" element={<Dashboard toggleSidebar={toggleSidebar} />} />
          <Route path="/projects" element={<Projects toggleSidebar={toggleSidebar} />} />
          <Route path="/projects/:id" element={<ProjectDetails toggleSidebar={toggleSidebar} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id';
  console.log("DEBUG: googleClientId =", googleClientId, "import.meta.env.VITE_GOOGLE_CLIENT_ID =", import.meta.env.VITE_GOOGLE_CLIENT_ID);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public auth portals */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected dashboard portals */}
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

  export default App;
