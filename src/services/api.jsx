import axios from 'axios';
import { 
  schools, 
  students, 
  inventory, 
  reports, 
  users, 
  logs, 
  deliveries,
  delay 
} from '../mocks.jsx';

// Configuration
const useMocks = true; // Set to false to use real API
const baseURL = '/api';

// Create axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
const mockAPI = {
  // Auth endpoints
  login: async (credentials) => {
    await delay(2000);
    const user = users.find(u => 
      u.username === credentials.username && 
      u.role === credentials.role
    );
    if (user) {
      const token = `mock-token-${user.id}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { data: { user, token } };
    }
    throw new Error('Invalid credentials');
  },

  signup: async (userData) => {
    await delay(2000);
    const newUser = {
      id: `user-${Date.now()}`,
      username: userData.username,
      email: userData.email,
      role: 'school',
      schoolId: userData.schoolName.toLowerCase().replace(/\s+/g, '-'),
      defaultPassword: 'school123'
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return { data: { user: newUser, message: 'School registered successfully' } };
  },

  changePassword: async (passwordData) => {
    await delay(2000);
    return { data: { message: 'Password changed successfully' } };
  },

  // Inventory endpoints
  getInventory: async () => {
    await delay(2000);
    return { data: inventory };
  },

  addYearlyBooks: async (yearlyData) => {
    await delay(2000);
    inventory.yearlyRecords.push(yearlyData);
    return { data: { message: 'Yearly books added successfully' } };
  },

  // School endpoints
  getSchools: async () => {
    await delay(2000);
    return { data: schools };
  },

  submitSchool: async (schoolData) => {
    await delay(2000);
    const newSchool = {
      id: `school-${Date.now()}`,
      ...schoolData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    schools.push(newSchool);
    return { data: { message: 'School submission successful', school: newSchool } };
  },

  approveSchool: async (schoolId) => {
    await delay(2000);
    const school = schools.find(s => s.id === schoolId);
    if (school) {
      school.status = 'approved';
    }
    return { data: { message: 'School approved successfully' } };
  },

  // User management endpoints
  getUsers: async () => {
    await delay(2000);
    return { data: users };
  },

  createUser: async (userData) => {
    await delay(2000);
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData
    };
    users.push(newUser);
    return { data: { message: 'User created successfully', user: newUser } };
  },

  removeUser: async (userId) => {
    await delay(2000);
    const index = users.findIndex(u => u.id === userId);
    if (index > -1) {
      users.splice(index, 1);
    }
    return { data: { message: 'User removed successfully' } };
  },

  // Delivery endpoints
  createDelivery: async (deliveryData) => {
    await delay(2000);
    const newDelivery = {
      id: `del-${Date.now()}`,
      ...deliveryData,
      deliveredAt: new Date().toISOString()
    };
    deliveries.push(newDelivery);
    // Deduct from inventory
    inventory.distributed += deliveryData.booksDelivered;
    return { data: { message: 'Delivery recorded successfully', delivery: newDelivery } };
  },

  // Student endpoints
  searchStudent: async (searchData) => {
    await delay(2000);
    const student = students.find(s => 
      s.name.toLowerCase().includes(searchData.name.toLowerCase()) &&
      s.dob === searchData.dob
    );
    return { data: { student, found: !!student } };
  },

  collectBooks: async (collectionData) => {
    await delay(2000);
    const student = students.find(s => s.id === collectionData.studentId);
    if (student) {
      student.issued = true;
      student.claimantInfo = {
        voterId: collectionData.voterId,
        proofUrls: collectionData.proofUrls || []
      };
    }
    // Deduct from inventory
    inventory.distributed += 20;
    return { data: { message: 'Books collected successfully', receipt: `REC-${Date.now()}` } };
  },

  // Reports endpoints
  getReports: async (filters = {}) => {
    await delay(2000);
    let filteredReports = [...reports];
    
    if (filters.type) {
      filteredReports = filteredReports.filter(r => {
        if (filters.type === 'schools') return r.schoolId !== 'external';
        if (filters.type === 'external') return r.schoolId === 'external';
        return true;
      });
    }
    
    return { data: filteredReports };
  },

  // Logs endpoints
  getLogs: async (role = null) => {
    await delay(2000);
    let filteredLogs = [...logs];
    
    if (role) {
      filteredLogs = filteredLogs.filter(log => log.role === role);
    }
    
    return { data: filteredLogs };
  }
};

// Real API functions (placeholder)
const realAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  getInventory: () => api.get('/inventory'),
  addYearlyBooks: (yearlyData) => api.post('/inventory/add-yearly', yearlyData),
  getSchools: () => api.get('/schools'),
  submitSchool: (schoolData) => api.post('/schools/submit', schoolData),
  approveSchool: (schoolId) => api.post(`/schools/${schoolId}/approve`),
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users/create', userData),
  removeUser: (userId) => api.delete(`/users/remove/${userId}`),
  createDelivery: (deliveryData) => api.post('/deliveries/create', deliveryData),
  searchStudent: (searchData) => api.post('/students/search', searchData),
  collectBooks: (collectionData) => api.post('/students/collect', collectionData),
  getReports: (filters) => api.get('/reports', { params: filters }),
  getLogs: (role) => api.get('/logs', { params: { role } })
};

// Export the appropriate API based on configuration
export default useMocks ? mockAPI : realAPI;