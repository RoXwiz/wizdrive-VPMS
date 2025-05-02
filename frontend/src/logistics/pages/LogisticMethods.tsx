import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogisticContext } from './LogisticContext';

const lkrToUsdRate = 0.0033; // Mock exchange rate: 1 LKR = 0.0033 USD

const LogisticMethods = () => {
  const { methods, updateMethods } = useLogisticContext();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [editedDetails, setEditedDetails] = useState({
    deliveryTime: '',
    minWeight: '',
    maxWeight: '',
    minCbm: '',
    maxCbm: '',
    pricePerKg: '',
    pricePerCbm: '',
    description: ''
  });

  const handleMethodClick = (methodId: string) => {
    if (methodId !== selectedMethod) {
      setSelectedMethod(methodId);
      const method = methods.find(m => m.id === methodId);
      if (method) {
        setEditedDetails({
          deliveryTime: method.details.deliveryTime,
          minWeight: method.details.minWeight,
          maxWeight: method.details.maxWeight,
          minCbm: method.details.minCbm,
          maxCbm: method.details.maxCbm,
          pricePerKg: (method.pricePerKg / lkrToUsdRate).toFixed(0), // Convert USD to LKR for display
          pricePerCbm: (method.pricePerCbm / lkrToUsdRate).toFixed(0), // Convert USD to LKR for display
          description: method.description
        });
      }
      setIsEditing(false);
      setFormErrors({});
    } else {
      setSelectedMethod(null);
      setIsEditing(false);
      setFormErrors({});
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!editedDetails.deliveryTime) errors.deliveryTime = 'Delivery time is required';
    if (!editedDetails.minWeight) errors.minWeight = 'Minimum weight is required';
    if (!editedDetails.maxWeight) errors.maxWeight = 'Maximum weight is required';
    if (!editedDetails.minCbm) errors.minCbm = 'Minimum CBM is required';
    if (!editedDetails.maxCbm) errors.maxCbm = 'Maximum CBM is required';
    if (!editedDetails.pricePerKg || isNaN(parseFloat(editedDetails.pricePerKg))) {
      errors.pricePerKg = 'Valid price per kg is required';
    }
    if (!editedDetails.pricePerCbm || isNaN(parseFloat(editedDetails.pricePerCbm))) {
      errors.pricePerCbm = 'Valid price per CBM is required';
    }
    if (!editedDetails.description) errors.description = 'Description is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!validateForm()) {
      return;
    }

    const updatedMethods = methods.map(method => {
      if (method.id === selectedMethod) {
        return {
          ...method,
          description: editedDetails.description,
          pricePerKg: parseFloat(editedDetails.pricePerKg) * lkrToUsdRate, // Convert LKR to USD
          pricePerCbm: parseFloat(editedDetails.pricePerCbm) * lkrToUsdRate, // Convert LKR to USD
          details: {
            ...method.details,
            deliveryTime: editedDetails.deliveryTime,
            minWeight: editedDetails.minWeight,
            maxWeight: editedDetails.maxWeight,
            minCbm: editedDetails.minCbm,
            maxCbm: editedDetails.maxCbm
          }
        };
      }
      return method;
    });

    updateMethods(updatedMethods);
    setIsEditing(false);
    setFormErrors({});
  };

  const selectedMethodData = methods.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6 p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900"
      >
        Logistics Methods
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {methods.map((method, index) => (
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
              <p className="text-sm text-gray-600 mb-4">{method.description}</p>
              <p className="text-lg font-bold text-blue-600">LKR {(method.pricePerKg / lkrToUsdRate).toFixed(0)}/kg</p>
              <p className="text-lg font-bold text-blue-600">LKR {(method.pricePerCbm / lkrToUsdRate).toFixed(0)}/cbm</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMethod && selectedMethodData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-8 bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{selectedMethodData.name} Details</h2>
              <div className="flex gap-4 items-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">
                    Price: LKR {(selectedMethodData.pricePerKg / lkrToUsdRate).toFixed(0)}/kg
                  </p>
                  <p className="text-lg font-bold text-blue-600">
                    Price: LKR {(selectedMethodData.pricePerCbm / lkrToUsdRate).toFixed(0)}/cbm
                  </p>
                </div>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Save' : 'Update'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Shipping Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Time:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.deliveryTime}
                          onChange={(e) => setEditedDetails({ ...editedDetails, deliveryTime: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.deliveryTime ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.deliveryTime && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.deliveryTime}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">{selectedMethodData.details.deliveryTime}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Minimum Weight:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.minWeight}
                          onChange={(e) => setEditedDetails({ ...editedDetails, minWeight: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.minWeight ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.minWeight && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.minWeight}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">{selectedMethodData.details.minWeight}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maximum Weight:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.maxWeight}
                          onChange={(e) => setEditedDetails({ ...editedDetails, maxWeight: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.maxWeight ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.maxWeight && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.maxWeight}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">{selectedMethodData.details.maxWeight}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Minimum CBM:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.minCbm}
                          onChange={(e) => setEditedDetails({ ...editedDetails, minCbm: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.minCbm ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.minCbm && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.minCbm}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">{selectedMethodData.details.minCbm}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Maximum CBM:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.maxCbm}
                          onChange={(e) => setEditedDetails({ ...editedDetails, maxCbm: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.maxCbm ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.maxCbm && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.maxCbm}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">{selectedMethodData.details.maxCbm}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per Kg:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.pricePerKg}
                          onChange={(e) => setEditedDetails({ ...editedDetails, pricePerKg: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.pricePerKg ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.pricePerKg && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.pricePerKg}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">LKR {(selectedMethodData.pricePerKg / lkrToUsdRate).toFixed(0)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price per CBM:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.pricePerCbm}
                          onChange={(e) => setEditedDetails({ ...editedDetails, pricePerCbm: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-32 ${
                            formErrors.pricePerCbm ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.pricePerCbm && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.pricePerCbm}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">LKR {(selectedMethodData.pricePerCbm / lkrToUsdRate).toFixed(0)}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Description:</span>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedDetails.description}
                          onChange={(e) => setEditedDetails({ ...editedDetails, description: e.target.value })}
                          className={`font-medium border rounded-md px-2 py-1 w-48 ${
                            formErrors.description ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.description && (
                          <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>
                        )}
                      </>
                    ) : (
                      <span className="font-medium">{selectedMethodData.description}</span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-3">Required Documents</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedMethodData.details.documentation.map((doc, index) => (
                    <li key={index} className="text-gray-600">{doc}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Benefits</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedMethodData.details.benefits.map((benefit, index) => (
                    <li key={index} className="text-gray-600">{benefit}</li>
                  ))}
                </ul>

                <h3 className="text-lg font-medium mt-6 mb-3">Restrictions</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedMethodData.details.restrictions.map((restriction, index) => (
                    <li key={index} className="text-gray-600">{restriction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LogisticMethods;