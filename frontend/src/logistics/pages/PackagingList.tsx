import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Check, X, Trash2 } from 'lucide-react';
import { useLogisticContext } from './LogisticContext';

const lkrToUsdRate = 0.0033;
const logisticMethodsList = ['Air Freight', 'Sea Freight', 'Road Transport', 'Rail Freight'];

interface PackageItem {
  id: string;
  name: string;
  quantity: number;
  weight: string;
  dimensions: string;
  specialHandling: string;
}

interface LogisticStep {
  method: string;
  origin: string;
  destination: string;
}

interface PackingList {
  id: string;
  orderNumber: string;
  seller: string;
  buyer: string;
  items: PackageItem[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  logisticSteps: LogisticStep[];
  shippingCost: number;
  totalCbm: number;
}

interface FormErrors {
  orderNumber?: string;
  seller?: string;
  buyer?: string;
  items?: string;
  logisticSteps?: string;
}

const calculateCbm = (dimensions: string): number => {
  const [l, w, h] = dimensions.split('x').map(val => parseFloat(val.replace(/[^0-9.]/g, '')) / 100);
  return l * w * h;
};

const calculateShippingCost = (
  items: PackageItem[],
  logisticSteps: LogisticStep[],
  pricingMethods: any[]
): { cost: number; cbm: number } => {
  let totalCost = 0;
  const totalWeight = items.reduce((sum, item) => {
    const weight = parseFloat(item.weight) || 0;
    return sum + weight;
  }, 0);

  const totalCbm = items.reduce((sum, item) => {
    return sum + calculateCbm(item.dimensions);
  }, 0);

  logisticSteps.forEach(step => {
    const method = pricingMethods.find(m => m.name === step.method);
    if (!method) return;

    const isInternational = step.origin.split(',')[1]?.trim() !== step.destination.split(',')[1]?.trim();
    const weightCost = totalWeight * method.pricePerKg;
    const cbmCost = totalCbm * method.pricePerCbm;
    let stepCost = Math.max(weightCost, cbmCost);
    if (isInternational) {
      stepCost *= 1.5;
    }

    totalCost += stepCost;
  });

  return { cost: parseFloat(totalCost.toFixed(2)), cbm: parseFloat(totalCbm.toFixed(3)) };
};

const generateTrackingNumber = (orderNumber: string, seller: string): string => {
  const prefix = seller.split(' ')[0].substring(0, 2).toUpperCase();
  const number = orderNumber.split('-')[2];
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${number}${randomSuffix}`;
};

const PackagingList = () => {
  const { methods, shipments, addShipment, updateShipment, deleteShipment } = useLogisticContext();
  const [showAddList, setShowAddList] = useState(false);
  const [showEditList, setShowEditList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listToDelete, setListToDelete] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [newList, setNewList] = useState({
    orderNumber: '',
    seller: '',
    buyer: '',
    items: [
      {
        id: '1',
        name: '',
        quantity: 0,
        weight: '',
        dimensions: '',
        specialHandling: ''
      }
    ],
    logisticSteps: [
      {
        method: '',
        origin: '',
        destination: ''
      }
    ]
  });

  const [editList, setEditList] = useState<PackingList | null>(null);

  const [packingLists, setPackingLists] = useState<PackingList[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      seller: 'Japan Auto Parts Co.',
      buyer: 'Sri Lanka Motors Ltd',
      status: 'pending',
      createdAt: '2024-03-15',
      items: [
        {
          id: '1',
          name: 'Engine Pistons',
          quantity: 12,
          weight: '24kg',
          dimensions: '30x20x15cm',
          specialHandling: 'Handle with care'
        },
        {
          id: '2',
          name: 'Gasket Set',
          quantity: 5,
          weight: '2kg',
          dimensions: '25x15x5cm',
          specialHandling: 'Keep dry'
        }
      ],
      logisticSteps: [
        { method: 'Sea Freight', origin: 'Tokyo, Japan', destination: 'Colombo, Sri Lanka' },
        { method: 'Road Transport', origin: 'Colombo, Sri Lanka', destination: 'Kandy, Sri Lanka' }
      ],
      shippingCost: 0,
      totalCbm: 0
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      seller: 'China Parts Manufacturing',
      buyer: 'Sri Lanka Auto Imports',
      status: 'pending',
      createdAt: '2024-03-16',
      items: [
        {
          id: '3',
          name: 'Transmission Assembly',
          quantity: 1,
          weight: '45kg',
          dimensions: '60x40x30cm',
          specialHandling: 'Fragile equipment'
        }
      ],
      logisticSteps: [
        { method: 'Air Freight', origin: 'Shanghai, China', destination: 'Colombo, Sri Lanka' }
      ],
      shippingCost: 0,
      totalCbm: 0
    }
  ]);

  useEffect(() => {
    const updatedLists = packingLists.map(list => {
      const { cost, cbm } = calculateShippingCost(list.items, list.logisticSteps, methods);
      return { ...list, shippingCost: cost, totalCbm: cbm };
    });
    setPackingLists(updatedLists);

    // Create initial shipments for existing packing lists if not already created
    packingLists.forEach(list => {
      const existingShipment = shipments.find(s => s.orderNumber === list.orderNumber);
      if (!existingShipment) {
        createShipment(list);
      }
    });
  }, [methods, packingLists.length]);

  useEffect(() => {
    setPackingLists((prevLists) =>
      prevLists.map((list) => {
        const shipment = shipments.find((s) => s.orderNumber === list.orderNumber);
        if (shipment && shipment.status === 'Delivered') {
          return { ...list, status: 'approved' };
        }
        return list;
      })
    );
  }, [shipments]);

  const validateForm = (list: typeof newList | PackingList) => {
    const errors: FormErrors = {};
    
    if (!list.orderNumber) {
      errors.orderNumber = 'Order number is required';
    } else if (!/^ORD-\d{4}-\d{3}$/.test(list.orderNumber)) {
      errors.orderNumber = 'Invalid order number format (e.g., ORD-2024-001)';
    } else if (packingLists.some((l) => l.orderNumber === list.orderNumber && l.id !== (list as PackingList).id)) {
      errors.orderNumber = 'Order number must be unique';
    }
    
    if (!list.seller) {
      errors.seller = 'Seller name is required';
    }
    
    if (!list.buyer) {
      errors.buyer = 'Buyer name is required';
    }
    
    if (!list.items.length) {
      errors.items = 'At least one item is required';
    } else {
      const invalidItems = list.items.some(item => 
        !item.name || !item.quantity || !item.weight || !item.dimensions
      );
      if (invalidItems) {
        errors.items = 'All item fields are required';
      }
    }

    if (!list.logisticSteps.length) {
      errors.logisticSteps = 'At least one logistic step is required';
    } else {
      const invalidSteps = list.logisticSteps.some(step => 
        !step.method || !step.origin || !step.destination
      );
      if (invalidSteps) {
        errors.logisticSteps = 'All logistic step fields are required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createShipment = (packingList: PackingList) => {
    const trackingNumber = generateTrackingNumber(packingList.orderNumber, packingList.seller);
    const totalWeight = packingList.items.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      return sum + weight;
    }, 0);

    const newShipment = {
      id: packingList.id, // Ensure the shipment ID matches the packing list ID
      trackingNumber,
      status: 'Processing',
      origin: packingList.logisticSteps[0].origin,
      destination: packingList.logisticSteps[packingList.logisticSteps.length - 1].destination,
      weight: `${totalWeight}kg`,
      cbm: `${packingList.totalCbm}cbm`,
      shippingCost: packingList.shippingCost,
      description: packingList.items.map(item => item.name).join(', '),
      items: packingList.items.map(item => item.name).join(', '),
      specialInstructions: packingList.items.map(item => item.specialHandling).filter(Boolean).join(', '),
      logisticSteps: packingList.logisticSteps,
      steps: [
        { icon: 'package', label: 'Order Received', date: new Date().toISOString().split('T')[0], completed: true },
        { icon: 'box', label: 'Processing', date: new Date().toISOString().split('T')[0], completed: true },
        { icon: 'truck', label: 'In Transit', date: 'Expected: ' + new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], completed: false },
        { icon: 'check-circle', label: 'Delivered', date: 'Expected: ' + new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0], completed: false },
      ],
      history: [],
      orderNumber: packingList.orderNumber
    };

    console.log('Creating Shipment:', newShipment); // Debugging log
    addShipment(newShipment);
  };

  const handleAddList = () => {
    if (!validateForm(newList)) {
      return;
    }

    const { cost, cbm } = calculateShippingCost(newList.items, newList.logisticSteps, methods);

    const newPackingList: PackingList = {
      id: String(packingLists.length + 1),
      orderNumber: newList.orderNumber,
      seller: newList.seller,
      buyer: newList.buyer,
      items: newList.items,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      logisticSteps: newList.logisticSteps,
      shippingCost: cost,
      totalCbm: cbm
    };

    setPackingLists([...packingLists, newPackingList]);
    createShipment(newPackingList);
    setShowAddList(false);
    setNewList({
      orderNumber: '',
      seller: '',
      buyer: '',
      items: [{ id: '1', name: '', quantity: 0, weight: '', dimensions: '', specialHandling: '' }],
      logisticSteps: [{ method: '', origin: '', destination: '' }]
    });
    setFormErrors({});
  };

  const handleEditList = (list: PackingList) => {
    setEditList({
      ...list,
      items: list.items.map(item => ({ ...item })),
      logisticSteps: list.logisticSteps.map(step => ({ ...step }))
    });
    setShowEditList(true);
  };

  const handleUpdateList = () => {
    if (!editList || !validateForm(editList)) {
      return;
    }

    const { cost, cbm } = calculateShippingCost(editList.items, editList.logisticSteps, methods);
    const updatedEditList = { ...editList, shippingCost: cost, totalCbm: cbm };

    const totalWeight = updatedEditList.items.reduce((sum, item) => {
      const weight = parseFloat(item.weight) || 0;
      return sum + weight;
    }, 0);

    const existingShipment = shipments.find((s) => s.orderNumber === updatedEditList.orderNumber);
    if (existingShipment) {
      const updatedShipment = {
        ...existingShipment,
        id: updatedEditList.id, // Ensure ID consistency
        origin: updatedEditList.logisticSteps[0].origin,
        destination: updatedEditList.logisticSteps[updatedEditList.logisticSteps.length - 1].destination,
        weight: `${totalWeight}kg`,
        cbm: `${updatedEditList.totalCbm}cbm`,
        shippingCost: updatedEditList.shippingCost,
        description: updatedEditList.items.map(item => item.name).join(', '),
        items: updatedEditList.items.map(item => item.name).join(', '),
        specialInstructions: updatedEditList.items.map(item => item.specialHandling).filter(Boolean).join(', '),
        logisticSteps: updatedEditList.logisticSteps,
        orderNumber: updatedEditList.orderNumber
      };
      updateShipment(updatedShipment);
    }

    const updatedLists = packingLists.map(list =>
      list.id === editList.id ? updatedEditList : list
    );

    setPackingLists(updatedLists);
    setShowEditList(false);
    setEditList(null);
    setFormErrors({});
  };

  const handleApproveReject = (listId: string, status: 'approved' | 'rejected') => {
    const updatedLists = packingLists.map(list => {
      if (list.id === listId) {
        const updatedList = { ...list, status };
        
        if (status === 'approved') {
          const shipment = shipments.find((s) => s.orderNumber === list.orderNumber);
          if (shipment) {
            updateShipment({ ...shipment, status: 'In Transit' });
          }
        }
        
        return updatedList;
      }
      return list;
    });
    
    setPackingLists(updatedLists);
  };

  const handleDeleteList = (listId: string) => {
    setListToDelete(listId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (listToDelete) {
      const updatedLists = packingLists.filter(list => list.id !== listToDelete);
      setPackingLists(updatedLists);
      deleteShipment(listToDelete);
      setListToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setListToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleAddItem = (isEdit: boolean = false) => {
    const targetList = isEdit && editList ? editList : newList;
    const setTargetList = isEdit ? setEditList : setNewList;

    setTargetList({
      ...targetList,
      items: [
        ...targetList.items,
        {
          id: String(targetList.items.length + 1),
          name: '',
          quantity: 0,
          weight: '',
          dimensions: '',
          specialHandling: ''
        }
      ]
    });
  };

  const handleRemoveItem = (index: number, isEdit: boolean = false) => {
    const targetList = isEdit && editList ? editList : newList;
    const setTargetList = isEdit ? setEditList : setNewList;

    setTargetList({
      ...targetList,
      items: targetList.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof PackageItem,
    value: string | number,
    isEdit: boolean = false
  ) => {
    const targetList = isEdit && editList ? editList : newList;
    const setTargetList = isEdit ? setEditList : setNewList;

    const updatedItems = [...targetList.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setTargetList({ ...targetList, items: updatedItems });
  };

  const handleAddLogisticStep = (isEdit: boolean = false) => {
    const targetList = isEdit && editList ? editList : newList;
    const setTargetList = isEdit ? setEditList : setNewList;

    setTargetList({
      ...targetList,
      logisticSteps: [
        ...targetList.logisticSteps,
        {
          method: '',
          origin: '',
          destination: ''
        }
      ]
    });
  };

  const handleRemoveLogisticStep = (index: number, isEdit: boolean = false) => {
    const targetList = isEdit && editList ? editList : newList;
    const setTargetList = isEdit ? setEditList : setNewList;

    setTargetList({
      ...targetList,
      logisticSteps: targetList.logisticSteps.filter((_, i) => i !== index)
    });
  };

  const handleLogisticStepChange = (
    index: number,
    field: keyof LogisticStep,
    value: string,
    isEdit: boolean = false
  ) => {
    const targetList = isEdit && editList ? editList : newList;
    const setTargetList = isEdit ? setEditList : setNewList;

    const updatedSteps = [...targetList.logisticSteps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value
    };
    setTargetList({ ...targetList, logisticSteps: updatedSteps });
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">Packaging Lists</h1>
        <button
          onClick={() => setShowAddList(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New List
        </button>
      </motion.div>

      {showAddList && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-6">Create New Packing List</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={newList.orderNumber}
                    onChange={(e) => setNewList({ ...newList, orderNumber: e.target.value })}
                    placeholder="ORD-2024-001"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.orderNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.orderNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.orderNumber}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seller Name
                  </label>
                  <input
                    type="text"
                    value={newList.seller}
                    onChange={(e) => setNewList({ ...newList, seller: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.seller ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.seller && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.seller}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    value={newList.buyer}
                    onChange={(e) => setNewList({ ...newList, buyer: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.buyer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.buyer && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.buyer}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Items</h3>
                  <button
                    onClick={() => handleAddItem()}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
                
                {formErrors.items && (
                  <p className="text-red-500 text-sm mb-2">{formErrors.items}</p>
                )}
                
                <div className="space-y-4">
                  {newList.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight
                        </label>
                        <input
                          type="text"
                          value={item.weight}
                          onChange={(e) => handleItemChange(index, 'weight', e.target.value)}
                          placeholder="e.g., 5kg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          value={item.dimensions}
                          onChange={(e) => handleItemChange(index, 'dimensions', e.target.value)}
                          placeholder="e.g., 30x20x15cm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="flex items-end justify-end">
                        {newList.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Logistic Steps</h3>
                  <button
                    onClick={() => handleAddLogisticStep()}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Logistic Step
                  </button>
                </div>
                
                {formErrors.logisticSteps && (
                  <p className="text-red-500 text-sm mb-2">{formErrors.logisticSteps}</p>
                )}
                
                <div className="space-y-4">
                  {newList.logisticSteps.map((step, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logistic Method
                        </label>
                        <select
                          value={step.method}
                          onChange={(e) => handleLogisticStepChange(index, 'method', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Method</option>
                          {logisticMethodsList.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Origin
                        </label>
                        <input
                          type="text"
                          value={step.origin}
                          onChange={(e) => handleLogisticStepChange(index, 'origin', e.target.value)}
                          placeholder="e.g., Tokyo, Japan"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={step.destination}
                          onChange={(e) => handleLogisticStepChange(index, 'destination', e.target.value)}
                          placeholder="e.g., Colombo, Sri Lanka"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="flex items-end justify-end">
                        {newList.logisticSteps.length > 1 && (
                          <button
                            onClick={() => handleRemoveLogisticStep(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Shipping Summary</h3>
                <p className="text-xl font-semibold">
                  Estimated Cost: ${calculateShippingCost(newList.items, newList.logisticSteps, methods).cost.toFixed(2)}
                  (LKR {(calculateShippingCost(newList.items, newList.logisticSteps, methods).cost / lkrToUsdRate).toFixed(0)})
                </p>
                <p className="text-lg">
                  Total CBM: {calculateShippingCost(newList.items, newList.logisticSteps, methods).cbm.toFixed(3)} cbm
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddList(false);
                  setFormErrors({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAddList}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create List
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showEditList && editList && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-6">Edit Packing List</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={editList.orderNumber}
                    onChange={(e) => setEditList({ ...editList, orderNumber: e.target.value })}
                    placeholder="ORD-2024-001"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.orderNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.orderNumber && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.orderNumber}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seller Name
                  </label>
                  <input
                    type="text"
                    value={editList.seller}
                    onChange={(e) => setEditList({ ...editList, seller: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.seller ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.seller && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.seller}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buyer Name
                  </label>
                  <input
                    type="text"
                    value={editList.buyer}
                    onChange={(e) => setEditList({ ...editList, buyer: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-md ${
                      formErrors.buyer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.buyer && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.buyer}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Items</h3>
                  <button
                    onClick={() => handleAddItem(true)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
                
                {formErrors.items && (
                  <p className="text-red-500 text-sm mb-2">{formErrors.items}</p>
                )}
                
                <div className="space-y-4">
                  {editList.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value, true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value), true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight
                        </label>
                        <input
                          type="text"
                          value={item.weight}
                          onChange={(e) => handleItemChange(index, 'weight', e.target.value, true)}
                          placeholder="e.g., 5kg"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dimensions
                        </label>
                        <input
                          type="text"
                          value={item.dimensions}
                          onChange={(e) => handleItemChange(index, 'dimensions', e.target.value, true)}
                          placeholder="e.g., 30x20x15cm"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="flex items-end justify-end">
                        {editList.items.length > 1 && (
                          <button
                            onClick={() => handleRemoveItem(index, true)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Logistic Steps</h3>
                  <button
                    onClick={() => handleAddLogisticStep(true)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Logistic Step
                  </button>
                </div>
                
                {formErrors.logisticSteps && (
                  <p className="text-red-500 text-sm mb-2">{formErrors.logisticSteps}</p>
                )}
                
                <div className="space-y-4">
                  {editList.logisticSteps.map((step, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logistic Method
                        </label>
                        <select
                          value={step.method}
                          onChange={(e) => handleLogisticStepChange(index, 'method', e.target.value, true)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Method</option>
                          {logisticMethodsList.map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Origin
                        </label>
                        <input
                          type="text"
                          value={step.origin}
                          onChange={(e) => handleLogisticStepChange(index, 'origin', e.target.value, true)}
                          placeholder="e.g., Tokyo, Japan"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination
                        </label>
                        <input
                          type="text"
                          value={step.destination}
                          onChange={(e) => handleLogisticStepChange(index, 'destination', e.target.value, true)}
                          placeholder="e.g., Colombo, Sri Lanka"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <div className="flex items-end justify-end">
                        {editList.logisticSteps.length > 1 && (
                          <button
                            onClick={() => handleRemoveLogisticStep(index, true)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Shipping Summary</h3>
                <p className="text-xl font-semibold">
                  Estimated Cost: ${calculateShippingCost(editList.items, editList.logisticSteps, methods).cost.toFixed(2)}
                  (LKR {(calculateShippingCost(editList.items, editList.logisticSteps, methods).cost / lkrToUsdRate).toFixed(0)})
                </p>
                <p className="text-lg">
                  Total CBM: {calculateShippingCost(editList.items, editList.logisticSteps, methods).cbm.toFixed(3)} cbm
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setShowEditList(false);
                  setEditList(null);
                  setFormErrors({});
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateList}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update List
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full"
          >
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this packing list? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="grid gap-6">
        {packingLists.map((list) => (
          <motion.div
            key={list.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold">{list.orderNumber}</h2>
                <p className="text-gray-600">Created on {list.createdAt}</p>
                <p className="text-gray-600 font-medium">
                  Shipping Cost: ${list.shippingCost.toFixed(2)} (LKR {(list.shippingCost / lkrToUsdRate).toFixed(0)})
                </p>
                <p className="text-gray-600 font-medium">
                  Total CBM: {list.totalCbm.toFixed(3)} cbm
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleEditList(list)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit"
                >
                  <Edit2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                {list.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveReject(list.id, 'approved')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                      title="Approve"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleApproveReject(list.id, 'rejected')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Reject"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <span className={`px-3 py-1 rounded-full text-sm ${
                  list.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : list.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {list.status.charAt(0).toUpperCase() + list.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Seller Information</h3>
                <p className="text-gray-600">{list.seller}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">Buyer Information</h3>
                <p className="text-gray-600">{list.buyer}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Logistic Steps</h3>
              <div className="space-y-2">
                {list.logisticSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{step.method}</span>
                    <span>from</span>
                    <span className="font-medium">{step.origin}</span>
                    <span>to</span>
                    <span className="font-medium">{step.destination}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Item Name</th>
                      <th className="text-left py-3 px-4">Quantity</th>
                      <th className="text-left py-3 px-4">Weight</th>
                      <th className="text-left py-3 px-4">Dimensions</th>
                      <th className="text-left py-3 px-4">CBM</th>
                      <th className="text-left py-3 px-4">Special Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.items.map((item) => (
                      <tr key={item.id} className="border-b last:border-0">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.weight}</td>
                        <td className="py-3 px-4">{item.dimensions}</td>
                        <td className="py-3 px-4">{calculateCbm(item.dimensions).toFixed(3)} cbm</td>
                        <td className="py-3 px-4">{item.specialHandling}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PackagingList;