import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import Input from './common/Input.jsx';
import Table from './common/Table.jsx';
import Toast from './common/Toast.jsx';
import { searchReports } from '../utils/fuseSearch.jsx';
import { TableSkeleton, ChartSkeleton } from './common/SkeletonWrapper.jsx';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    let filtered = reports;

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => {
        if (typeFilter === 'schools') {
          return report.schoolId !== 'external';
        } else if (typeFilter === 'external') {
          return report.schoolId === 'external';
        }
        return true;
      });
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.issuedAt).toDateString();
        const filterDate = new Date(dateFilter).toDateString();
        return reportDate === filterDate;
      });
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchReports(filtered, searchQuery);
    }

    setFilteredReports(filtered);
  }, [reports, typeFilter, dateFilter, searchQuery]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.getReports();
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
      showToastMessage('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const schoolReports = reports.filter(r => r.schoolId !== 'external');
    const externalReports = reports.filter(r => r.schoolId === 'external');

    return {
      labels: ['School Distributions', 'External Collections'],
      datasets: [
        {
          data: [schoolReports.length, externalReports.length],
          backgroundColor: ['#007BFF', '#28A745'],
          borderColor: ['#0056b3', '#1e7e34'],
          borderWidth: 1,
        },
      ],
    };
  };

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    };
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('FreeBooks Sekondi - Distribution Report', 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Add summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 45);
      
      const schoolReports = reports.filter(r => r.schoolId !== 'external');
      const externalReports = reports.filter(r => r.schoolId === 'external');
      const totalBooks = reports.reduce((sum, r) => sum + r.books, 0);
      
      doc.setFontSize(10);
      doc.text(`Total Distributions: ${reports.length}`, 20, 55);
      doc.text(`School Distributions: ${schoolReports.length}`, 20, 60);
      doc.text(`External Collections: ${externalReports.length}`, 20, 65);
      doc.text(`Total Books Distributed: ${totalBooks.toLocaleString()}`, 20, 70);
      
      // Add table
      doc.setFontSize(14);
      doc.text('Distribution Details', 20, 85);
      
      const tableData = filteredReports.map(report => [
        report.id,
        report.schoolId === 'external' ? 'External' : report.schoolId,
        report.books,
        new Date(report.issuedAt).toLocaleDateString(),
        report.issuedBy
      ]);
      
      doc.autoTable({
        head: [['ID', 'School/Type', 'Books', 'Date', 'Issued By']],
        body: tableData,
        startY: 90,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 123, 255] }
      });
      
      // Save the PDF
      doc.save('freebooks-distribution-report.pdf');
      showToastMessage('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToastMessage('Failed to export PDF', 'error');
    }
  };

  const getCSVData = () => {
    return filteredReports.map(report => ({
      'ID': report.id,
      'School/Type': report.schoolId === 'external' ? 'External' : report.schoolId,
      'Books': report.books,
      'Date': new Date(report.issuedAt).toLocaleDateString(),
      'Issued By': report.issuedBy
    }));
  };

  const showToastMessage = (message, type) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  const handleRowClick = (report) => {
    // Show report details in console for now
    console.log('Report details:', report);
  };

  // Prepare table data
  const tableHeaders = ['ID', 'School/Type', 'Books', 'Date', 'Issued By'];
  const tableData = filteredReports.map(report => [
    report.id,
    report.schoolId === 'external' ? 'External' : report.schoolId,
    report.books,
    new Date(report.issuedAt).toLocaleDateString(),
    report.issuedBy
  ]);

  return (
       <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <div className="flex space-x-2">
          <CSVLink
            data={getCSVData()}
            filename="freebooks-distribution-report.csv"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-success hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success"
          >
            Export CSV
          </CSVLink>
          <Button
            variant="primary"
            onClick={exportToPDF}
            aria-label="Export to PDF"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-success focus:border-success"
            >
              <option value="all">All Types</option>
              <option value="schools">School Distributions</option>
              <option value="external">External Collections</option>
            </select>
          </div>
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Distribution Overview</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-64">
              <Pie data={getChartData()} options={getChartOptions()} />
            </div>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Distribution Records</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : (
            <Table
              headers={tableHeaders}
              data={tableData}
              onRowClick={handleRowClick}
              emptyMessage="No reports found"
            />
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
          duration={3000}
        />
      )}
    </div>
  );
};

export default Reports;