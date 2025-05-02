import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogisticProvider } from './logistics/pages/LogisticContext';
import { AuthProvider, AuthContext } from './logistics/context/AuthContext';
import { useContext } from 'react';
import Navbar from './logistics/components/Navbar';
import Dashboard from './logistics/pages/Dashboard';
import LogisticMethods from './logistics/pages/LogisticMethods';
import Tracking from './logistics/pages/Tracking';
import Reports from './logistics/pages/Reports';
import Payments from './logistics/pages/Payments';
import PackagingList from './logistics/pages/PackagingList';
import ProfilePage from './logistics/pages/ProfilePage';
import SettingsPage from './logistics/pages/SettingsPage';
import Chat from './logistics/pages/Chat';
import Signup from './logistics/pages/Signup';
import Login from './logistics/pages/Login';

const ProtectedRoutes = () => {
  const { token } = useContext(AuthContext);
  console.log('ProtectedRoutes token:', token); // Debug log

  return token ? (
    <div className="flex h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 overflow-x-hidden">
        <motion.main
          key={window.location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="min-h-screen p-8"
        >
          <div className="max-w-[1920px] mx-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/logistics" element={<LogisticMethods />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/packaging" element={<PackagingList />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/chat" element={<Chat />} />
            </Routes>
          </div>
        </motion.main>
      </div>
    </div>
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LogisticProvider>
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/signup"
                element={
                  <motion.div
                    key="signup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="min-h-screen flex items-center justify-center bg-gray-50"
                  >
                    <Signup />
                  </motion.div>
                }
              />
              <Route
                path="/login"
                element={
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="min-h-screen flex items-center justify-center bg-gray-50"
                  >
                    <Login />
                  </motion.div>
                }
              />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </AnimatePresence>
        </LogisticProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;