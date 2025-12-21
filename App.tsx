import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { ClubView } from './pages/ClubView';
import { JoinClub } from './pages/JoinClub'; 

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
  const { currentUser } = useApp();
  return currentUser ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingWrapper />} />
      <Route path="/join/:code" element={<JoinClub />} />
      <Route 
        path="/dashboard" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/club/:id" 
        element={
          <PrivateRoute>
            <ClubView />
          </PrivateRoute>
        } 
      />
    </Routes>
  );
};

// Wrapper to handle redirect if already logged in
const LandingWrapper = () => {
  const { currentUser } = useApp();
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  return <Landing />;
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}