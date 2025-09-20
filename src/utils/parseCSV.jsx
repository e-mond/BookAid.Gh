// CSV parsing utility functions

// Parse CSV string into array of objects
export const parseCSV = (csvString, options = {}) => {
  const {
    delimiter = ',',
    hasHeader = true,
    skipEmptyLines = true,
    trimFields = true
  } = options;

  try {
    const lines = csvString.split('\n');
    let data = [];
    let headers = [];

    // Remove empty lines if requested
    const filteredLines = skipEmptyLines 
      ? lines.filter(line => line.trim().length > 0)
      : lines;

    if (filteredLines.length === 0) {
      return { data: [], headers: [], error: null };
    }

    // Parse headers if present
    if (hasHeader) {
      headers = parseCSVLine(filteredLines[0], delimiter, trimFields);
      data = filteredLines.slice(1).map(line => {
        const values = parseCSVLine(line, delimiter, trimFields);
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
    } else {
      // No headers, use index-based keys
      data = filteredLines.map(line => {
        const values = parseCSVLine(line, delimiter, trimFields);
        const row = {};
        values.forEach((value, index) => {
          row[`column_${index}`] = value;
        });
        return row;
      });
    }

    return { data, headers, error: null };
  } catch (error) {
    return { 
      data: [], 
      headers: [], 
      error: `CSV parsing error: ${error.message}` 
    };
  }
};

// Parse a single CSV line, handling quoted fields
const parseCSVLine = (line, delimiter, trimFields) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
        continue;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator
      result.push(trimFields ? current.trim() : current);
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  // Add the last field
  result.push(trimFields ? current.trim() : current);

  return result;
};

// Validate CSV data for student records
export const validateStudentCSV = (csvData) => {
  const errors = [];
  const warnings = [];
  const validStudents = [];

  // Expected headers for student CSV
  const expectedHeaders = ['name', 'dob', 'className'];
  const requiredHeaders = ['name', 'dob'];

  // Check headers
  const headers = Object.keys(csvData[0] || {});
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
  
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
    return { validStudents, errors, warnings };
  }

  // Validate each row
  csvData.forEach((row, index) => {
    const rowErrors = [];
    const student = {};

    // Validate name
    if (!row.name || row.name.trim().length < 2) {
      rowErrors.push('Name must be at least 2 characters');
    } else {
      student.name = row.name.trim();
    }

    // Validate date of birth
    if (!row.dob) {
      rowErrors.push('Date of birth is required');
    } else {
      const dob = new Date(row.dob);
      if (isNaN(dob.getTime())) {
        rowErrors.push('Invalid date format for date of birth');
      } else {
        student.dob = row.dob;
      }
    }

    // Validate class name
    if (!row.className || row.className.trim().length < 1) {
      rowErrors.push('Class name is required');
    } else {
      student.className = row.className.trim();
    }

    // Check for age warnings
    if (student.dob) {
      const dob = new Date(student.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      
      if (age < 5 || age > 18) {
        warnings.push(`Row ${index + 1}: Age (${age}) seems outside typical school range`);
      }
    }

    if (rowErrors.length === 0) {
      validStudents.push(student);
    } else {
      errors.push(`Row ${index + 1}: ${rowErrors.join(', ')}`);
    }
  });

  return { validStudents, errors, warnings };
};

// Convert array of objects to CSV string
export const arrayToCSV = (data, options = {}) => {
  const {
    delimiter = ',',
    includeHeader = true,
    headers = null
  } = options;

  if (!data || data.length === 0) {
    return '';
  }

  const csvHeaders = headers || Object.keys(data[0]);
  let csvString = '';

  // Add headers
  if (includeHeader) {
    csvString += csvHeaders.map(header => `"${header}"`).join(delimiter) + '\n';
  }

  // Add data rows
  data.forEach(row => {
    const values = csvHeaders.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains delimiter or quotes
      const escapedValue = value.toString().replace(/"/g, '""');
      return `"${escapedValue}"`;
    });
    csvString += values.join(delimiter) + '\n';
  });

  return csvString;
};

// Download CSV file
export const downloadCSV = (data, filename = 'data.csv', options = {}) => {
  const csvString = arrayToCSV(data, options);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Parse CSV file from File object
export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvString = event.target.result;
        const result = parseCSV(csvString);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// Sample CSV template for students
export const getStudentCSVTemplate = () => {
  const template = [
    { name: 'John Doe', dob: '2010-01-15', className: 'Class 5' },
    { name: 'Jane Smith', dob: '2010-03-22', className: 'Class 5' },
    { name: 'Mike Johnson', dob: '2009-11-08', className: 'Class 6' }
  ];
  
  return arrayToCSV(template);
};