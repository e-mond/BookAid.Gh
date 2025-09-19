import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the InventoryContext
const InventoryContext = createContext();

// Custom hook to use the InventoryContext
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// InventoryProvider component to wrap the app
export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState({
    totalBooks: 300000,
    distributed: 0,
    remaining: 300000
  });
  const [loading, setLoading] = useState(true);

  // Load inventory data on app start
  useEffect(() => {
    loadInventory();
  }, []);

  // Load inventory from API or localStorage
  const loadInventory = async () => {
    try {
      // Try to fetch from API first
      const response = await fetch('/api/inventory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('freebooks_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        // Fallback to localStorage or default values
        const storedInventory = localStorage.getItem('freebooks_inventory');
        if (storedInventory) {
          setInventory(JSON.parse(storedInventory));
        }
      }
    } catch (error) {
      // Fallback to localStorage or default values
      const storedInventory = localStorage.getItem('freebooks_inventory');
      if (storedInventory) {
        setInventory(JSON.parse(storedInventory));
      }
    } finally {
      setLoading(false);
    }
  };

  // Update inventory (atomic operation)
  const updateInventory = (booksToDistribute) => {
    setInventory(prevInventory => {
      const newInventory = {
        ...prevInventory,
        distributed: prevInventory.distributed + booksToDistribute,
        remaining: prevInventory.remaining - booksToDistribute
      };
      
      // Persist to localStorage
      localStorage.setItem('freebooks_inventory', JSON.stringify(newInventory));
      
      return newInventory;
    });
  };

  // Reset inventory (for testing purposes)
  const resetInventory = () => {
    const defaultInventory = {
      totalBooks: 300000,
      distributed: 0,
      remaining: 300000
    };
    setInventory(defaultInventory);
    localStorage.setItem('freebooks_inventory', JSON.stringify(defaultInventory));
  };

  // Get inventory statistics
  const getStats = () => {
    const percentageDistributed = (inventory.distributed / inventory.totalBooks) * 100;
    const percentageRemaining = (inventory.remaining / inventory.totalBooks) * 100;
    
    return {
      ...inventory,
      percentageDistributed: Math.round(percentageDistributed * 100) / 100,
      percentageRemaining: Math.round(percentageRemaining * 100) / 100
    };
  };

  // Check if there are enough books available
  const hasEnoughBooks = (requiredBooks) => {
    return inventory.remaining >= requiredBooks;
  };

  const value = {
    inventory,
    loading,
    updateInventory,
    resetInventory,
    getStats,
    hasEnoughBooks,
    loadInventory
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};