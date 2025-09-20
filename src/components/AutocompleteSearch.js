import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { apiService } from '../services/api';

/**
 * AutocompleteSearch component with fuzzy search functionality
 * Uses Fuse.js for fuzzy searching and provides keyboard navigation
 */
const AutocompleteSearch = ({ 
  placeholder = "Search...", 
  onSelect, 
  searchType = 'students',
  className = "",
  disabled = false 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const fuseRef = useRef(null);

  // Initialize Fuse.js with search options
  useEffect(() => {
    const fuseOptions = {
      keys: ['name', 'dob'],
      threshold: 0.3,
      includeScore: true
    };
    fuseRef.current = new Fuse([], fuseOptions);
  }, []);

  // Search function with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        let searchResults = [];
        
        if (searchType === 'students') {
          const students = await apiService.searchStudents(query);
          fuseRef.current.setCollection(students);
          searchResults = fuseRef.current.search(query).map(result => result.item);
        }
        
        setResults(searchResults.slice(0, 10)); // Limit to 10 results
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, searchType]);

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // Handle result selection
  const handleSelect = (result) => {
    setQuery(result.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelect && onSelect(result);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => query && setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus-ring disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label={placeholder}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
        aria-autocomplete="list"
      />

      {/* Loading indicator */}
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {results.map((result, index) => (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-50'
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="font-medium">{result.name}</div>
              <div className={`text-sm ${
                index === selectedIndex ? 'text-blue-100' : 'text-gray-500'
              }`}>
                DOB: {result.dob}
                {result.schoolId && result.schoolId !== 'external' && (
                  <span className="ml-2">• School ID: {result.schoolId}</span>
                )}
                {result.issued && (
                  <span className="ml-2 text-red-500">• Already Collected</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-gray-500 text-center">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;