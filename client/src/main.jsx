import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import StudentLayout from './components/StudentLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Results from './pages/Results';
import Certificates from './pages/Certificates';
import Meetings from './pages/Meetings';
import Messages from './pages/Messages';
import Documents from './pages/Documents';
import Payments from './pages/Payments';
import Profile from './pages/Profile';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/results" element={<Results />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3200} theme="colored" newestOnTop closeOnClick pauseOnHover />
    </AuthProvider>
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);