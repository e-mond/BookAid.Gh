import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import api from '../services/api.jsx';
import Button from './common/Button.jsx';
import { useInventory } from '../contexts/InventoryContext.jsx';
import { ChartSkeleton, TableSkeleton } from './common/SkeletonWrapper.jsx';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Details = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { inventory } = useInventory();

  useEffect(() => {
    loadData();
  }, [type]);

  const loadData = async () => {
    try {
      setLoading(true);
      let response;
      
      switch (type) {
        case 'total':
          response = await api.getInventory();
          setData([response.data]);
          break;
        case 'distributions':
        case 'schools':
        case 'external':
          response = await api.getReports({ type: type === 'distributions' ? null : type });
          setData(response.data);
          break;
        default:
          setData([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    switch (type) {
      case 'total':
        return 'Total Books Overview';
      case 'distributions':
        return 'All Distributions';
      case 'schools':
        return 'School Distributions';
      case 'external':
        return 'External Collections';
      default:
        return 'Details';
    }
  };

  const getPageDescription = () => {
    switch (type) {
      case 'total':
        return 'Overview of total books in inventory and distribution statistics';
      case 'distributions':
        return 'Complete list of all book distributions and collections';
      case 'schools':
        return 'Books distributed to schools across Sekondi';
      case 'external':
        return 'Books collected by parents and external students';
      default:
        return 'Detailed information';
    }
  };

  const renderTotalBooksView = () => {
    if (loading) {
      return <ChartSkeleton />;
    }

    const inventoryData = data[0] || inventory;
    const distributionPercentage = (inventoryData.distributed / inventoryData.totalBooks) * 100;

    const chartData = {
      labels: ['Distributed', 'Remaining'],
      datasets: [
        {
          data: [inventoryData.distributed, inventoryData.remaining],
          backgroundColor: ['#28A745', '#6C757D'],
          borderColor: ['#1e7e34', '#495057'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
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
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Books
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventoryData.totalBooks.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-success rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Distributed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventoryData.distributed.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Remaining
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {inventoryData.remaining.toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Distribution Overview</h2>
          </div>
          <div className="p-6">
            <div className="h-64">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDistributionsView = () => {
    if (loading) {
      return <TableSkeleton rows={10} columns={5} />;
    }

    const schoolReports = data.filter(r => r.schoolId !== 'external');
    const externalReports = data.filter(r => r.schoolId === 'external');

    const chartData = {
      labels: ['School Distributions', 'External Collections'],
      datasets: [
        {
          label: 'Number of Distributions',
          data: [schoolReports.length, externalReports.length],
          backgroundColor: ['#007BFF', '#28A745'],
          borderColor: ['#0056b3', '#1e7e34'],
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        title: {
          display: true,
          text: 'Distribution Types'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    };

    const tableHeaders = ['ID', 'School/Type', 'Books', 'Date', 'Issued By'];
    const tableData = data.map(report => [
      report.id,
      report.schoolId === 'external' ? 'External' : report.schoolId,
      report.books,
      new Date(report.issuedAt).toLocaleDateString(),
      report.issuedBy
    ]);

    return (
      <div className="space-y-6">
        {/* Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Distribution Types</h2>
          </div>
          <div className="p-6">
            <div className="h-64">
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Distribution Records</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSchoolsView = () => {
    return renderDistributionsView();
  };

  const renderExternalView = () => {
    return renderDistributionsView();
  };

  const renderContent = () => {
    switch (type) {
      case 'total':
        return renderTotalBooksView();
      case 'distributions':
        return renderDistributionsView();
      case 'schools':
        return renderSchoolsView();
      case 'external':
        return renderExternalView();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Invalid page type</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-1">{getPageDescription()}</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </Button>
      </div>

      {renderContent()}
    </div>
  );
};

export default Details;