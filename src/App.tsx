
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogisticProvider } from './pages/LogisticContext.tsx';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LogisticMethods from './pages/LogisticMethods';
import Tracking from './pages/Tracking';
import Reports from './pages/Reports';
import Payments from './pages/Payments';
import PackagingList from './pages/PackagingList';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import Chat from './pages/Chat';

function App() {
  return (
    <BrowserRouter>
      <LogisticProvider>
        <div className="flex h-screen bg-gray-50">
          <Navbar />
          <div className="flex-1 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.main
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="min-h-screen p-8"
              >
                <div className="max-w-[1920px] mx-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/logistics" element={<LogisticMethods />} />
                    <Route path="/tracking" element={<Tracking />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/packaging" element={<PackagingList />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/login" element={<div>Login Page Placeholder</div>} />
                  </Routes>
                </div>
              </motion.main>
            </AnimatePresence>
          </div>
        </div>
      </LogisticProvider>
    </BrowserRouter>
  );
}

export default App;