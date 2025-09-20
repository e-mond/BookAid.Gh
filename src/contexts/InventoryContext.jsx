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
  const [loading, setLoading] = useState(false);

  // Load inventory data on mount
  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await api.getInventory();
      const data = response.data;
      setInventory({
        totalBooks: data.totalBooks,
        distributed: data.distributed,
        remaining: data.totalBooks - data.distributed,
        yearlyRecords: data.yearlyRecords || []
      });
    } catch (error) {
      console.error('Failed to load inventory:', error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const addYearlyBooks = async (year, booksAdded, budget) => {
    try {
      const yearlyData = { year, booksAdded, budget };
      await api.addYearlyBooks(yearlyData);
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        totalBooks: prev.totalBooks + booksAdded,
        remaining: prev.remaining + booksAdded,
        yearlyRecords: [...prev.yearlyRecords, yearlyData]
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Failed to add yearly books:', error);
      return { success: false, error: error.message };
    }
  };

  const deductBooks = (amount) => {
    setInventory(prev => ({
      ...prev,
      distributed: prev.distributed + amount,
      remaining: prev.remaining - amount
    }));
  };

  const getDistributionStats = () => {
    const totalDistributed = inventory.distributed;
    const schoolDistributions = 0; // This would be calculated from actual data
    const externalDistributions = 0; // This would be calculated from actual data
    
    return {
      totalDistributed,
      schoolDistributions,
      externalDistributions,
      totalBooks: inventory.totalBooks,
      remaining: inventory.remaining
    };
  };

  const getYearlyStats = () => {
    return inventory.yearlyRecords.map(record => ({
      year: record.year,
      booksAdded: record.booksAdded,
      budget: record.budget,
      distributionRate: inventory.distributed / record.booksAdded * 100
    }));
  };

  const value = {
    inventory,
    loading,
    loadInventory,
    addYearlyBooks,
    deductBooks,
    getDistributionStats,
    getYearlyStats
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};