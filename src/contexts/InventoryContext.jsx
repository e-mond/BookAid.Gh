import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.jsx';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState({
    totalBooks: 300000,
    distributed: 0,
    remaining: 300000,
    yearlyRecords: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load inventory data
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getInventory();
      setInventory(response.data);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError(error.message);
      // Fallback to default values
      setInventory({
        totalBooks: 300000,
        distributed: 0,
        remaining: 300000,
        yearlyRecords: []
      });
    } finally {
      setLoading(false);
    }
  };

  const addYearlyBooks = async (year, booksAdded, budget) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.addYearlyBooks({
        year,
        booksAdded,
        budget
      });
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        totalBooks: prev.totalBooks + booksAdded,
        remaining: prev.remaining + booksAdded,
        yearlyRecords: [...prev.yearlyRecords, response.data]
      }));
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding yearly books:', error);
      setError(error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to add yearly books' 
      };
    } finally {
      setLoading(false);
    }
  };

  const updateDistribution = (booksDistributed) => {
    setInventory(prev => ({
      ...prev,
      distributed: prev.distributed + booksDistributed,
      remaining: prev.remaining - booksDistributed
    }));
  };

  const getDistributionStats = () => {
    const distributionPercentage = inventory.totalBooks > 0 
      ? (inventory.distributed / inventory.totalBooks) * 100 
      : 0;
    
    return {
      totalBooks: inventory.totalBooks,
      distributed: inventory.distributed,
      remaining: inventory.remaining,
      distributionPercentage: Math.round(distributionPercentage * 100) / 100
    };
  };

  const getYearlyStats = () => {
    return inventory.yearlyRecords.map(record => ({
      year: record.year,
      booksAdded: record.booksAdded,
      budget: record.budget,
      costPerBook: record.budget / record.booksAdded
    }));
  };

  const refreshInventory = () => {
    loadInventory();
  };

  const value = {
    inventory,
    loading,
    error,
    addYearlyBooks,
    updateDistribution,
    getDistributionStats,
    getYearlyStats,
    refreshInventory
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};