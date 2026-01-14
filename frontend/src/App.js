import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home'; 
import Login from './pages/login'; 
import Register from './pages/register'; 
import Inventory from './pages/Inventory';
import Sales from './pages/Sales'; 
import Profile from './pages/profile'; 
import AdminDashboard from './pages/AdminDashboard'; 
import AuditHistory from './pages/Audithistory';
import Footer from './components/footer'; // Import Footer

// Simple Guard to check roles
const ProtectedRoute = ({ children, roleRequired }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" />;
  if (roleRequired && userRole?.toLowerCase() !== roleRequired.toLowerCase()) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div style={layoutStyles.wrapper}>
        <div style={layoutStyles.content}>
            {children}
        </div>
        <Footer /> {/* Footer appears on every protected page */}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes - No Footer here for a clean login look */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Footer will be visible here */}
          <Route path="/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin Only Route */}
          <Route path="/audit" element={
            <ProtectedRoute roleRequired="admin">
              <AuditHistory />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Layout styles to keep footer at the bottom
const layoutStyles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    content: {
        flex: 1, // Pushes the footer to the bottom
    }
};

export default App;