import React, { useState, useEffect, lazy, Suspense } from 'react';
import { reportService } from '../services/api';
import PieChart, { createPieChartData } from './PieChart';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  TableCellsIcon,
  FunnelIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Lazy load components for better performance
const LazyPieChart = lazy(() => import('./PieChart'));

const Reports = () => {
  // Data state
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filters, setFilters] = useState({
    schoolId: 'all',
    startDate: null,
    endDate: null,
    type: 'all' // 'all', 'school', 'external'
  });
  
  // UI state
  const [viewMode, setViewMode] = useState('table'); // 'table', 'chart'
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchReportsData();
  }, []);

  // Apply filters when filters or reports change
  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  // Fetch all reports and related data
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [reportsData, schoolsData] = await Promise.all([
        reportService.getReports(),
        reportService.getDashboardStats() // This includes school data
      ]);
      
      setReports(reportsData);
      // Extract unique schools from reports
      const uniqueSchools = Array.from(
        new Set(reportsData.map(r => r.schoolId))
      ).map(schoolId => {
        const report = reportsData.find(r => r.schoolId === schoolId);
        return {
          id: schoolId,
          name: report.schoolName
        };
      });
      setSchools(uniqueSchools);
      
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchReportsData();
    setRefreshing(false);
  };

  // Apply filters to reports
  const applyFilters = () => {
    let filtered = [...reports];

    // Filter by school
    if (filters.schoolId !== 'all') {
      filtered = filtered.filter(report => report.schoolId === filters.schoolId);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.issuedAt);
        return reportDate >= filters.startDate && reportDate <= filters.endDate;
      });
    }

    setFilteredReports(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      schoolId: 'all',
      startDate: null,
      endDate: null,
      type: 'all'
    });
  };

  // Generate chart data
  const getChartData = () => {
    const schoolDistribution = {};
    const typeDistribution = { school: 0, external: 0 };

    filteredReports.forEach(report => {
      // School distribution
      if (report.type === 'school') {
        schoolDistribution[report.schoolName] = (schoolDistribution[report.schoolName] || 0) + report.books;
      }
      
      // Type distribution
      typeDistribution[report.type] += report.books;
    });

    return {
      schoolData: createPieChartData(
        Object.keys(schoolDistribution),
        Object.values(schoolDistribution),
        { label: 'Books by School' }
      ),
      typeData: createPieChartData(
        ['School Distribution', 'External Collection'],
        [typeDistribution.school, typeDistribution.external],
        { 
          label: 'Distribution Type',
          colors: ['#007BFF', '#28A745']
        }
      )
    };
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredReports.map(report => ({
      'Student Name': report.studentName,
      'School': report.schoolName,
      'Books': report.books,
      'Type': report.type === 'school' ? 'School' : 'External',
      'Issued Date': new Date(report.issuedAt).toLocaleDateString(),
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
    
    // Filters info
    doc.setFontSize(12);
    let yPosition = 40;
    
    if (filters.schoolId !== 'all') {
      const school = schools.find(s => s.id === filters.schoolId);
      doc.text(`School: ${school?.name || 'Unknown'}`, 20, yPosition);
      yPosition += 10;
    }
    
    if (filters.startDate && filters.endDate) {
      doc.text(
        `Date Range: ${filters.startDate.toLocaleDateString()} - ${filters.endDate.toLocaleDateString()}`,
        20,
        yPosition
      );
      yPosition += 10;
    }
    
    if (filters.type !== 'all') {
      doc.text(`Type: ${filters.type === 'school' ? 'School' : 'External'}`, 20, yPosition);
      yPosition += 10;
    }
    
    // Summary
    const totalBooks = filteredReports.reduce((sum, report) => sum + report.books, 0);
    const totalStudents = filteredReports.length;
    
    doc.text(`Total Students: ${totalStudents}`, 20, yPosition + 10);
    doc.text(`Total Books: ${totalBooks}`, 20, yPosition + 20);
    
    // Table
    const tableData = filteredReports.map(report => [
      report.studentName,
      report.schoolName,
      report.books.toString(),
      report.type === 'school' ? 'School' : 'External',
      new Date(report.issuedAt).toLocaleDateString()
    ]);
    
    doc.autoTable({
      head: [['Student Name', 'School', 'Books', 'Type', 'Date']],
      body: tableData,
      startY: yPosition + 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 123, 255] }
    });
    
    // Save
    const filename = `freebooks_report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get summary statistics
  const getSummaryStats = () => {
    const totalBooks = filteredReports.reduce((sum, report) => sum + report.books, 0);
    const schoolBooks = filteredReports.filter(r => r.type === 'school').reduce((sum, report) => sum + report.books, 0);
    const externalBooks = filteredReports.filter(r => r.type === 'external').reduce((sum, report) => sum + report.books, 0);
    
    return {
      totalStudents: filteredReports.length,
      totalBooks,
      schoolBooks,
      externalBooks,
      averageBooksPerStudent: filteredReports.length > 0 ? (totalBooks / filteredReports.length).toFixed(1) : 0
    };
  };

  const summaryStats = getSummaryStats();
  const chartData = getChartData();

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Distribution Reports</h1>
            <p className="mt-2 text-gray-600">
              View and analyze book distribution data across schools and external collections.
            </p>
          </div>
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              <FunnelIcon className="h-5 w-5 inline mr-2" />
              Filters
            </h2>
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary-hover"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* School filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
              <select
                value={filters.schoolId}
                onChange={(e) => handleFilterChange('schoolId', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">All Schools</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            </div>

            {/* Type filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="school">School Distribution</option>
                <option value="external">External Collection</option>
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholderText="Select start date"
                maxDate={new Date()}
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholderText="Select end date"
                minDate={filters.startDate}
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm font-medium text-gray-600">Total Students</div>
            {loading ? (
              <Skeleton height={24} width={60} />
            ) : (
              <div className="text-2xl font-bold text-gray-900">{summaryStats.totalStudents}</div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm font-medium text-gray-600">Total Books</div>
            {loading ? (
              <Skeleton height={24} width={80} />
            ) : (
              <div className="text-2xl font-bold text-primary">{summaryStats.totalBooks}</div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm font-medium text-gray-600">School Books</div>
            {loading ? (
              <Skeleton height={24} width={80} />
            ) : (
              <div className="text-2xl font-bold text-blue-600">{summaryStats.schoolBooks}</div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm font-medium text-gray-600">External Books</div>
            {loading ? (
              <Skeleton height={24} width={80} />
            ) : (
              <div className="text-2xl font-bold text-green-600">{summaryStats.externalBooks}</div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm font-medium text-gray-600">Avg Books/Student</div>
            {loading ? (
              <Skeleton height={24} width={40} />
            ) : (
              <div className="text-2xl font-bold text-gray-900">{summaryStats.averageBooksPerStudent}</div>
            )}
          </div>
        </div>

        {/* View Mode Toggle and Export */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableCellsIcon className="h-4 w-4 mr-2" />
              Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Charts
            </button>
          </div>

          <div className="flex space-x-2">
            <CSVLink
              data={exportToCSV()}
              filename={`freebooks_report_${new Date().toISOString().split('T')[0]}.csv`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export CSV
            </CSVLink>
            
            <button
              onClick={exportToPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" aria-label="Distribution reports">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    // Loading skeleton
                    [...Array(5)].map((_, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4"><Skeleton height={20} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={40} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={60} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={80} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={80} /></td>
                      </tr>
                    ))
                  ) : filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        No distribution records found
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {report.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.schoolName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.books}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            report.type === 'school' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {report.type === 'school' ? 'School' : 'External'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(report.issuedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {report.issuedBy}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Chart View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution by Type</h3>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <Suspense fallback={<Skeleton height={300} />}>
                  <PieChart
                    data={chartData.typeData}
                    width={400}
                    height={300}
                    loading={loading}
                    aria-label="Distribution breakdown by type"
                  />
                </Suspense>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">School Distribution</h3>
              {loading ? (
                <Skeleton height={300} />
              ) : chartData.schoolData.datasets[0].data.length > 0 ? (
                <Suspense fallback={<Skeleton height={300} />}>
                  <PieChart
                    data={chartData.schoolData}
                    width={400}
                    height={300}
                    loading={loading}
                    aria-label="Distribution breakdown by school"
                  />
                </Suspense>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <ChartBarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p>No school distribution data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;