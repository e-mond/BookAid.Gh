import axios from 'axios';
import Fuse from 'fuse.js';
import { 
  mockUsers, 
  mockSchools, 
  mockStudents, 
  mockReports, 
  mockInventory,
  mockActivityLogs,
  simulateApiDelay 
} from '../mocks';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('freebooks_token');
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('freebooks_token');
      localStorage.removeItem('freebooks_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Configuration for Fuse.js fuzzy search
const fuseOptions = {
  keys: ['name'],
  threshold: 0.3, // Lower threshold = more strict matching
  includeScore: true,
  includeMatches: true
};

// API service functions with mock fallbacks
export const authService = {
  // Login user with credentials
  login: async (credentials) => {
    try {
      await simulateApiDelay();
      
      // Try real API first
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.warn('API login failed, using mock data:', error.message);
      
      // Fallback to mock authentication
      const user = mockUsers.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password &&
        u.role === credentials.role
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      return {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email
        },
        token: `mock_token_${user.id}_${Date.now()}`
      };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('API logout failed:', error.message);
      // Continue with local logout even if API fails
    }
  }
};

export const schoolService = {
  // Submit school data and student list
  submitSchool: async (schoolData) => {
    try {
      await simulateApiDelay();
      const response = await api.post('/schools/submit', schoolData);
      return response.data;
    } catch (error) {
      console.warn('API school submission failed, using mock:', error.message);
      
      // Mock successful submission
      const newSchool = {
        id: `mock_${Date.now()}`,
        ...schoolData,
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0],
        submittedBy: 'mock_user'
      };
      
      return { success: true, school: newSchool };
    }
  },

  // Get pending schools for admin approval
  getPendingSchools: async () => {
    try {
      await simulateApiDelay();
      const response = await api.get('/schools/pending');
      return response.data;
    } catch (error) {
      console.warn('API get pending schools failed, using mock:', error.message);
      return mockSchools.filter(school => school.status === 'pending');
    }
  },

  // Get all schools with optional filtering
  getSchools: async (filters = {}) => {
    try {
      await simulateApiDelay();
      const response = await api.get('/schools', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API get schools failed, using mock:', error.message);
      
      let filteredSchools = [...mockSchools];
      
      if (filters.status) {
        filteredSchools = filteredSchools.filter(school => school.status === filters.status);
      }
      
      if (filters.search) {
        const fuse = new Fuse(filteredSchools, { keys: ['name'], threshold: 0.3 });
        const results = fuse.search(filters.search);
        filteredSchools = results.map(result => result.item);
      }
      
      return filteredSchools;
    }
  },

  // Approve school submission
  approveSchool: async (schoolId) => {
    try {
      await simulateApiDelay();
      const response = await api.patch(`/schools/${schoolId}/approve`);
      return response.data;
    } catch (error) {
      console.warn('API approve school failed, using mock:', error.message);
      return { success: true, message: 'School approved successfully' };
    }
  },

  // Mark school as delivered
  deliverToSchool: async (schoolId, deliveryData) => {
    try {
      await simulateApiDelay();
      const response = await api.patch(`/schools/${schoolId}/deliver`, deliveryData);
      return response.data;
    } catch (error) {
      console.warn('API deliver to school failed, using mock:', error.message);
      return { success: true, message: 'Delivery recorded successfully' };
    }
  }
};

export const studentService = {
  // Search students with fuzzy matching
  searchStudents: async (query) => {
    try {
      await simulateApiDelay();
      const response = await api.get('/students/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.warn('API student search failed, using mock with Fuse.js:', error.message);
      
      const fuse = new Fuse(mockStudents, fuseOptions);
      const results = fuse.search(query);
      
      return results.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches
      }));
    }
  },

  // Get student by exact name and DOB
  getStudentByNameAndDOB: async (name, dob) => {
    try {
      await simulateApiDelay();
      const response = await api.get('/students/verify', { 
        params: { name, dob } 
      });
      return response.data;
    } catch (error) {
      console.warn('API student verification failed, using mock:', error.message);
      
      const student = mockStudents.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && 
        s.dob === dob
      );
      
      if (!student) {
        throw new Error('Student not found');
      }
      
      return student;
    }
  },

  // Collect books for student
  collectBooks: async (studentId, collectionData) => {
    try {
      await simulateApiDelay();
      const response = await api.post(`/students/${studentId}/collect`, collectionData);
      return response.data;
    } catch (error) {
      console.warn('API book collection failed, using mock:', error.message);
      
      const student = mockStudents.find(s => s.id === studentId);
      if (!student) {
        throw new Error('Student not found');
      }
      
      if (student.issued) {
        throw new Error('Books already issued to this student');
      }
      
      // Mock successful collection
      return {
        success: true,
        receipt: {
          id: `receipt_${Date.now()}`,
          studentName: student.name,
          books: 20,
          issuedAt: new Date().toISOString(),
          qrCode: `FREEBOOKS_${studentId}_${Date.now()}`
        }
      };
    }
  }
};

export const reportService = {
  // Get distribution reports
  getReports: async (filters = {}) => {
    try {
      await simulateApiDelay();
      const response = await api.get('/reports', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API get reports failed, using mock:', error.message);
      
      let filteredReports = [...mockReports];
      
      if (filters.schoolId) {
        filteredReports = filteredReports.filter(report => report.schoolId === filters.schoolId);
      }
      
      if (filters.startDate && filters.endDate) {
        filteredReports = filteredReports.filter(report => {
          const reportDate = new Date(report.issuedAt);
          return reportDate >= new Date(filters.startDate) && reportDate <= new Date(filters.endDate);
        });
      }
      
      return filteredReports;
    }
  },

  // Get inventory statistics
  getInventoryStats: async () => {
    try {
      await simulateApiDelay();
      const response = await api.get('/reports/inventory');
      return response.data;
    } catch (error) {
      console.warn('API get inventory stats failed, using mock:', error.message);
      return mockInventory;
    }
  },

  // Get activity logs
  getActivityLogs: async (limit = 10) => {
    try {
      await simulateApiDelay();
      const response = await api.get('/reports/activity', { params: { limit } });
      return response.data;
    } catch (error) {
      console.warn('API get activity logs failed, using mock:', error.message);
      return mockActivityLogs.slice(0, limit);
    }
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      await simulateApiDelay();
      const response = await api.get('/reports/dashboard');
      return response.data;
    } catch (error) {
      console.warn('API get dashboard stats failed, using mock:', error.message);
      
      const approvedSchools = mockSchools.filter(s => s.status === 'approved' || s.status === 'delivered').length;
      const totalStudents = mockSchools.reduce((sum, school) => sum + school.totalDeclared, 0);
      const flaggedStudents = mockStudents.filter(s => s.issued).length;
      
      return {
        schoolsApproved: approvedSchools,
        studentsServed: totalStudents,
        flaggedStudents
      };
    }
  }
};

export default api;