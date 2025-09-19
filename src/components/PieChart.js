import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PieChart = ({
  data,
  title = '',
  width = 400,
  height = 400,
  showLegend = true,
  showTooltips = true,
  colors = ['#007BFF', '#28A745', '#DC3545', '#FFC107', '#17A2B8'],
  className = '',
  loading = false
}) => {
  // Default chart options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        enabled: showTooltips,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  // Prepare chart data with colors
  const chartData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || colors,
      borderColor: dataset.borderColor || colors.map(color => color),
      borderWidth: dataset.borderWidth || 2,
      hoverOffset: dataset.hoverOffset || 4
    }))
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="animate-pulse">
          <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
          {showLegend && (
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-28 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-36 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.datasets || data.datasets.length === 0 || 
      data.datasets.every(dataset => !dataset.data || dataset.data.length === 0)) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center text-gray-500">
          <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Pie 
        data={chartData} 
        options={defaultOptions}
        aria-label={title || "Pie chart"}
        role="img"
      />
    </div>
  );
};

// Helper function to create chart data
export const createPieChartData = (labels, values, options = {}) => {
  const {
    label = 'Dataset',
    colors = ['#007BFF', '#28A745', '#DC3545', '#FFC107', '#17A2B8'],
    ...otherOptions
  } = options;

  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 4,
        ...otherOptions
      }
    ]
  };
};

export default PieChart;