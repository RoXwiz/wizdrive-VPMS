import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  DollarSign, 
  Map, 
  BarChart3, 
  LayoutDashboard, 
  Package, 
  Settings,
  MessageSquare,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/logistics', icon: Truck, label: 'Logistics' },
    { path: '/packaging', icon: Package, label: 'Packaging' },
    { path: '/tracking', icon: Map, label: 'Tracking' },
    { path: '/payments', icon: DollarSign, label: 'Payments' },
    { path: '/reports', icon: BarChart3, label: 'Reports' },
    { path: '/chat', icon: MessageSquare, label: 'Chat' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Redirect to login if no user is authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r">
      <div className="p-4">
        <Link to="/" className="flex items-center space-x-3 mb-8">
          <img src="/RWDrive-logo.png" alt="RWDrive" className="h-8" />
          <span className="text-xl font-bold text-gray-900">WizDrive</span>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto p-4 border-t">
        <div 
          className="flex items-center space-x-3 cursor-pointer relative"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showProfileMenu ? 'transform rotate-180' : ''}`} />
        </div>

        {showProfileMenu && (
          <div className="absolute bottom-20 left-4 w-56 bg-white rounded-lg shadow-lg py-1 z-50">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;