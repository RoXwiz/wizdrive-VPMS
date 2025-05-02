import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, DollarSign, Ban as Bank, Clock } from 'lucide-react';

const Payments = () => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: 'card',
      icon: CreditCard,
      name: 'Credit Card',
      description: 'Pay securely with your credit card',
    },
    {
      id: 'bank',
      icon: Bank,
      name: 'Bank Transfer',
      description: 'Direct bank transfer to our account',
    },
    {
      id: 'cash',
      icon: DollarSign,
      name: 'Cash on Delivery',
      description: 'Pay when you receive your shipment',
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      date: '2024-03-12',
      amount: 'LKR 250,000',
      status: 'Completed',
      method: 'Credit Card',
    },
    {
      id: 2,
      date: '2024-03-10',
      amount: 'LKR 180,000',
      status: 'Pending',
      method: 'Bank Transfer',
    },
    {
      id: 3,
      date: '2024-03-09',
      amount: 'LKR 150,000',
      status: 'Completed',
      method: 'Cash on Delivery',
    },
    {
      id: 4,
      date: '2024-03-08',
      amount: 'LKR 300,000',
      status: 'Pending',
      method: 'Credit Card',
    },
  ];

  // Filter transactions based on selected payment method
  const filteredTransactions = selectedMethod
    ? recentTransactions.filter(transaction => {
        switch (selectedMethod) {
          case 'card':
            return transaction.method === 'Credit Card';
          case 'bank':
            return transaction.method === 'Bank Transfer';
          case 'cash':
            return transaction.method === 'Cash on Delivery';
          default:
            return true;
        }
      })
    : recentTransactions;

  const handleMethodClick = (methodId: string) => {
    // If the same method is clicked again, clear the filter
    setSelectedMethod(methodId === selectedMethod ? null : methodId);
  };

  return (
    <div className="space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900"
      >
        Payment Management
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentMethods.map((method, index) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all
              ${selectedMethod === method.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}
            onClick={() => handleMethodClick(method.id)}
          >
            <div className="flex flex-col items-center text-center">
              <method.icon className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedMethod 
              ? `Transactions - ${paymentMethods.find(m => m.id === selectedMethod)?.name}`
              : 'Recent Transactions'}
          </h2>
          <button 
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            onClick={() => setSelectedMethod(null)}
          >
            <Clock className="h-4 w-4" />
            {selectedMethod ? 'Show All' : 'View All'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Method</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b last:border-0">
                    <td className="py-3 px-4">{transaction.date}</td>
                    <td className="py-3 px-4 font-medium">{transaction.amount}</td>
                    <td className="py-3 px-4">{transaction.method}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        transaction.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-center text-gray-500">
                    No transactions found for this payment method
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Payments;