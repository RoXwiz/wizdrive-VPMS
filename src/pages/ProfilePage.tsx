import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Briefcase, Edit2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Shehan Perera',
    role: 'Logistics Manager',
    email: 'shehan.perera@wizdrive.com',
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleEdit = () => {
    if (isEditing) {
      setProfile(editedProfile);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedProfile({ ...editedProfile, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-6">
          <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
            <p className="text-gray-600">{profile.role}</p>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5 text-gray-600" />
            <label className="text-gray-600">Name:</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={editedProfile.name}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-2 py-1 w-full max-w-xs"
              />
            ) : (
              <span className="font-medium">{profile.name}</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-gray-600" />
            <label className="text-gray-600">Role:</label>
            {isEditing ? (
              <input
                type="text"
                name="role"
                value={editedProfile.role}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-2 py-1 w-full max-w-xs"
              />
            ) : (
              <span className="font-medium">{profile.role}</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-600" />
            <label className="text-gray-600">Email:</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={editedProfile.email}
                onChange={handleChange}
                className="border border-gray-300 rounded-md px-2 py-1 w-full max-w-xs"
              />
            ) : (
              <span className="font-medium">{profile.email}</span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;