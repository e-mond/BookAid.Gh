import Fuse from 'fuse.js';

// Fuse.js configuration for different data types
const fuseOptions = {
  // For schools
  schools: {
    keys: [
      { name: 'name', weight: 0.7 },
      { name: 'status', weight: 0.3 }
    ],
    threshold: 0.3,
    includeScore: true
  },
  
  // For students
  students: {
    keys: [
      { name: 'name', weight: 0.6 },
      { name: 'className', weight: 0.3 },
      { name: 'dob', weight: 0.1 }
    ],
    threshold: 0.4,
    includeScore: true
  },
  
  // For users
  users: {
    keys: [
      { name: 'username', weight: 0.5 },
      { name: 'email', weight: 0.3 },
      { name: 'role', weight: 0.2 }
    ],
    threshold: 0.3,
    includeScore: true
  },
  
  // For reports
  reports: {
    keys: [
      { name: 'studentId', weight: 0.4 },
      { name: 'schoolId', weight: 0.4 },
      { name: 'issuedBy', weight: 0.2 }
    ],
    threshold: 0.4,
    includeScore: true
  },
  
  // For logs
  logs: {
    keys: [
      { name: 'action', weight: 0.5 },
      { name: 'details', weight: 0.3 },
      { name: 'user', weight: 0.2 }
    ],
    threshold: 0.4,
    includeScore: true
  },
  
  // Default configuration
  default: {
    keys: ['name'],
    threshold: 0.3,
    includeScore: true
  }
};

// Create search function for specific data type
export const createSearch = (data, dataType = 'default') => {
  const options = fuseOptions[dataType] || fuseOptions.default;
  const fuse = new Fuse(data, options);
  
  return (query) => {
    if (!query || query.trim() === '') {
      return data;
    }
    
    const results = fuse.search(query);
    return results.map(result => result.item);
  };
};

// Generic search function
export const searchData = (data, query, dataType = 'default') => {
  const searchFn = createSearch(data, dataType);
  return searchFn(query);
};

// Advanced search with filters
export const advancedSearch = (data, query, filters = {}, dataType = 'default') => {
  let results = searchData(data, query, dataType);
  
  // Apply additional filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      results = results.filter(item => {
        if (typeof value === 'string') {
          return item[key]?.toLowerCase().includes(value.toLowerCase());
        }
        return item[key] === value;
      });
    }
  });
  
  return results;
};

// Search with pagination
export const searchWithPagination = (data, query, page = 1, pageSize = 10, dataType = 'default') => {
  const results = searchData(data, query, dataType);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: results.slice(startIndex, endIndex),
    total: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize)
  };
};

// Highlight search terms in results
export const highlightSearchTerms = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

export default {
  createSearch,
  searchData,
  advancedSearch,
  searchWithPagination,
  highlightSearchTerms
};