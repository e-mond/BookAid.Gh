// CSV parsing utilities for student data import

export const parseCSV = (csvText) => {
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }
  
  const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`);
    }
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index].trim();
    });
    
    data.push(row);
  }
  
  return data;
};

// Parse a single CSV line, handling quoted values
const parseCSVLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  values.push(current);
  
  return values;
};

// Validate CSV headers for student data
export const validateCSVHeaders = (headers) => {
  const requiredHeaders = ['name', 'dob', 'class'];
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  
  const missingHeaders = requiredHeaders.filter(required => 
    !normalizedHeaders.includes(required)
  );
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
  }
  
  return true;
};

// Convert CSV data to student objects
export const csvToStudents = (csvData) => {
  return csvData.map((row, index) => {
    const student = {
      name: row.name || row.Name || '',
      dob: row.dob || row.DOB || row.date_of_birth || '',
      className: row.class || row.Class || row.class_name || ''
    };
    
    // Validate required fields
    if (!student.name) {
      throw new Error(`Row ${index + 2}: Student name is required`);
    }
    
    if (!student.dob) {
      throw new Error(`Row ${index + 2}: Date of birth is required`);
    }
    
    if (!student.className) {
      throw new Error(`Row ${index + 2}: Class is required`);
    }
    
    return student;
  });
};

// Generate CSV template
export const generateCSVTemplate = () => {
  const headers = ['Name', 'DOB (YYYY-MM-DD)', 'Class'];
  const sampleData = [
    ['John Doe', '2010-01-15', 'Class 5'],
    ['Jane Smith', '2010-03-22', 'Class 6']
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

// Download CSV template
export const downloadCSVTemplate = () => {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'student_template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

// Export data to CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

export default {
  parseCSV,
  validateCSVHeaders,
  csvToStudents,
  generateCSVTemplate,
  downloadCSVTemplate,
  exportToCSV
};