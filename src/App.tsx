import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import FileView from './pages/FileView.tsx';
import SharedFiles from './pages/SharedFiles.tsx';
import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/file/:fileId" element={<ProtectedRoute><Layout><FileView /></Layout></ProtectedRoute>} />
          <Route path="/shared" element={<ProtectedRoute><Layout><SharedFiles /></Layout></ProtectedRoute>} />
          <Route path="/s/:shareId" element={<FileView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;