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
const USE_MOCKS = true; // Toggle to false for real API

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
    console.error('Request Interceptor Error:', error.message, { config: error.config });
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Mock API implementation
const mockApi = {
  // Authentication APIs
  /**
   * Logs in a user with provided credentials
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - User's username
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} User data with token
   * @throws {Error} If credentials are invalid
   */
  login: async (credentials) => {
    await delay();
    const user = getUserByCredentials(credentials.username, credentials.password);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    localStorage.setItem('authToken', user.token);
    localStorage.setItem('user', JSON.stringify(user));
    console.log('Login Success:', { userId: user.id, role: user.role });
    return { data: user };
  },

  /**
   * Registers a new school user
   * @param {Object} userData - New user data
   * @param {string} userData.username - User's username
   * @param {string} userData.email - User's email
   * @param {string} userData.schoolName - School name
   * @returns {Promise<Object>} New user data with default password
   */
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

    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
    console.log('Signup Success:', { userId: newUser.id, schoolName: newUser.schoolName });
    return { data: { ...newUser, password: defaultPassword } };
  },

  /**
   * Changes user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Success message
   * @throws {Error} If user not found
   */
  changePassword: async (passwordData) => {
    await delay();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      throw new Error('User not found');
    }
    console.log('Password Changed:', { userId: user.id });
    return { data: { success: true, message: 'Password changed successfully' } };
  },

  // Inventory APIs
  /**
   * Retrieves current inventory
   * @returns {Promise<Object>} Inventory data
   */
  getInventory: async () => {
    await delay();
    return { data: inventory };
  },

  /**
   * Adds yearly book allocation
   * @param {Object} yearlyData - Yearly allocation data
   * @param {number} yearlyData.year - Year of allocation
   * @param {number} yearlyData.booksAdded - Number of books added
   * @param {number} yearlyData.budget - Budget for allocation
   * @returns {Promise<Object>} New inventory record
   */
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
    console.log('Yearly Books Added:', { year: yearlyData.year, books: yearlyData.booksAdded });
    return { data: newRecord };
  },

  // School APIs
  /**
   * Retrieves schools by status
   * @param {string|null} status - Optional status filter
   * @returns {Promise<Object>} List of schools
   */
  getSchools: async (status = null) => {
    await delay();
    const filteredSchools = status
      ? schools.filter(school => school.status === status)
      : schools;
    return { data: filteredSchools };
  },

  /**
   * Submits a new school application
   * @param {Object} submissionData - School submission data
   * @returns {Promise<Object>} New school data
   * @throws {Error} If submission is invalid
   */
  submitSchool: async (submissionData) => {
    await delay();
    const validation = validateSchoolSubmission(submissionData);
    if (!validation.isValid) {
      throw new Error(`School submission failed: ${validation.errors.join(', ')}`);
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
    console.log('School Submitted:', { schoolId: newSchool.id, name: newSchool.name });
    return { data: newSchool };
  },

  /**
   * Approves a school application
   * @param {string} schoolId - School ID
   * @returns {Promise<Object>} Updated school data
   * @throws {Error} If school not found
   */
  approveSchool: async (schoolId) => {
    await delay();
    const school = schools.find(s => s.id === schoolId);
    if (!school) {
      throw new Error('School not found');
    }
    school.status = 'approved';
    console.log('School Approved:', { schoolId });
    return { data: school };
  },

  /**
   * Marks a school as delivered
   * @param {string} schoolId - School ID
   * @returns {Promise<Object>} Updated school data
   * @throws {Error} If school not found
   */
  deliverSchool: async (schoolId) => {
    await delay();
    const school = schools.find(s => s.id === schoolId);
    if (!school) {
      throw new Error('School not found');
    }
    school.status = 'delivered';
    inventory.distributed += school.totalDeclared * 20;
    inventory.remaining -= school.totalDeclared * 20;
    console.log('School Delivered:', { schoolId, books: school.totalDeclared * 20 });
    return { data: school };
  },

  // Student APIs
  /**
   * Searches for a student by name and DOB
   * @param {Object} searchData - Search criteria
   * @param {string} searchData.name - Student name
   * @param {string} searchData.dob - Student date of birth
   * @returns {Promise<Object>} Student data
   * @throws {Error} If student not found
   */
  searchStudent: async (searchData) => {
    await delay();
    const student = students.find(s =>
      s.name.toLowerCase().includes(searchData.name.toLowerCase()) &&
      s.dob === searchData.dob
    );

    if (!student) {
      throw new Error('Student not found');
    }
    return { data: student };
  },

  /**
   * Records book collection for a student
   * @param {string} studentId - Student ID
   * @param {Object} collectionData - Collection details
   * @returns {Promise<Object>} Collection report
   * @throws {Error} If student not found or already collected
   */
  collectStudent: async (studentId, collectionData) => {
    await delay();
    const student = students.find(s => s.id === studentId);
    if (!student || student.issued) {
      throw new Error('Student not found or already collected');
    }

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
    console.log('Student Collection:', { studentId, reportId: newReport.id });
    return { data: { student, report: newReport } };
  },

  // Delivery APIs
  /**
   * Creates a new delivery record
   * @param {Object} deliveryData - Delivery details
   * @returns {Promise<Object>} New delivery record
   */
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
    console.log('Delivery Recorded:', { deliveryId: newDelivery.id, books: deliveryData.booksDelivered });
    return { data: newDelivery };
  },

  // Report APIs
  /**
   * Retrieves reports with optional filters
   * @param {Object} [filters={}] - Report filters
   * @param {string} [filters.type] - Filter by type (schools/external)
   * @returns {Promise<Object>} List of reports
   */
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

  // User APIs
  /**
   * Retrieves all users
   * @returns {Promise<Object>} List of users
   */
  getUsers: async () => {
    await delay();
    return { data: users };
  },

  /**
   * Creates a new user
   * @param {Object} userData - New user data
   * @returns {Promise<Object>} New user data
   */
  createUser: async (userData) => {
    await delay();
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData
    };

    users.push(newUser);
    console.log('User Created:', { userId: newUser.id, role: newUser.role });
    return { data: newUser };
  },

  /**
   * Removes a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Success response
   * @throws {Error} If user not found
   */
  removeUser: async (userId) => {
    await delay();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    users.splice(userIndex, 1);
    console.log('User Removed:', { userId });
    return { data: { success: true } };
  },

  // Log APIs
  /**
   * Retrieves logs with optional role filter
   * @param {string|null} role - Optional role filter
   * @returns {Promise<Object>} List of logs
   */
  getLogs: async (role = null) => {
    await delay();
    const filteredLogs = role ? getLogsByRole(role) : logs;
    return { data: filteredLogs };
  }
};

// Real API implementation
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

// Export the appropriate API implementation
export default USE_MOCKS ? mockApi : realApi;