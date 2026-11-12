import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Mothers from './pages/Mothers';
import Newborns from './pages/Newborns';
import QRVerificationMobile from './pages/QRVerificationMobile';
import Screenings from './pages/Screenings';
import MaternalAssessments from './pages/MaternalAssessments';
import Discharge from './pages/Discharge';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import ActivityLogs from './pages/ActivityLogs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#000',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#0d9488',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/mothers" element={<Mothers />} />
                    <Route path="/newborns" element={<Newborns />} />
                    <Route path="/qr-verification" element={<QRVerificationMobile />} />
                    <Route path="/screenings" element={<Screenings />} />
                    <Route path="/maternal-assessments" element={<MaternalAssessments />} />
                    <Route path="/discharge" element={<Discharge />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/activity-logs" element={<ActivityLogs />} />
                    <Route 
                      path="/users" 
                      element={
                        <ProtectedRoute requireRole="administrator">
                          <Users />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
