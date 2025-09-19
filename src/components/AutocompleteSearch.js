import React, { useState, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const AutocompleteSearch = ({ 
  data = [], 
  onSelect, 
  placeholder = "Search...", 
  searchKeys = ['name'],
  displayKey = 'name',
  className = '',
  disabled = false,
  value = '',
  onChange,
  maxResults = 10,
  threshold = 0.3
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Configure Fuse.js for fuzzy search
  const fuse = new Fuse(data, {
    keys: searchKeys,
    threshold,
    includeScore: true,
    includeMatches: true
  });

  // Update query when value prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    if (onChange) {
      onChange(newQuery);
    }

    // Perform search
    if (newQuery.trim().length > 0) {
      const searchResults = fuse.search(newQuery).slice(0, maxResults);
      setResults(searchResults.map(result => result.item));
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  };

  // Handle result selection
  const handleSelectResult = (item) => {
    const displayValue = typeof displayKey === 'function' ? displayKey(item) : item[displayKey];
    setQuery(displayValue);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onSelect) {
      onSelect(item);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (query.trim().length > 0 && results.length > 0) {
      setShowResults(true);
    }
  };

  // Handle input blur (with delay to allow result clicking)
  const handleBlur = () => {
    setTimeout(() => {
      setShowResults(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange('');
    }
    
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          aria-label={placeholder}
          aria-expanded={showResults}
          aria-haspopup="listbox"
          role="combobox"
          aria-autocomplete="list"
          aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
        />
        
        {/* Clear button */}
        {query && !disabled && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
            aria-label="Clear search"
          >
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {showResults && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
          role="listbox"
        >
          {results.map((item, index) => {
            const displayValue = typeof displayKey === 'function' ? displayKey(item) : item[displayKey];
            const isSelected = index === selectedIndex;
            
            return (
              <div
                key={item.id || index}
                id={`result-${index}`}
                onClick={() => handleSelectResult(item)}
                className={`px-4 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                  isSelected 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-gray-50 text-gray-900'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="text-sm font-medium">
                  {displayValue}
                </div>
                {/* Additional info based on item properties */}
                {item.dob && (
                  <div className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                    DOB: {item.dob}
                  </div>
                )}
                {item.schoolName && (
                  <div className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                    School: {item.schoolName}
                  </div>
                )}
                {item.className && (
                  <div className={`text-xs ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                    Class: {item.className}
                  </div>
                )}
                {typeof item.issued !== 'undefined' && (
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      item.issued 
                        ? (isSelected ? 'bg-red-200 text-red-800' : 'bg-red-100 text-red-800')
                        : (isSelected ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-800')
                    }`}>
                      {item.issued ? 'Books Issued' : 'Eligible'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results message */}
      {showResults && results.length === 0 && query.trim().length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 p-4">
          <div className="text-sm text-gray-500 text-center">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default AutocompleteSearch;