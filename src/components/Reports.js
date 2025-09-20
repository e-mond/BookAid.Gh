import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { 
  FunnelIcon, 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import PieChart from './PieChart';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * Reports component for viewing distribution statistics and generating exports
 * Includes filtering, charts, and PDF/CSV export functionality
 */
const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    school: 'all',
    dateFrom: '',
    dateTo: '',
    type: 'all'
  });

  // Load reports data
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReports(filters);
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on current filters
  const filteredReports = reports.filter(report => {
    const matchesSchool = filters.school === 'all' || report.schoolId === filters.school;
    const matchesType = filters.type === 'all' || report.type === filters.type;
    
    let matchesDate = true;
    if (filters.dateFrom) {
      matchesDate = matchesDate && new Date(report.issuedAt) >= new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      matchesDate = matchesDate && new Date(report.issuedAt) <= new Date(filters.dateTo);
    }
    
    return matchesSchool && matchesType && matchesDate;
  });

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    loadReports();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      school: 'all',
      dateFrom: '',
      dateTo: '',
      type: 'all'
    });
  };

  // Get unique schools for filter
  const getUniqueSchools = () => {
    const schools = [...new Set(reports.map(report => report.schoolName))];
    return schools;
  };

  // Prepare chart data
  const getChartData = () => {
    const schoolDistributions = filteredReports.filter(r => r.type === 'school').length;
    const externalCollections = filteredReports.filter(r => r.type === 'external').length;
    
    return {
      labels: ['School Distributions', 'External Collections'],
      datasets: [
        {
          data: [schoolDistributions, externalCollections],
          backgroundColor: ['#007BFF', '#28A745'],
          borderColor: ['#0056b3', '#1e7e34'],
          borderWidth: 2,
        },
      ],
    };
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredReports.map(report => ({
      'Student Name': report.studentName,
      'School': report.schoolName,
      'Books': report.books,
      'Type': report.type,
      'Issued At': new Date(report.issuedAt).toLocaleDateString(),
      'Issued By': report.issuedBy
    }));
    
    return csvData;
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('FreeBooks Sekondi - Distribution Report', 20, 20);
    
    // Date range
    doc.setFontSize(12);
    const dateRange = filters.dateFrom && filters.dateTo 
      ? `${new Date(filters.dateFrom).toLocaleDateString()} - ${new Date(filters.dateTo).toLocaleDateString()}`
      : 'All Time';
    doc.text(`Report Period: ${dateRange}`, 20, 30);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 45);
    doc.setFontSize(12);
    doc.text(`Total Distributions: ${filteredReports.length}`, 20, 55);
    doc.text(`Total Books Distributed: ${filteredReports.reduce((sum, r) => sum + r.books, 0)}`, 20, 65);
    
    // Table
    const tableData = filteredReports.map(report => [
      report.studentName,
      report.schoolName,
      report.books,
      report.type,
      new Date(report.issuedAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [['Student Name', 'School', 'Books', 'Type', 'Date']],
      body: tableData,
      startY: 80,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 123, 255] }
    });
    
    doc.save('freebooks-distribution-report.pdf');
  };

  // Get statistics
  const getStatistics = () => {
    const totalDistributions = filteredReports.length;
    const totalBooks = filteredReports.reduce((sum, r) => sum + r.books, 0);
    const schoolDistributions = filteredReports.filter(r => r.type === 'school').length;
    const externalCollections = filteredReports.filter(r => r.type === 'external').length;
    
    return {
      totalDistributions,
      totalBooks,
      schoolDistributions,
      externalCollections
    };
  };

  const stats = getStatistics();

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">
            View distribution statistics and generate reports.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* School Filter */}
            <div>
              <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700 mb-2">
                School
              </label>
              <select
                id="school-filter"
                value={filters.school}
                onChange={(e) => handleFilterChange('school', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Schools</option>
                {getUniqueSchools().map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                id="type-filter"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="school">School Distribution</option>
                <option value="external">External Collection</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                id="date-from"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Date To */}
            <div>
              <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                id="date-to"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filter Actions */}
            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FunnelIcon className="h-4 w-4" />
                <span>Apply</span>
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Distributions</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDistributions}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBooks.toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">School Distributions</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.schoolDistributions}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentArrowDownIcon className="h-8 w-8 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">External Collections</p>
                {loading ? (
                  <Skeleton height={32} width={100} />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{stats.externalCollections}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Export Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <div>
            <PieChart
              data={getChartData()}
              title="Distribution Breakdown"
              height={300}
            />
          </div>

          {/* Export Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
            <div className="space-y-4">
              <button
                onClick={exportToPDF}
                className="w-full bg-red-500 text-white px-4 py-3 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span>Export to PDF</span>
              </button>
              
              <CSVLink
                data={exportToCSV()}
                filename="freebooks-distribution-report.csv"
                className="w-full bg-green-500 text-white px-4 py-3 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 no-underline"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Export to CSV</span>
              </CSVLink>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Distribution Records ({filteredReports.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" aria-label="Distribution records">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Books
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issued By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={150} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={200} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={80} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={100} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={120} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton height={20} width={100} />
                      </td>
                    </tr>
                  ))
                ) : filteredReports.length > 0 ? (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.schoolName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.books}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.type === 'school' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {report.type === 'school' ? 'School' : 'External'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.issuedBy}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No distribution records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;