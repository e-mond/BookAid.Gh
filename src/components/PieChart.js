import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * PieChart component for displaying distribution data
 * Uses Chart.js with react-chartjs-2 for rendering
 */
const PieChart = ({ 
  data, 
  title = "Distribution Breakdown",
  className = "",
  height = 300,
  showLegend = true,
  showTooltip = true
}) => {
  // Default data if none provided
  const defaultData = {
    labels: ['School Distributions', 'External Collections'],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: [
          '#007BFF', // Primary blue
          '#28A745', // Success green
        ],
        borderColor: [
          '#0056b3',
          '#1e7e34',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart configuration
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: 'Roboto',
            size: 12
          }
        }
      },
      tooltip: {
        enabled: showTooltip,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#007BFF',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
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
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
    }
  };

  // Use provided data or default
  const chartData = data || defaultData;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Chart Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        {title}
      </h3>
      
      {/* Chart Container */}
      <div 
        className="relative"
        style={{ height: `${height}px` }}
        role="img"
        aria-label={`Pie chart showing ${title}`}
      >
        <Pie 
          data={chartData} 
          options={options}
          aria-label={`Pie chart displaying ${chartData.labels.join(', ')}`}
        />
      </div>
      
      {/* Chart Summary */}
      {chartData.datasets && chartData.datasets[0] && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {chartData.labels.map((label, index) => {
            const value = chartData.datasets[0].data[index];
            const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            return (
              <div key={index} className="text-center">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-1"
                  style={{ 
                    backgroundColor: chartData.datasets[0].backgroundColor[index] 
                  }}
                ></div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-lg font-bold text-gray-700">{value}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PieChart;