import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string;
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Prevent browser back button after logout
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear history and prevent back navigation
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = () => {
        window.history.pushState(null, '', window.location.href);
        navigate('/login', { replace: true });
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isAuthenticated, navigate]);

  // Prevent page caching (so back button doesn't show cached content)
  useEffect(() => {
    window.onpageshow = function(event) {
      if (event.persisted) {
        window.location.reload();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Clear any cached data
    sessionStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user?.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
