import React, { createContext, useContext, useState } from 'react';
import { Plane, Ship, Truck, Train } from 'lucide-react';

interface LogisticMethod {
  id: string;
  icon: React.FC<{ className?: string }>;
  name: string;
  description: string;
  pricePerKg: number; // In USD
  pricePerCbm: number; // In USD
  details: {
    deliveryTime: string;
    minWeight: string;
    maxWeight: string;
    minCbm: string;
    maxCbm: string;
    restrictions: string[];
    benefits: string[];
    documentation: string[];
  };
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  weight: string;
  cbm: string;
  shippingCost: number;
  description: string;
  items: string;
  specialInstructions: string;
  logisticSteps: { method: string; origin: string; destination: string }[];
  steps: { icon: string; label: string; date: string; completed: boolean }[];
  history: any[];
  orderNumber: string; // Link to packing list
}

interface LogisticContextType {
  methods: LogisticMethod[];
  updateMethods: (methods: LogisticMethod[]) => void;
  shipments: Shipment[];
  addShipment: (shipment: Shipment) => void;
  updateShipment: (shipment: Shipment) => void;
  deleteShipment: (id: string) => void;
  addNotification: (message: string) => void;
  notifications: string[];
}

const LogisticContext = createContext<LogisticContextType | undefined>(undefined);

export const LogisticProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [methods, setMethods] = useState<LogisticMethod[]>([
    {
      id: 'air',
      icon: Plane,
      name: 'Air Freight',
      description: 'Fastest shipping method with 2-3 days delivery',
      pricePerKg: 2500 * 0.0033,
      pricePerCbm: 150,
      details: {
        deliveryTime: '2-3 days',
        minWeight: '10kg',
        maxWeight: '1000kg',
        minCbm: '0.1cbm',
        maxCbm: '5cbm',
        restrictions: ['Hazardous materials', 'Oversized cargo'],
        benefits: [
          'Fastest delivery time',
          'Global reach',
          'Ideal for time-sensitive cargo',
          'Enhanced security'
        ],
        documentation: [
          'Commercial Invoice',
          'Packing List',
          'Air Waybill',
          'Certificate of Origin'
        ]
      }
    },
    {
      id: 'sea',
      icon: Ship,
      name: 'Sea Freight',
      description: 'Economic option for bulk shipments, 20-30 days',
      pricePerKg: 500 * 0.0033,
      pricePerCbm: 50,
      details: {
        deliveryTime: '20-30 days',
        minWeight: '100kg',
        maxWeight: 'Unlimited',
        minCbm: '1cbm',
        maxCbm: 'Unlimited',
        restrictions: ['Perishable goods'],
        benefits: [
          'Most economical for large shipments',
          'Suitable for all types of cargo',
          'Higher weight capacity',
          'Lower carbon footprint'
        ],
        documentation: [
          'Bill of Lading',
          'Commercial Invoice',
          'Packing List',
          'Import License'
        ]
      }
    },
    {
      id: 'road',
      icon: Truck,
      name: 'Road Transport',
      description: 'Flexible inland transportation, 5-7 days',
      pricePerKg: 1000 * 0.0033,
      pricePerCbm: 75,
      details: {
        deliveryTime: '5-7 days',
        minWeight: '50kg',
        maxWeight: '25000kg',
        minCbm: '0.5cbm',
        maxCbm: '30cbm',
        restrictions: ['Oversized cargo requires special permit'],
        benefits: [
          'Door-to-door delivery',
          'Flexible scheduling',
          'Cost-effective',
          'Regular tracking updates'
        ],
        documentation: [
          'Delivery Note',
          'Commercial Invoice',
          'Transport Permit',
          'Insurance Certificate'
        ]
      }
    },
    {
      id: 'rail',
      icon: Train,
      name: 'Rail Freight',
      description: 'Efficient for long-distance inland routes, 10-15 days',
      pricePerKg: 750 * 0.0033,
      pricePerCbm: 60,
      details: {
        deliveryTime: '10-15 days',
        minWeight: '500kg',
        maxWeight: '50000kg',
        minCbm: '2cbm',
        maxCbm: '100cbm',
        restrictions: ['Route limitations', 'Size restrictions'],
        benefits: [
          'Environmentally friendly',
          'Reliable schedules',
          'Suitable for heavy cargo',
          'Cost-effective for long distances'
        ],
        documentation: [
          'Rail Consignment Note',
          'Commercial Invoice',
          'Packing List',
          'Insurance Document'
        ]
      }
    }
  ]);

  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  const updateMethods = (newMethods: LogisticMethod[]) => {
    setMethods(newMethods);
  };

  const addShipment = (shipment: Shipment) => {
    console.log('Adding Shipment to Context:', shipment); // Debugging log
    setShipments((prev) => [...prev, shipment]);
    addNotification(`New tracking record created for order ${shipment.orderNumber}`);
  };

  const updateShipment = (updatedShipment: Shipment) => {
    console.log('Updating Shipment in Context:', updatedShipment); // Debugging log
    setShipments((prev) =>
      prev.map((s) => (s.id === updatedShipment.id ? { ...s, ...updatedShipment } : s))
    );
  };

  const deleteShipment = (id: string) => {
    const shipment = shipments.find((s) => s.id === id);
    if (shipment) {
      setShipments((prev) => prev.filter((s) => s.id !== id));
      addNotification(`Tracking record for order ${shipment.orderNumber} deleted`);
    }
  };

  const addNotification = (message: string) => {
    setNotifications((prev) => [...prev, message]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 5000);
  };

  return (
    <LogisticContext.Provider
      value={{
        methods,
        updateMethods,
        shipments,
        addShipment,
        updateShipment,
        deleteShipment,
        addNotification,
        notifications
      }}
    >
      {children}
    </LogisticContext.Provider>
  );
};

export const useLogisticContext = () => {
  const context = useContext(LogisticContext);
  if (!context) {
    throw new Error('useLogisticContext must be used within a LogisticProvider');
  }
  return context;
};