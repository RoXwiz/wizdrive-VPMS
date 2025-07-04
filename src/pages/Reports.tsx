import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [selectedMonth, setSelectedMonth] = useState('March 2024');
  const [showFilter, setShowFilter] = useState(false);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);

  const allData = [
    { month: 'March 2024', country: 'Japan', value: 2500000 },
    { month: 'March 2024', country: 'China', value: 1800000 },
    { month: 'March 2024', country: 'USA', value: 1500000 },
    { month: 'March 2024', country: 'Germany', value: 1200000 },
    { month: 'March 2024', country: 'UK', value: 900000 },
    { month: 'February 2024', country: 'Japan', value: 2200000 },
    { month: 'February 2024', country: 'China', value: 1600000 },
    { month: 'February 2024', country: 'USA', value: 1400000 },
    { month: 'February 2024', country: 'Germany', value: 1100000 },
    { month: 'February 2024', country: 'UK', value: 850000 },
    { month: 'January 2024', country: 'Japan', value: 2000000 },
    { month: 'January 2024', country: 'China', value: 1500000 },
    { month: 'January 2024', country: 'USA', value: 1300000 },
    { month: 'January 2024', country: 'Germany', value: 1000000 },
    { month: 'January 2024', country: 'UK', value: 800000 },
  ];

  const countries = ['Japan', 'China', 'USA', 'Germany', 'UK'];

  const filteredData = allData
    .filter(item => item.month === selectedMonth)
    .filter(item => countryFilter.length === 0 || countryFilter.includes(item.country))
    .map(item => ({ country: item.country, value: item.value }));

  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0);
  const totalShipments = filteredData.length * 31; // Dummy calculation
  const avgValuePerShipment = totalValue / totalShipments;

  const toggleCountryFilter = (country: string) => {
    setCountryFilter(prev => 
      prev.includes(country) 
        ? prev.filter(c => c !== country) 
        : [...prev, country]
    );
  };

  const exportReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255); // White text
    doc.text('WizDrive Logistics', 20, 20);
    doc.setFontSize(16);
    doc.text('Monthly Report', 20, 32);

    // Month and Date
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text(`Report for: ${selectedMonth}`, 20, 50);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 140, 50);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(59, 130, 246); // Blue text
    doc.text('Summary', 20, 70);
    doc.setLineWidth(0.5);
    doc.setDrawColor(59, 130, 246);
    doc.line(20, 72, 60, 72); // Underline

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Import Value: LKR ${(totalValue / 1000000).toFixed(2)}M`, 20, 85);
    doc.text(`Total Shipments: ${totalShipments}`, 20, 95);
    doc.text(`Avg. Value/Shipment: LKR ${(avgValuePerShipment).toFixed(2)}`, 20, 105);

    // Table
    const tableData = filteredData.map(item => [
      item.country,
      `LKR ${(item.value / 1000000).toFixed(2)}M`,
      `${((item.value / totalValue) * 100).toFixed(1)}%`
    ]);

    (doc as any).autoTable({
      startY: 115,
      head: [['Country', 'Import Value', 'Percentage']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [59, 130, 246], 
        textColor: 255,
        fontSize: 12,
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 10,
        textColor: 50,
        lineColor: [200, 200, 200]
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 20, right: 20 },
      styles: { cellPadding: 3 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount}`, 180, 290);
    }

    doc.save(`wizdrive-report-${selectedMonth.toLowerCase().replace(' ', '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-900">Monthly Reports</h1>
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>March 2024</option>
            <option>February 2024</option>
            <option>January 2024</option>
          </select>
          <button 
            onClick={exportReport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Import Value by Country (LKR)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6 relative"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Summary</h2>
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
          {showFilter && (
            <div className="absolute top-16 right-6 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-10">
              <h3 className="text-sm font-semibold mb-2">Filter by Country</h3>
              {countries.map(country => (
                <div key={country} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={countryFilter.includes(country)}
                    onChange={() => toggleCountryFilter(country)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <label className="text-sm text-gray-700">{country}</label>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Import Value</span>
              <span className="text-lg font-semibold">LKR {(totalValue / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Total Shipments</span>
              <span className="text-lg font-semibold">{totalShipments}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">Average Value per Shipment</span>
              <span className="text-lg font-semibold">LKR {(avgValuePerShipment).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;