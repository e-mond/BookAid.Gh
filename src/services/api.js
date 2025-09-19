import axios from 'axios';
import { 
  mockApiResponses, 
  simulateApiDelay, 
  mockSchools, 
  mockStudents, 
  mockInventory, 
  mockReports, 
  mockActivityLogs, 
  mockStats 
} from '../mocks';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
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

// Response interceptor to handle errors
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

// API service functions with fallback to mocks
export const apiService = {
  // Authentication
  async login(username, password, role) {
    try {
      const response = await api.post('/auth/login', { username, password, role });
      return response.data;
    } catch (error) {
      console.warn('API login failed, using mock data:', error.message);
      await simulateApiDelay(1000);
      return mockApiResponses.login(username, password, role);
    }
  },

  // School management
  async submitSchool(schoolData) {
    try {
      const response = await api.post('/schools/submit', schoolData);
      return response.data;
    } catch (error) {
      console.warn('API submit school failed, using mock data:', error.message);
      await simulateApiDelay(2000);
      return {
        success: true,
        schoolId: 'mock_' + Date.now(),
        message: 'School submission received successfully'
      };
    }
  },

  async getPendingSchools() {
    try {
      const response = await api.get('/schools/pending');
      return response.data;
    } catch (error) {
      console.warn('API get pending schools failed, using mock data:', error.message);
      await simulateApiDelay(2000);
      return mockSchools.filter(school => school.status === 'pending');
    }
  },

  async getAllSchools() {
    try {
      const response = await api.get('/schools');
      return response.data;
    } catch (error) {
      console.warn('API get all schools failed, using mock data:', error.message);
      await simulateApiDelay(2000);
      return mockSchools;
    }
  },

  async approveSchool(schoolId) {
    try {
      const response = await api.post(`/schools/${schoolId}/approve`);
      return response.data;
    } catch (error) {
      console.warn('API approve school failed, using mock data:', error.message);
      await simulateApiDelay(1500);
      return {
        success: true,
        message: 'School approved successfully'
      };
    }
  },

  async deliverSchool(schoolId, deliveryProof) {
    try {
      const formData = new FormData();
      formData.append('deliveryProof', deliveryProof);
      
      const response = await api.post(`/schools/${schoolId}/deliver`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn('API deliver school failed, using mock data:', error.message);
      await simulateApiDelay(1500);
      return {
        success: true,
        message: 'Delivery confirmed successfully'
      };
    }
  },

  // Student management
  async searchStudents(query) {
    try {
      const response = await api.get('/students/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.warn('API search students failed, using mock data:', error.message);
      await simulateApiDelay(1000);
      return mockApiResponses.searchStudents(query);
    }
  },

  async collectBooks(studentData) {
    try {
      const response = await api.post('/students/collect', studentData);
      return response.data;
    } catch (error) {
      console.warn('API collect books failed, using mock data:', error.message);
      await simulateApiDelay(1500);
      return {
        success: true,
        collectionId: 'mock_collection_' + Date.now(),
        message: 'Books collected successfully'
      };
    }
  },

  async checkEligibility(studentName, dob, voterId) {
    try {
      const response = await api.post('/students/check-eligibility', {
        name: studentName,
        dob,
        voterId
      });
      return response.data;
    } catch (error) {
      console.warn('API check eligibility failed, using mock data:', error.message);
      await simulateApiDelay(1000);
      
      // Mock eligibility check
      const student = mockStudents.find(s => 
        s.name.toLowerCase() === studentName.toLowerCase() && 
        s.dob === dob && 
        !s.issued
      );
      
      return {
        eligible: !!student,
        student: student || null,
        message: student ? 'Student is eligible for book collection' : 'Student not found or already collected books'
      };
    }
  },

  // Inventory management
  async getInventory() {
    try {
      const response = await api.get('/inventory');
      return response.data;
    } catch (error) {
      console.warn('API get inventory failed, using mock data:', error.message);
      await simulateApiDelay(1000);
      return mockInventory;
    }
  },

  async updateInventory(booksToDistribute) {
    try {
      const response = await api.post('/inventory/update', { booksToDistribute });
      return response.data;
    } catch (error) {
      console.warn('API update inventory failed, using mock data:', error.message);
      await simulateApiDelay(1000);
      return {
        success: true,
        message: 'Inventory updated successfully'
      };
    }
  },

  // Reports
  async getReports(filters = {}) {
    try {
      const response = await api.get('/reports', { params: filters });
      return response.data;
    } catch (error) {
      console.warn('API get reports failed, using mock data:', error.message);
      await simulateApiDelay(2000);
      return mockReports;
    }
  },

  async getActivityLogs() {
    try {
      const response = await api.get('/activity-logs');
      return response.data;
    } catch (error) {
      console.warn('API get activity logs failed, using mock data:', error.message);
      await simulateApiDelay(1500);
      return mockActivityLogs;
    }
  },

  async getStats() {
    try {
      const response = await api.get('/stats');
      return response.data;
    } catch (error) {
      console.warn('API get stats failed, using mock data:', error.message);
      await simulateApiDelay(1000);
      return mockStats;
    }
  },

  // File upload
  async uploadFile(file, type) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.warn('API upload file failed, using mock data:', error.message);
      await simulateApiDelay(2000);
      return {
        success: true,
        fileUrl: 'mock_file_url_' + Date.now(),
        fileName: file.name
      };
    }
  }
};

export default api;