import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.jsx';
import { searchData } from '../utils/fuseSearch.jsx';
import { exportToCSV } from '../utils/parseCSV.jsx';
import Navbar from './Navbar.jsx';
import Button from './common/Button.jsx';
import Table from './common/Table.jsx';
import { TableSkeleton, ChartSkeleton } from './common/SkeletonWrapper.jsx';
import { 
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (typeFilter !== 'all') {
        filters.type = typeFilter;
      }
      
      const response = await api.getReports(filters);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = searchQuery 
    ? searchData(reports, searchQuery, 'reports')
    : reports;

  const getChartData = () => {
    const schoolReports = reports.filter(r => r.schoolId !== 'external');
    const externalReports = reports.filter(r => r.schoolId === 'external');
    
    return {
      labels: ['School Distributions', 'External Distributions'],
      datasets: [
        {
          data: [schoolReports.length, externalReports.length],
          backgroundColor: [
            '#3B82F6', // Blue
            '#10B981', // Green
          ],
          borderColor: [
            '#1E40AF',
            '#059669',
          ],
          borderWidth: 1,
        },
      ],
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
      
      // Prepare table data
      const tableData = filteredReports.map(report => [
        report.id,
        report.studentId,
        report.schoolId,
        report.books,
        new Date(report.issuedAt).toLocaleDateString(),
        report.issuedBy
      ]);
      
      // Add table using autoTable
      doc.autoTable({
        head: [['ID', 'Student ID', 'School ID', 'Books', 'Issued Date', 'Issued By']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [59, 130, 246], // Blue color
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251], // Light gray
        },
      });
      
      // Add summary
      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text('Summary:', 20, finalY);
      doc.text(`Total Distributions: ${filteredReports.length}`, 20, finalY + 10);
      doc.text(`Total Books Distributed: ${filteredReports.reduce((sum, r) => sum + r.books, 0)}`, 20, finalY + 20);
      
      // Save the PDF
      doc.save('freebooks-distribution-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleCSVExport = () => {
    try {
      const csvData = filteredReports.map(report => ({
        ID: report.id,
        'Student ID': report.studentId,
        'School ID': report.schoolId,
        'Books': report.books,
        'Issued Date': new Date(report.issuedAt).toLocaleDateString(),
        'Issued By': report.issuedBy
      }));
      
      exportToCSV(csvData, 'freebooks-distribution-report.csv');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const reportHeaders = ['ID', 'Student ID', 'School ID', 'Books', 'Issued Date', 'Issued By'];
  const reportData = filteredReports.map(report => ({
    ID: report.id,
    'Student ID': report.studentId,
    'School ID': report.schoolId,
    'Books': report.books,
    'Issued Date': new Date(report.issuedAt).toLocaleDateString(),
    'Issued By': report.issuedBy
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">View and export distribution reports</p>
        </div>

        {/* Filters and Export */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="schools">School Distributions</option>
                <option value="external">External Distributions</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleCSVExport}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>CSV</span>
              </Button>
              <Button
                onClick={exportToPDF}
                variant="primary"
                className="flex items-center space-x-2"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>PDF</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribution Overview</h2>
              {loading ? (
                <ChartSkeleton />
              ) : (
                <div className="h-64">
                  <Pie data={getChartData()} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }} />
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribution Records</h2>
                {loading ? (
                  <TableSkeleton rows={10} columns={6} />
                ) : (
                  <Table
                    headers={reportHeaders}
                    data={reportData}
                    emptyMessage="No distribution records found"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Distributions</h3>
            <p className="text-3xl font-bold text-blue-600">
              {filteredReports.length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Books</h3>
            <p className="text-3xl font-bold text-green-600">
              {filteredReports.reduce((sum, report) => sum + report.books, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Average per Distribution</h3>
            <p className="text-3xl font-bold text-purple-600">
              {filteredReports.length > 0 
                ? Math.round(filteredReports.reduce((sum, report) => sum + report.books, 0) / filteredReports.length)
                : 0
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;