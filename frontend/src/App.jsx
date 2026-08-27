import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';
import Logo from './components/UI/Logo';

// Pages (to be implemented)
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Farms from './pages/Farms/Farms';
import AddFarm from './pages/Farms/AddFarm';
import NewScan from './pages/Scan/NewScan';
import Scans from './pages/Scan/Scans';
import ScanResults from './pages/Scan/ScanResults';
import DiagnosisReport from './pages/Scan/DiagnosisReport';
import MarketListings from './pages/Market/MarketListings';
import CreateListing from './pages/Market/CreateListing';
import Profile from './pages/Profile/Profile';
import MessagesPage from './pages/Messages/MessagesPage';
import AdminPortal from './pages/Admin/AdminPortal';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--sp-4)', background: 'var(--bg-base)' }}>
      <Logo size={48} iconSize={24} className="animate-pulse" />
      <div className="skeleton" style={{ width: 120, height: 4, borderRadius: 2 }}></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Dashboard Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="farms/new" element={<AddFarm />} />
        <Route path="scan" element={<NewScan />} />
        <Route path="scans" element={<Scans />} />
        <Route path="scan/:scanId" element={<ScanResults />} />
        <Route path="diagnose/:scanId" element={<DiagnosisReport />} />
        <Route path="market" element={<MarketListings />} />
        <Route path="market/new" element={<CreateListing />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="admin" element={<AdminPortal />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
