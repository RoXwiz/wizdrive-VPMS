import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Package, DollarSign, Globe, Clock, TrendingUp, Users, AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout, token } = useContext(AuthContext);

  // Debug log to verify user data
  useEffect(() => {
    console.log('Dashboard user data:', user);
  }, [user]);

  const stats = [
    {
      icon: Package,
      label: 'Active Shipments',
      value: '24',
      trend: '+12% from last month',
      trendUp: true,
      details: [
        { id: 'AS001', from: 'Japan', to: 'Sri Lanka', status: 'In Transit', value: 'LKR 450,000' },
        { id: 'AS002', from: 'China', to: 'Sri Lanka', status: 'Processing', value: 'LKR 380,000' },
        { id: 'AS003', from: 'USA', to: 'Sri Lanka', status: 'In Transit', value: 'LKR 620,000' },
      ],
    },
    {
      icon: Truck,
      label: 'In Transit',
      value: '12',
      trend: '+8% from last month',
      trendUp: true,
      details: [
        { id: 'TR001', from: 'Germany', to: 'Sri Lanka', status: 'In Transit', value: 'LKR 520,000' },
        { id: 'TR002', from: 'Japan', to: 'Sri Lanka', status: 'In Transit', value: 'LKR 480,000' },
      ],
    },
    {
      icon: DollarSign,
      label: 'Monthly Revenue',
      value: 'LKR 2.5M',
      trend: '+15% from last month',
      trendUp: true,
      details: [
        { category: 'Air Freight', value: 'LKR 1.2M' },
        { category: 'Sea Freight', value: 'LKR 800,000' },
        { category: 'Road Transport', value: 'LKR 500,000' },
      ],
    },
    {
      icon: Globe,
      label: 'Countries Served',
      value: '15',
      trend: '+2 new countries',
      trendUp: true,
      details: [
        { country: 'Japan', shipments: 8 },
        { country: 'China', shipments: 6 },
        { country: 'USA', shipments: 5 },
        { country: 'Germany', shipments: 4 },
      ],
    },
  ];

  const quickActions = [
    { icon: Package, label: 'New Shipment', path: '/packaging', color: 'bg-blue-500' },
    { icon: Clock, label: 'Track Order', path: '/tracking', color: 'bg-green-500' },
    { icon: Users, label: 'Chat Support', path: '/chat', color: 'bg-purple-500' },
    { icon: TrendingUp, label: 'View Reports', path: '/reports', color: 'bg-orange-500' },
  ];

  const recentAlerts = [
    { id: 1, message: 'Shipment AS001 delayed at customs', type: 'warning', time: '2 hours ago' },
    { id: 2, message: 'New order received from Japan Auto Parts', type: 'info', time: '3 hours ago' },
    { id: 3, message: 'Payment verification pending for TR002', type: 'alert', time: '5 hours ago' },
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Role: {user.role}
          </p>
        </motion.div>
      
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(action.path)}
          >
            <div className="p-6 flex items-center space-x-4">
              <div className={`${action.color} p-3 rounded-lg`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <span className="font-medium text-gray-700">{action.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
              ${selectedStat === stat.label ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedStat(selectedStat === stat.label ? null : stat.label)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <stat.icon className="h-6 w-6 text-blue-500" />
                </div>
                <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600">{stat.label}</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6 mt-8"
      >
        <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
        <div className="space-y-4">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center space-x-3 p-4 rounded-lg ${
                alert.type === 'warning' ? 'bg-yellow-50' :
                alert.type === 'info' ? 'bg-blue-50' : 'bg-red-50'
              }`}
            >
              <AlertCircle className={`h-5 w-5 ${
                alert.type === 'warning' ? 'text-yellow-500' :
                alert.type === 'info' ? 'text-blue-500' : 'text-red-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                <p className="text-xs text-gray-500">{alert.time}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Selected Stat Details */}
      {selectedStat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white rounded-lg shadow-md p-6 mt-6"
        >
          <h2 className="text-xl font-semibold mb-4">{selectedStat} Details</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {Object.keys(stats.find(s => s.label === selectedStat)?.details[0] || {}).map((key) => (
                    <th key={key} className="text-left py-3 px-4 font-medium text-gray-600">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats
                  .find(s => s.label === selectedStat)
                  ?.details.map((detail, index) => (
                    <tr key={index} className="border-b last:border-0">
                      {Object.values(detail).map((value, i) => (
                        <td key={i} className="py-3 px-4 text-gray-800">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;