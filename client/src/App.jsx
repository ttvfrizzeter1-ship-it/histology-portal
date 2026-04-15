import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import News from './pages/News';
import Events from './pages/Events';
import Materials from './pages/Materials';
import Atlas from './pages/Atlas';
import Admin from './pages/Admin';
import Moodle from './pages/Moodle';
import Chat from './pages/Chat';
import Aristo from './pages/Aristo';
import StudentHub from './pages/StudentHub';
import Layout from './components/Layout';
import ThemeToggle from './components/ThemeToggle';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  return user ? children : <Navigate to="/login" replace />;
}
function TeacherRoute({ children }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'teacher') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><Layout><News /></Layout></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
            <Route path="/materials" element={<ProtectedRoute><Layout><Materials /></Layout></ProtectedRoute>} />
            <Route path="/atlas" element={<ProtectedRoute><Layout><Atlas /></Layout></ProtectedRoute>} />
            <Route path="/moodle" element={<ProtectedRoute><Layout><Moodle /></Layout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Layout><Chat /></Layout></ProtectedRoute>} />
            <Route path="/aristo" element={<ProtectedRoute><Layout><Aristo /></Layout></ProtectedRoute>} />
            <Route path="/student" element={<ProtectedRoute><Layout><StudentHub /></Layout></ProtectedRoute>} />
            <Route path="/admin" element={<TeacherRoute><Layout><Admin /></Layout></TeacherRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ThemeToggle />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
