import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Package, Truck, Box, CheckCircle, Plus, FileText, RefreshCw, Edit, Undo } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useLogisticContext } from './LogisticContext';

const Tracking = () => {
  const { shipments, updateShipment, addNotification } = useLogisticContext();
  console.log('Current Shipments in Tracking:', shipments); // Debugging log

  const [trackingNumber, setTrackingNumber] = useState('');
  const [showAllShipments, setShowAllShipments] = useState(true);
  const [showAddTracking, setShowAddTracking] = useState(false);
  const [showEditTracking, setShowEditTracking] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [newTracking, setNewTracking] = useState({
    trackingNumber: '',
    origin: '',
    destination: '',
    status: ''
  });
  const [editStatus, setEditStatus] = useState('');
  const [errors, setErrors] = useState<any>({});

  const filteredShipments = trackingNumber
    ? shipments.filter(s => s.trackingNumber.toUpperCase().includes(trackingNumber.toUpperCase()))
    : shipments;

  const validateForm = () => {
    const newErrors: any = {};
    if (!newTracking.trackingNumber) newErrors.trackingNumber = 'Tracking Number is required';
    if (!newTracking.origin) newErrors.origin = 'Origin is required';
    if (!newTracking.destination) newErrors.destination = 'Destination is required';
    if (!newTracking.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTracking = () => {
    if (!validateForm()) return;

    const newId = String(shipments.length + 1); // Align ID generation with packing lists
    const newShipment = {
      id: newId,
      trackingNumber: newTracking.trackingNumber.toUpperCase(),
      status: newTracking.status,
      origin: newTracking.origin,
      destination: newTracking.destination,
      weight: 'N/A',
      cbm: 'N/A',
      shippingCost: 0,
      description: 'N/A',
      items: 'N/A',
      specialInstructions: 'N/A',
      steps: [
        { icon: 'package', label: 'Order Received', date: new Date().toISOString().split('T')[0], completed: true },
        { 
          icon: newTracking.status === 'Processing' ? 'box' : 'truck', 
          label: newTracking.status, 
          date: new Date().toISOString().split('T')[0], 
          completed: true 
        },
        { 
          icon: newTracking.status === 'In Transit' ? 'check-circle' : 'truck', 
          label: newTracking.status === 'In Transit' ? 'Delivered' : 'In Transit', 
          date: 'Expected: ' + new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], 
          completed: false 
        },
        { 
          icon: 'check-circle', 
          label: 'Delivered', 
          date: 'Expected: ' + new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], 
          completed: newTracking.status === 'Delivered' 
        },
      ].filter(step => 
        newTracking.status === 'Processing' ? step.label !== 'Delivered' :
        newTracking.status === 'In Transit' ? true :
        step.label === 'Delivered'
      ),
      history: [],
      orderNumber: `MANUAL-${newId}`
    };

    console.log('Adding Manual Tracking:', newShipment); // Debugging log
    updateShipment(newShipment);
    addNotification(`New manual tracking record created: ${newShipment.trackingNumber}`);
    setShowAddTracking(false);
    setNewTracking({
      trackingNumber: '',
      origin: '',
      destination: '',
      status: ''
    });
    setErrors({});
  };

  const exportPackingList = (shipment: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('WizDrive Logistics - Packing List', 20, 20);
    doc.setFontSize(12);
    doc.text(`Tracking Number: ${shipment.trackingNumber}`, 20, 40);
    doc.text(`Order Number: ${shipment.orderNumber}`, 20, 50);
    doc.text(`Origin: ${shipment.origin}`, 20, 60);
    doc.text(`Destination: ${shipment.destination}`, 20, 70);
    doc.text(`Weight: ${shipment.weight}`, 20, 80);
    doc.text(`CBM: ${shipment.cbm}`, 20, 90);
    doc.text(`Shipping Cost: $${shipment.shippingCost}`, 20, 100);
    doc.text(`Status: ${shipment.status}`, 20, 110);
    const items = shipment.items.split(', ');
    const tableData = items.map((item: string) => [item]);
    doc.autoTable({
      startY: 120,
      head: [['Items']],
      body: tableData,
    });
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.text('Special Instructions:', 20, finalY + 10);
    doc.text(shipment.specialInstructions, 20, finalY + 20);
    doc.save(`packing-list-${shipment.trackingNumber}.pdf`);
  };

  const updateTrackingTimeline = (shipmentId: string, manualStatus: string | null = null) => {
    const updatedShipments = shipments.map(shipment => {
      if (shipment.id === shipmentId) {
        const historyEntry = {
          status: shipment.status,
          steps: [...shipment.steps]
        };

        const currentStepIndex = shipment.steps.findIndex(step => !step.completed);
        if (currentStepIndex === -1 && !manualStatus) return shipment;

        let updatedSteps = [...shipment.steps];
        let newStatus = manualStatus || shipment.status;
        const currentDate = new Date().toISOString().split('T')[0];

        if (manualStatus) {
          updatedSteps = updatedSteps.map((step, index) => {
            if (manualStatus === 'Processing' && step.label === 'Processing') {
              return { ...step, completed: true, date: currentDate };
            }
            if (manualStatus === 'In Transit' && step.label === 'In Transit') {
              return { ...step, completed: true, date: currentDate };
            }
            if (manualStatus === 'Delivered' && step.label === 'Delivered') {
              return { ...step, completed: true, date: currentDate };
            }
            return { ...step, completed: index <= updatedSteps.findIndex(s => s.label === manualStatus) };
          });
        } else {
          updatedSteps[currentStepIndex] = {
            ...updatedSteps[currentStepIndex],
            date: currentDate,
            completed: true
          };

          if (updatedSteps[currentStepIndex].label === 'Processing') {
            newStatus = 'In Transit';
          } else if (updatedSteps[currentStepIndex].label === 'In Transit') {
            newStatus = 'Delivered';
          }
        }

        const updatedShipment = {
          ...shipment,
          status: newStatus,
          steps: updatedSteps,
          history: [...shipment.history, historyEntry]
        };
        updateShipment(updatedShipment);
        addNotification(`Tracking updated for order ${shipment.orderNumber}: ${newStatus}`);
        return updatedShipment;
      }
      return shipment;
    });
  };

  const revertTrackingUpdate = (shipmentId: string) => {
    const updatedShipments = shipments.map(shipment => {
      if (shipment.id === shipmentId && shipment.history.length > 0) {
        const lastHistory = shipment.history[shipment.history.length - 1];
        const revertedShipment = {
          ...shipment,
          status: lastHistory.status,
          steps: [...lastHistory.steps],
          history: shipment.history.slice(0, -1)
        };
        updateShipment(revertedShipment);
        addNotification(`Tracking reverted for order ${shipment.orderNumber}`);
        return revertedShipment;
      }
      return shipment;
    });
  };

  const handleEditTracking = () => {
    if (!editStatus) {
      setErrors({ status: 'Status is required' });
      return;
    }
    updateTrackingTimeline(selectedShipment.id, editStatus);
    setShowEditTracking(false);
    setEditStatus('');
    setErrors({});
  };

  useEffect(() => {
    if (!showAllShipments && filteredShipments.length > 0) {
      const interval = setInterval(() => {
        updateTrackingTimeline(filteredShipments[0].id);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showAllShipments, filteredShipments]);

  const renderStepIcon = (icon: string, completed: boolean) => {
    const IconComponent = {
      package: Package,
      box: Box,
      truck: Truck,
      'check-circle': CheckCircle
    }[icon] || Package;

    return (
      <IconComponent
        className={`h-5 w-5 ${completed ? 'text-white' : 'text-gray-500'}`}
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Track Your Shipment</h1>
        <button
          onClick={() => setShowAddTracking(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4" />
          Add Tracking
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Search className="h-4 w-4" />
            Track
          </button>
        </div>
      </motion.div>

      {showAddTracking && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add New Tracking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={newTracking.trackingNumber}
                  onChange={(e) => setNewTracking({ ...newTracking, trackingNumber: e.target.value })}
                  className={`w-full px-3 py-2 border ${errors.trackingNumber ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors.trackingNumber && <p className="text-red-500 text-sm mt-1">{errors.trackingNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                <input
                  type="text"
                  value={newTracking.origin}
                  onChange={(e) => setNewTracking({ ...newTracking, origin: e.target.value })}
                  className={`w-full px-3 py-2 border ${errors.origin ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                <input
                  type="text"
                  value={newTracking.destination}
                  onChange={(e) => setNewTracking({ ...newTracking, destination: e.target.value })}
                  className={`w-full px-3 py-2 border ${errors.destination ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                />
                {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={newTracking.status}
                  onChange={(e) => setNewTracking({ ...newTracking, status: e.target.value })}
                  className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                >
                  <option value="">Select Status</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowAddTracking(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTracking}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Tracking
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {showEditTracking && selectedShipment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Tracking Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number: {selectedShipment.trackingNumber}</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                >
                  <option value="">Select Status</option>
                  <option value="Processing">Processing</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowEditTracking(false);
                  setEditStatus('');
                  setErrors({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTracking}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-4 sm:p-6"
      >
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">All Shipments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 sm:px-4">Tracking Number</th>
                <th className="text-left py-3 px-2 sm:px-4">Order Number</th>
                <th className="text-left py-3 px-2 sm:px-4">Origin</th>
                <th className="text-left py-3 px-2 sm:px-4">Destination</th>
                <th className="text-left py-3 px-2 sm:px-4">Status</th>
                <th className="text-left py-3 px-2 sm:px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No tracking records found. Add a packing list to generate tracking.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="border-b last:border-0 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      setShowAllShipments(false);
                      setSelectedShipment(shipment);
                    }}
                  >
                    <td className="py-3 px-2 sm:px-4 font-medium">{shipment.trackingNumber}</td>
                    <td className="py-3 px-2 sm:px-4">{shipment.orderNumber}</td>
                    <td className="py-3 px-2 sm:px-4">{shipment.origin}</td>
                    <td className="py-3 px-2 sm:px-4">{shipment.destination}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        shipment.status === 'In Transit'
                          ? 'bg-blue-100 text-blue-800'
                          : shipment.status === 'Processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            exportPackingList(shipment);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                          title="Download Packing List"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {!showAllShipments && filteredShipments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-4 sm:p-6"
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold">Tracking Details</h2>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setSelectedShipment(filteredShipments[0]);
                  setShowEditTracking(true);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                title="Edit Tracking Status"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => updateTrackingTimeline(filteredShipments[0].id)}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                title="Update Tracking Timeline"
              >
                <RefreshCw className="h-4 w-4" />
                Update
              </button>
              <button
                onClick={() => revertTrackingUpdate(filteredShipments[0].id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 text-sm sm:text-base"
                title="Revert Last Update"
                disabled={filteredShipments[0].history.length === 0}
              >
                <Undo className="h-4 w-4" />
                Revert
              </button>
              <button
                onClick={() => setShowAllShipments(true)}
                className="text-blue-600 hover:text-blue-700 text-sm sm:text-base"
              >
                Back to List
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-4">Package Information</h3>
              <div className="space-y-3">
                <p className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{filteredShipments[0].orderNumber}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{filteredShipments[0].weight}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">CBM:</span>
                  <span className="font-medium">{filteredShipments[0].cbm}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Shipping Cost:</span>
                  <span className="font-medium">${filteredShipments[0].shippingCost}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{filteredShipments[0].description}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{filteredShipments[0].items}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Special Instructions:</span>
                  <span className="font-medium">{filteredShipments[0].specialInstructions}</span>
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium mb-4">Tracking Timeline</h3>
              <div className="relative pl-8">
                {filteredShipments[0].steps.map((step: any, index: number) => (
                  <div key={step.label} className="relative mb-6 sm:mb-8 last:mb-0">
                    <div className="flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        {renderStepIcon(step.icon, step.completed)}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{step.label}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{step.date}</p>
                      </div>
                    </div>
                    {index < filteredShipments[0].steps.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 w-0.5 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                        style={{
                          height: 'calc(100% - 2rem)',
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Tracking;