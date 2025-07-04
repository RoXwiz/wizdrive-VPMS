export interface LogisticMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: number;
  pricePerKg: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  weight: number;
  method: LogisticMethod;
  status: 'pending' | 'in-transit' | 'delivered';
  totalCost: number;
  currency: string;
  createdAt: string;
  estimatedDelivery: string;
}

export interface MonthlyReport {
  month: string;
  totalShipments: number;
  totalValue: number;
  byCountry: {
    [country: string]: {
      shipments: number;
      value: number;
    };
  };
}