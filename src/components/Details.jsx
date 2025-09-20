import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import api from '../services/api.jsx';
import Navbar from './Navbar.jsx';
import Table from './common/Table.jsx';
import { TableSkeleton, ChartSkeleton } from './common/SkeletonWrapper.jsx';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Details = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    loadDetailsData();
  }, [type]);

  const loadDetailsData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (type !== 'all') {
        filters.type = type;
      }
      
      const response = await api.getReports(filters);
      setData(response.data);
      
      // Generate chart data based on type
      generateChartData(response.data);
    } catch (error) {
      console.error('Failed to load details data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (reports) => {
    if (type === 'schools') {
      // School distribution chart
      const schoolData = {};
      reports.forEach(report => {
        if (report.schoolId !== 'external') {
          schoolData[report.schoolId] = (schoolData[report.schoolId] || 0) + report.books;
        }
      });
      
      setChartData({
        type: 'bar',
        data: {
          labels: Object.keys(schoolData),
          datasets: [{
            label: 'Books Distributed',
            data: Object.values(schoolData),
            backgroundColor: '#3B82F6',
            borderColor: '#1E40AF',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Books Distributed by School'
            }
          }
        }
      });
    } else if (type === 'external') {
      // External distribution pie chart
      const monthlyData = {};
      reports.forEach(report => {
        if (report.schoolId === 'external') {
          const month = new Date(report.issuedAt).toLocaleDateString('en-US', { month: 'short' });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
      });
      
      setChartData({
        type: 'pie',
        data: {
          labels: Object.keys(monthlyData),
          datasets: [{
            data: Object.values(monthlyData),
            backgroundColor: [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#06B6D4'
            ],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'External Distributions by Month'
            }
          }
        }
      });
    } else if (type === 'distributions') {
      // Overall distribution trend
      const monthlyData = {};
      reports.forEach(report => {
        const month = new Date(report.issuedAt).toLocaleDateString('en-US', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + report.books;
      });
      
      setChartData({
        type: 'bar',
        data: {
          labels: Object.keys(monthlyData),
          datasets: [{
            label: 'Books Distributed',
            data: Object.values(monthlyData),
            backgroundColor: '#10B981',
            borderColor: '#059669',
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Distribution Trend'
            }
          }
        }
      });
    } else if (type === 'total') {
      // Total books overview
      const totalBooks = reports.reduce((sum, report) => sum + report.books, 0);
      const schoolBooks = reports.filter(r => r.schoolId !== 'external').reduce((sum, report) => sum + report.books, 0);
      const externalBooks = reports.filter(r => r.schoolId === 'external').reduce((sum, report) => sum + report.books, 0);
      
      setChartData({
        type: 'pie',
        data: {
          labels: ['School Distributions', 'External Distributions'],
          datasets: [{
            data: [schoolBooks, externalBooks],
            backgroundColor: ['#3B82F6', '#10B981'],
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Total Books Distribution'
            }
          }
        }
      });
    }
  };

  const getPageTitle = () => {
    switch (type) {
      case 'total': return 'Total Books Overview';
      case 'distributions': return 'Distribution Records';
      case 'schools': return 'School Distributions';
      case 'external': return 'External Distributions';
      default: return 'Details';
    }
  };

  const getPageDescription = () => {
    switch (type) {
      case 'total': return 'Overview of all book distributions';
      case 'distributions': return 'All distribution records and trends';
      case 'schools': return 'Book distributions to schools';
      case 'external': return 'Book collections by external students';
      default: return 'Detailed view of distribution data';
    }
  };

  const getTableHeaders = () => {
    switch (type) {
      case 'schools':
        return ['School ID', 'Books Distributed', 'Records Count'];
      case 'external':
        return ['Student ID', 'Books Collected', 'Collection Date', 'Issued By'];
      default:
        return ['ID', 'Student ID', 'School ID', 'Books', 'Issued Date', 'Issued By'];
    }
  };

  const getTableData = () => {
    switch (type) {
      case 'schools': {
        const schoolData = {};
        data.forEach(report => {
          if (report.schoolId !== 'external') {
            if (!schoolData[report.schoolId]) {
              schoolData[report.schoolId] = { books: 0, count: 0 };
            }
            schoolData[report.schoolId].books += report.books;
            schoolData[report.schoolId].count += 1;
          }
        });
        
        return Object.entries(schoolData).map(([schoolId, stats]) => ({
          'School ID': schoolId,
          'Books Distributed': stats.books,
          'Records Count': stats.count
        }));
      }
      case 'external': {
        return data.filter(report => report.schoolId === 'external').map(report => ({
          'Student ID': report.studentId,
          'Books Collected': report.books,
          'Collection Date': new Date(report.issuedAt).toLocaleDateString(),
          'Issued By': report.issuedBy
        }));
      }
      default: {
        return data.map(report => ({
          ID: report.id,
          'Student ID': report.studentId,
          'School ID': report.schoolId,
          'Books': report.books,
          'Issued Date': new Date(report.issuedAt).toLocaleDateString(),
          'Issued By': report.issuedBy
        }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-2">{getPageDescription()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Visualization</h2>
            {loading ? (
              <ChartSkeleton />
            ) : chartData ? (
              <div className="h-64">
                {chartData.type === 'pie' ? (
                  <Pie data={chartData.data} options={chartData.options} />
                ) : (
                  <Bar data={chartData.data} options={chartData.options} />
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No chart data available
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-800 font-medium">Total Records</span>
                <span className="text-blue-900 font-bold text-xl">{data.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">Total Books</span>
                <span className="text-green-900 font-bold text-xl">
                  {data.reduce((sum, report) => sum + report.books, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-800 font-medium">Average per Record</span>
                <span className="text-purple-900 font-bold text-xl">
                  {data.length > 0 
                    ? Math.round(data.reduce((sum, report) => sum + report.books, 0) / data.length)
                    : 0
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6 bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Details</h2>
            {loading ? (
              <TableSkeleton rows={10} columns={getTableHeaders().length} />
            ) : (
              <Table
                headers={getTableHeaders()}
                data={getTableData()}
                emptyMessage="No data available"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;