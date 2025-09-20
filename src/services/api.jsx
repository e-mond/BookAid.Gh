import axios from 'axios';
import {
  schools,
  students,
  inventory,
  reports,
  users,
  logs,
  deliveries,
  delay,
  getUserByCredentials,
  getLogsByRole,
  generateDefaultPassword,
  validateSchoolSubmission
} from '../mocks.jsx';

// API configuration
const API_BASE_URL = '/api';
const useMocks = true; // Set to false to use real API

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Mock API functions
const mockApi = {
  // Authentication
  login: async (credentials) => {
    await delay();
    const user = getUserByCredentials(
      credentials.username,
      credentials.password,
      credentials.role
    );
    
    if (user) {
      localStorage.setItem('authToken', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      return { data: user };
    } else {
      throw new Error('Invalid credentials');
    }
  },

  signup: async (userData) => {
    await delay();
    const defaultPassword = generateDefaultPassword();
    const newUser = {
      id: `user_${Date.now()}`,
      username: userData.username,
      email: userData.email,
      role: 'school',
      schoolId: `school_${Date.now()}`,
      schoolName: userData.schoolName,
      defaultPassword
    };
    
    // Store in localStorage for demo
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
    
    return { data: { ...newUser, password: defaultPassword } };
  },

  changePassword: async (passwordData) => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      // Mock password change
      return { data: { success: true, message: 'Password changed successfully' } };
    }
    throw new Error('User not found');
  },

  // Inventory
  getInventory: async () => {
    await delay();
    return { data: inventory };
  },

  addYearlyBooks: async (yearlyData) => {
    await delay();
    const newRecord = {
      year: yearlyData.year,
      booksAdded: yearlyData.booksAdded,
      budget: yearlyData.budget
    };
    
    inventory.yearlyRecords.push(newRecord);
    inventory.totalBooks += yearlyData.booksAdded;
    inventory.remaining += yearlyData.booksAdded;
    
    return { data: newRecord };
  },

  // Schools
  getSchools: async (status = null) => {
    await delay();
    let filteredSchools = schools;
    if (status) {
      filteredSchools = schools.filter(school => school.status === status);
    }
    return { data: filteredSchools };
  },

  submitSchool: async (submissionData) => {
    await delay();
    const validation = validateSchoolSubmission(submissionData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
    
    const newSchool = {
      id: `school_${Date.now()}`,
      ...submissionData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      students: [],
      deliveryProofs: []
    };
    
    schools.push(newSchool);
    return { data: newSchool };
  },

  approveSchool: async (schoolId) => {
    await delay();
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      school.status = 'approved';
      return { data: school };
    }
    throw new Error('School not found');
  },

  deliverSchool: async (schoolId) => {
    await delay();
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      school.status = 'delivered';
      inventory.distributed += school.totalDeclared * 20;
      inventory.remaining -= school.totalDeclared * 20;
      return { data: school };
    }
    throw new Error('School not found');
  },

  // Students
  searchStudent: async (searchData) => {
    await delay();
    const student = students.find(s => 
      s.name.toLowerCase().includes(searchData.name.toLowerCase()) &&
      s.dob === searchData.dob
    );
    
    if (student) {
      return { data: student };
    }
    throw new Error('Student not found');
  },

  collectStudent: async (studentId, collectionData) => {
    await delay();
    const student = students.find(s => s.id === studentId);
    if (student && !student.issued) {
      student.issued = true;
      student.issuedAt = new Date().toISOString();
      student.claimantInfo = collectionData;
      
      const newReport = {
        id: `ir_${Date.now()}`,
        studentId: student.id,
        schoolId: 'external',
        books: 20,
        issuedAt: student.issuedAt,
        issuedBy: 'staff'
      };
      
      reports.push(newReport);
      inventory.distributed += 20;
      inventory.remaining -= 20;
      
      return { data: { student, report: newReport } };
    }
    throw new Error('Student not found or already collected');
  },

  // Deliveries
  createDelivery: async (deliveryData) => {
    await delay();
    const newDelivery = {
      id: `del_${Date.now()}`,
      ...deliveryData,
      deliveredAt: new Date().toISOString()
    };
    
    deliveries.push(newDelivery);
    inventory.distributed += deliveryData.booksDelivered;
    inventory.remaining -= deliveryData.booksDelivered;
    
    return { data: newDelivery };
  },

  // Reports
  getReports: async (filters = {}) => {
    await delay();
    let filteredReports = reports;
    
    if (filters.type === 'schools') {
      filteredReports = reports.filter(r => r.schoolId !== 'external');
    } else if (filters.type === 'external') {
      filteredReports = reports.filter(r => r.schoolId === 'external');
    }
    
    return { data: filteredReports };
  },

  // Users
  getUsers: async () => {
    await delay();
    return { data: users };
  },

  createUser: async (userData) => {
    await delay();
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData
    };
    
    users.push(newUser);
    return { data: newUser };
  },

  removeUser: async (userId) => {
    await delay();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      return { data: { success: true } };
    }
    throw new Error('User not found');
  },

  // Logs
  getLogs: async (role = null) => {
    await delay();
    const filteredLogs = role ? getLogsByRole(role) : logs;
    return { data: filteredLogs };
  }
};

// Real API functions (placeholder)
const realApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  getInventory: () => api.get('/inventory'),
  addYearlyBooks: (yearlyData) => api.post('/inventory/add-yearly', yearlyData),
  getSchools: (status) => api.get(`/schools${status ? `?status=${status}` : ''}`),
  submitSchool: (submissionData) => api.post('/schools/submit', submissionData),
  approveSchool: (schoolId) => api.post(`/schools/${schoolId}/approve`),
  deliverSchool: (schoolId) => api.post(`/schools/${schoolId}/deliver`),
  searchStudent: (searchData) => api.post('/students/search', searchData),
  collectStudent: (studentId, collectionData) => api.post(`/students/${studentId}/collect`, collectionData),
  createDelivery: (deliveryData) => api.post('/deliveries/create', deliveryData),
  getReports: (filters) => api.get('/reports', { params: filters }),
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users/create', userData),
  removeUser: (userId) => api.delete(`/users/remove/${userId}`),
  getLogs: (role) => api.get('/logs', { params: { role } })
};

// Export the appropriate API based on configuration
export default useMocks ? mockApi : realApi;