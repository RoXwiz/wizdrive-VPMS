import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    showPassword: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
  };

  const validatePasswordForm = () => {
    const newErrors = { currentPassword: '', newPassword: '', confirmPassword: '' };
    let isValid = true;

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
      isValid = false;
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters';
      isValid = false;
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
      isValid = false;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validatePasswordForm()) return;

    try {
      const response = await fetch('http://localhost:5000/api/profile/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
      setSuccessMessage('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setErrors(prev => ({ ...prev, currentPassword: error instanceof Error ? error.message : 'An unknown error occurred' }));
    }
  };

  const handleGeneralSave = () => {
    console.log('General settings saved:', settings);
    alert('General settings saved!');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Enable Notifications</label>
                <button
                  onClick={() => handleToggle('notifications')}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    settings.notifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.notifications ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-700">Email Notifications</label>
                <button
                  onClick={() => handleToggle('emailNotifications')}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    settings.emailNotifications ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleGeneralSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save General Settings
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Security
            </h2>
            {successMessage && (
              <p className="text-green-500 text-center mb-4">{successMessage}</p>
            )}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <label className="text-gray-700 w-32">Current Password:</label>
                <div className="relative w-full max-w-xs">
                  <input
                    type={settings.showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full border ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md px-2 py-1`}
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-gray-700 w-32">New Password:</label>
                <div className="relative w-full max-w-xs">
                  <input
                    type={settings.showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md px-2 py-1`}
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <label className="text-gray-700 w-32">Confirm Password:</label>
                <div className="relative w-full max-w-xs">
                  <input
                    type={settings.showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md px-2 py-1`}
                  />
                  <button
                    onClick={() => handleToggle('showPassword')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
                  >
                    {settings.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;