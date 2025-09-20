import Fuse from 'fuse.js';

// Default Fuse.js options for different data types
const defaultOptions = {
  threshold: 0.3, // Lower threshold means more strict matching
  distance: 100,
  keys: []
};

// School search configuration
export const schoolSearchOptions = {
  ...defaultOptions,
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'status', weight: 0.3 }
  ]
};

// Student search configuration
export const studentSearchOptions = {
  ...defaultOptions,
  keys: [
    { name: 'name', weight: 0.8 },
    { name: 'className', weight: 0.2 }
  ]
};

// User search configuration
export const userSearchOptions = {
  ...defaultOptions,
  keys: [
    { name: 'username', weight: 0.4 },
    { name: 'email', weight: 0.4 },
    { name: 'role', weight: 0.2 }
  ]
};

// Report search configuration
export const reportSearchOptions = {
  ...defaultOptions,
  keys: [
    { name: 'studentId', weight: 0.3 },
    { name: 'schoolId', weight: 0.3 },
    { name: 'issuedBy', weight: 0.2 },
    { name: 'issuedAt', weight: 0.2 }
  ]
};

// Log search configuration
export const logSearchOptions = {
  ...defaultOptions,
  keys: [
    { name: 'action', weight: 0.4 },
    { name: 'details', weight: 0.4 },
    { name: 'userId', weight: 0.2 }
  ]
};

// Generic search function
export const createSearch = (data, options = defaultOptions) => {
  const fuse = new Fuse(data, options);
  
  return (query) => {
    if (!query || query.trim().length === 0) {
      return data; // Return all data if no query
    }
    
    const results = fuse.search(query);
    return results.map(result => result.item);
  };
};

// Specific search functions
export const searchSchools = (schools, query) => {
  const fuse = new Fuse(schools, schoolSearchOptions);
  if (!query || query.trim().length === 0) return schools;
  
  const results = fuse.search(query);
  return results.map(result => result.item);
};

export const searchStudents = (students, query) => {
  const fuse = new Fuse(students, studentSearchOptions);
  if (!query || query.trim().length === 0) return students;
  
  const results = fuse.search(query);
  return results.map(result => result.item);
};

export const searchUsers = (users, query) => {
  const fuse = new Fuse(users, userSearchOptions);
  if (!query || query.trim().length === 0) return users;
  
  const results = fuse.search(query);
  return results.map(result => result.item);
};

export const searchReports = (reports, query) => {
  const fuse = new Fuse(reports, reportSearchOptions);
  if (!query || query.trim().length === 0) return reports;
  
  const results = fuse.search(query);
  return results.map(result => result.item);
};

export const searchLogs = (logs, query) => {
  const fuse = new Fuse(logs, logSearchOptions);
  if (!query || query.trim().length === 0) return logs;
  
  const results = fuse.search(query);
  return results.map(result => result.item);
};

// Advanced search with filters
export const advancedSearch = (data, query, filters = {}) => {
  let results = data;
  
  // Apply text search first
  if (query && query.trim().length > 0) {
    const fuse = new Fuse(data, defaultOptions);
    const searchResults = fuse.search(query);
    results = searchResults.map(result => result.item);
  }
  
  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      results = results.filter(item => {
        if (typeof value === 'string') {
          return item[key]?.toLowerCase().includes(value.toLowerCase());
        } else if (typeof value === 'number') {
          return item[key] === value;
        } else if (Array.isArray(value)) {
          return value.includes(item[key]);
        }
        return item[key] === value;
      });
    }
  });
  
  return results;
};

// Search with pagination
export const searchWithPagination = (data, query, page = 1, pageSize = 10, options = defaultOptions) => {
  const fuse = new Fuse(data, options);
  let results = data;
  
  if (query && query.trim().length > 0) {
    const searchResults = fuse.search(query);
    results = searchResults.map(result => result.item);
  }
  
  const totalItems = results.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedResults = results.slice(startIndex, endIndex);
  
  return {
    data: paginatedResults,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

// Highlight search terms in results
export const highlightSearchTerms = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

// Get search suggestions
export const getSearchSuggestions = (data, query, maxSuggestions = 5) => {
  if (!query || query.trim().length < 2) return [];
  
  const fuse = new Fuse(data, {
    ...defaultOptions,
    threshold: 0.5 // More lenient for suggestions
  });
  
  const results = fuse.search(query);
  return results.slice(0, maxSuggestions).map(result => result.item);
};