// Mock data for the FreeBooks Sekondi application
// This simulates API responses for demo purposes

// Mock schools data
export const mockSchools = [
  {
    id: '1',
    name: 'Sekondi Primary School',
    totalDeclared: 100,
    classes: [
      { className: 'Class 5', declaredCount: 25 },
      { className: 'Class 6', declaredCount: 30 },
      { className: 'Class 7', declaredCount: 25 },
      { className: 'Class 8', declaredCount: 20 }
    ],
    students: [
      { name: 'John Doe', dob: '2010-01-01', className: 'Class 5', issued: false },
      { name: 'Jane Smith', dob: '2010-02-02', className: 'Class 5', issued: false },
      { name: 'Michael Johnson', dob: '2009-03-03', className: 'Class 6', issued: false },
      { name: 'Sarah Williams', dob: '2009-04-04', className: 'Class 6', issued: false },
      { name: 'David Brown', dob: '2008-05-05', className: 'Class 7', issued: false },
      { name: 'Emily Davis', dob: '2008-06-06', className: 'Class 7', issued: false },
      { name: 'James Wilson', dob: '2007-07-07', className: 'Class 8', issued: false },
      { name: 'Lisa Anderson', dob: '2007-08-08', className: 'Class 8', issued: false }
    ],
    status: 'pending',
    deliveryProofs: [],
    createdAt: '2025-01-18T10:00:00Z',
    submittedBy: 'school_admin_1'
  },
  {
    id: '2',
    name: 'Sekondi Junior High',
    totalDeclared: 80,
    classes: [
      { className: 'Form 1', declaredCount: 40 },
      { className: 'Form 2', declaredCount: 40 }
    ],
    students: [
      { name: 'Robert Taylor', dob: '2006-09-09', className: 'Form 1', issued: false },
      { name: 'Jennifer Martinez', dob: '2006-10-10', className: 'Form 1', issued: false },
      { name: 'Christopher Garcia', dob: '2005-11-11', className: 'Form 2', issued: false },
      { name: 'Amanda Rodriguez', dob: '2005-12-12', className: 'Form 2', issued: false }
    ],
    status: 'approved',
    deliveryProofs: ['delivery_proof_2.pdf'],
    createdAt: '2025-01-17T14:30:00Z',
    submittedBy: 'school_admin_2'
  },
  {
    id: '3',
    name: 'Sekondi Senior High',
    totalDeclared: 120,
    classes: [
      { className: 'Form 3', declaredCount: 60 },
      { className: 'Form 4', declaredCount: 60 }
    ],
    students: [
      { name: 'Daniel Lee', dob: '2004-01-13', className: 'Form 3', issued: false },
      { name: 'Michelle White', dob: '2004-02-14', className: 'Form 3', issued: false },
      { name: 'Kevin Harris', dob: '2003-03-15', className: 'Form 4', issued: false },
      { name: 'Nicole Clark', dob: '2003-04-16', className: 'Form 4', issued: false }
    ],
    status: 'delivered',
    deliveryProofs: ['delivery_proof_3.pdf', 'delivery_receipt_3.pdf'],
    createdAt: '2025-01-16T09:15:00Z',
    submittedBy: 'school_admin_3'
  }
];

// Mock students data (including external students)
export const mockStudents = [
  // School students
  { id: '1', name: 'John Doe', dob: '2010-01-01', schoolId: '1', issued: false },
  { id: '2', name: 'Jane Smith', dob: '2010-02-02', schoolId: '1', issued: false },
  { id: '3', name: 'Michael Johnson', dob: '2009-03-03', schoolId: '1', issued: false },
  { id: '4', name: 'Sarah Williams', dob: '2009-04-04', schoolId: '1', issued: false },
  { id: '5', name: 'David Brown', dob: '2008-05-05', schoolId: '1', issued: false },
  { id: '6', name: 'Emily Davis', dob: '2008-06-06', schoolId: '1', issued: false },
  { id: '7', name: 'James Wilson', dob: '2007-07-07', schoolId: '1', issued: false },
  { id: '8', name: 'Lisa Anderson', dob: '2007-08-08', schoolId: '1', issued: false },
  
  // External students (not in school system)
  { id: '9', name: 'Robert Taylor', dob: '2006-09-09', schoolId: 'external', issued: true, claimantInfo: { voterId: '12345', collectedAt: '2025-01-15T10:00:00Z' } },
  { id: '10', name: 'Jennifer Martinez', dob: '2006-10-10', schoolId: 'external', issued: true, claimantInfo: { voterId: '67890', collectedAt: '2025-01-15T11:30:00Z' } },
  { id: '11', name: 'Christopher Garcia', dob: '2005-11-11', schoolId: 'external', issued: false },
  { id: '12', name: 'Amanda Rodriguez', dob: '2005-12-12', schoolId: 'external', issued: false },
  { id: '13', name: 'Daniel Lee', dob: '2004-01-13', schoolId: 'external', issued: false },
  { id: '14', name: 'Michelle White', dob: '2004-02-14', schoolId: 'external', issued: false },
  { id: '15', name: 'Kevin Harris', dob: '2003-03-15', schoolId: 'external', issued: false },
  { id: '16', name: 'Nicole Clark', dob: '2003-04-16', schoolId: 'external', issued: false }
];

// Mock inventory data
export const mockInventory = {
  totalBooks: 300000,
  distributed: 1000,
  remaining: 299000
};

// Mock reports data
export const mockReports = [
  {
    id: '1',
    studentId: '9',
    studentName: 'Robert Taylor',
    schoolId: 'external',
    schoolName: 'External Collection',
    books: 20,
    issuedAt: '2025-01-15T10:00:00Z',
    issuedBy: 'staff_1',
    type: 'external'
  },
  {
    id: '2',
    studentId: '10',
    studentName: 'Jennifer Martinez',
    schoolId: 'external',
    schoolName: 'External Collection',
    books: 20,
    issuedAt: '2025-01-15T11:30:00Z',
    issuedBy: 'staff_1',
    type: 'external'
  },
  {
    id: '3',
    studentId: '3',
    studentName: 'Michael Johnson',
    schoolId: '3',
    schoolName: 'Sekondi Senior High',
    books: 20,
    issuedAt: '2025-01-16T09:15:00Z',
    issuedBy: 'admin_1',
    type: 'school'
  },
  {
    id: '4',
    studentId: '4',
    studentName: 'Sarah Williams',
    schoolId: '3',
    schoolName: 'Sekondi Senior High',
    books: 20,
    issuedAt: '2025-01-16T09:15:00Z',
    issuedBy: 'admin_1',
    type: 'school'
  }
];

// Mock activity logs
export const mockActivityLogs = [
  {
    id: '1',
    action: 'School submission approved',
    details: 'Sekondi Senior High - 120 students approved',
    timestamp: '2025-01-16T09:15:00Z',
    user: 'admin_1',
    type: 'approval'
  },
  {
    id: '2',
    action: 'Books delivered',
    details: 'Sekondi Senior High - 2,400 books delivered',
    timestamp: '2025-01-16T10:30:00Z',
    user: 'admin_1',
    type: 'delivery'
  },
  {
    id: '3',
    action: 'External collection',
    details: 'Robert Taylor collected 20 books',
    timestamp: '2025-01-15T10:00:00Z',
    user: 'staff_1',
    type: 'collection'
  },
  {
    id: '4',
    action: 'External collection',
    details: 'Jennifer Martinez collected 20 books',
    timestamp: '2025-01-15T11:30:00Z',
    user: 'staff_1',
    type: 'collection'
  },
  {
    id: '5',
    action: 'School submission received',
    details: 'Sekondi Primary School - 100 students submitted',
    timestamp: '2025-01-18T10:00:00Z',
    user: 'school_admin_1',
    type: 'submission'
  }
];

// Mock statistics
export const mockStats = {
  schoolsApproved: 2,
  studentsCovered: 8,
  flaggedIssues: 0,
  totalDistributed: 1000,
  externalCollections: 2,
  schoolDistributions: 2
};

// Utility function to simulate API delay
export const simulateApiDelay = (ms = 2000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock API responses
export const mockApiResponses = {
  login: (username, password, role) => ({
    success: true,
    token: 'mock_token_' + Date.now(),
    user: {
      id: '1',
      username,
      role,
      name: username
    }
  }),

  getSchools: () => mockSchools,
  
  getStudents: () => mockStudents,
  
  getInventory: () => mockInventory,
  
  getReports: () => mockReports,
  
  getActivityLogs: () => mockActivityLogs,
  
  getStats: () => mockStats,
  
  searchStudents: (query) => {
    return mockStudents.filter(student => 
      student.name.toLowerCase().includes(query.toLowerCase()) ||
      student.dob.includes(query)
    );
  }
};