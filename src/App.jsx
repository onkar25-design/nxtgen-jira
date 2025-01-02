import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from "@/components/sidebar/layout";
import LoginPage from "@/components/login/LoginPage";
import SignupPage from "@/components/login/SignupPage";
import ForgotPasswordPage from "@/components/login/ForgotPasswordPage";
import ProjectsPage from "@/components/project_page/project_page";
import WorkflowBoard from "@/components/task management/workflow-board";
import StaffManagement from "@/components/staff/StaffManagement";
import TimelinePage from "@/components/timeline/timeline";
import { supabase } from '../supabaseClient';
import ResetPasswordPage from './components/login/ResetPasswordPage';
import TasksPage from "@/components/task_page/TasksPage";
import Dashboard from "@/components/Dashboard/Dashboard";

function App() {
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem('currentPage') || 'projects';
  });
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    return localStorage.getItem('selectedProjectId') || null;
  });

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        // Clear user data on logout
        setUserName(null);
        setUserRole(null);
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Save currentPage to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Save selectedProjectId to localStorage when it changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProjectId]);

  const renderPage = () => {
    switch (currentPage) {
      case 'projects':
        return (
          <ProjectsPage 
            setCurrentPage={setCurrentPage} 
            setSelectedProjectId={setSelectedProjectId} 
          />
        );
      case 'workflow':
        return selectedProjectId ? (
          <WorkflowBoard projectId={selectedProjectId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700">No Project Selected</h2>
              <p className="text-gray-500 mt-2">Please select a project from the projects page.</p>
              <button 
                onClick={() => {
                  setCurrentPage('projects');
                  setSelectedProjectId(null);
                }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Projects
              </button>
            </div>
          </div>
        );
      case 'staff':
        return <StaffManagement />;
      case 'timeline':
        return <TimelinePage />;
      case 'tasks':
        return <TasksPage />;
      default:
        return <Dashboard />;
    }
  };

  const AuthenticatedApp = () => (
    <Layout 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen} 
      setCurrentPage={setCurrentPage}
      setSelectedProjectId={setSelectedProjectId}
      userName={userName}
      userRole={userRole}
    >
      {renderPage()}
    </Layout>
  );

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            !session ? (
              <LoginPage setUserName={setUserName} setUserRole={setUserRole} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            !session ? (
              <SignupPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            !session ? (
              <ForgotPasswordPage />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            session ? (
              <AuthenticatedApp />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
          path="/timeline" 
          element={<TimelinePage />}
        />

        {/* Redirect root to login or dashboard based on auth status */}
        <Route
          path="/"
          element={
            <Navigate to={session ? "/dashboard" : "/login"} replace />
          }
        />

        {/* Catch all other routes and redirect to dashboard or login */}
        <Route
          path="*"
          element={
            <Navigate to={session ? "/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
