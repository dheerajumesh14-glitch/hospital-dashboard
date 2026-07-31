import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import NurseDashboard        from './pages/NurseDashboard';
import DoctorDashboard       from './pages/DoctorDashboard';
import AdminDashboard        from './pages/AdminDashboard';
import PharmacistDashboard   from './pages/PharmacistDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import ProtectedRoute        from './components/ProtectedRoute';
import ChatWidget            from './components/ChatWidget';

const ROLE_ROUTES = {
  nurse:        '/nurse',
  doctor:       '/doctor',
  admin:        '/admin',
  pharmacist:   '/pharmacist',
  receptionist: '/receptionist',
};

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RoleRedirect />} />

        <Route path="/nurse" element={
          <ProtectedRoute allowedRoles={['nurse']}>
            <NurseDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/doctor" element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/pharmacist" element={
          <ProtectedRoute allowedRoles={['pharmacist']}>
            <PharmacistDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/receptionist" element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <ReceptionistDashboard />
          </ProtectedRoute>
        }/>

        <Route path="/unauthorized" element={
          <div style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', height:'100vh', gap:16
          }}>
            <div style={{fontSize:48}}>🚫</div>
            <h2 style={{fontSize:20, color:'#1a1a2e'}}>Access Denied</h2>
            <p style={{color:'#888'}}>You don't have permission to view this page.</p>
            <a href="/login" style={{color:'#185FA5'}}>Go back to login</a>
          </div>
        }/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global chat widget - only shows once a user is logged in (not on
          the Login page), and adapts its welcome message to the user's role */}
      {user && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          <ChatWidget apiUrl="http://localhost:8000/chat" role={user.role} />
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}