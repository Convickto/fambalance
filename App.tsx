import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/auth/WelcomeScreen';
import FamilyRegistration from './components/auth/FamilyRegistration';
import MemberRegistration from './components/auth/MemberRegistration';
import LoginScreen from './components/auth/LoginScreen';
import Dashboard from './components/dashboard/Dashboard';
import { AuthProvider } from './components/auth/AuthContext';
import WeeklyReport from './components/reports/WeeklyReport';
import ForgotPassword from './components/auth/ForgotPassword';
import FamilyManagement from './components/dashboard/FamilyManagement';

const App: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl h-[95vh] max-h-[850px] flex flex-col overflow-hidden">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/register-family" element={<FamilyRegistration />} />
            <Route path="/add-members/:familyId" element={<MemberRegistration />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/family-management" element={<FamilyManagement />} />
            <Route path="/report/:reportId" element={<WeeklyReport />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
  };

export default App;