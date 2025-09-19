import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the InventoryContext
const InventoryContext = createContext();

// Custom hook to use InventoryContext
export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

// InventoryProvider component to manage book distribution state
export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState({
    totalBooks: 300000,
    distributed: 0,
    remaining: 300000
  });
  const [loading, setLoading] = useState(true);

  // Initialize inventory state from localStorage or default values
  useEffect(() => {
    const storedInventory = localStorage.getItem('freebooks_inventory');
    
    if (storedInventory) {
      try {
        const parsedInventory = JSON.parse(storedInventory);
        setInventory(parsedInventory);
      } catch (error) {
        console.error('Error parsing stored inventory data:', error);
        // Use default values if parsing fails
        const defaultInventory = {
          totalBooks: 300000,
          distributed: 0,
          remaining: 300000
        };
        setInventory(defaultInventory);
        localStorage.setItem('freebooks_inventory', JSON.stringify(defaultInventory));
      }
    }
    setLoading(false);
  }, []);

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('freebooks_inventory', JSON.stringify(inventory));
    }
  }, [inventory, loading]);

  // Update inventory - deduct books atomically
  const updateInventory = (booksToDistribute) => {
    setInventory(prevInventory => {
      const newDistributed = prevInventory.distributed + booksToDistribute;
      const newRemaining = prevInventory.totalBooks - newDistributed;
      
      // Prevent negative remaining books
      if (newRemaining < 0) {
        throw new Error('Insufficient books remaining');
      }
      
      return {
        ...prevInventory,
        distributed: newDistributed,
        remaining: newRemaining
      };
    });
  };

  // Reset inventory to default values (admin function)
  const resetInventory = () => {
    const defaultInventory = {
      totalBooks: 300000,
      distributed: 0,
      remaining: 300000
    };
    setInventory(defaultInventory);
  };

  // Get inventory statistics
  const getStats = () => {
    const distributionPercentage = (inventory.distributed / inventory.totalBooks) * 100;
    const studentsServed = Math.floor(inventory.distributed / 20); // 20 books per student
    
    return {
      distributionPercentage: Math.round(distributionPercentage * 100) / 100,
      studentsServed,
      booksPerStudent: 20
    };
  };

  // Check if sufficient books are available
  const canDistribute = (booksNeeded) => {
    return inventory.remaining >= booksNeeded;
  };

  const value = {
    inventory,
    loading,
    updateInventory,
    resetInventory,
    getStats,
    canDistribute
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};