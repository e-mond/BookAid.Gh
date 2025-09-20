// Mock data for FreeBooks Sekondi application
export const schools = [
  {
    id: '1',
    name: 'Sekondi Primary',
    totalDeclared: 100,
    classes: [
      { className: 'Class 5', declaredCount: 25 },
      { className: 'Class 6', declaredCount: 75 }
    ],
    students: [
      {
        name: 'John Doe',
        dob: '2010-01-01',
        className: 'Class 5',
        issued: false,
        issuedAt: null,
        issueRecordId: null
      },
      {
        name: 'Jane Smith',
        dob: '2010-02-02',
        className: 'Class 6',
        issued: true,
        issuedAt: '2025-09-18',
        issueRecordId: 'ir1'
      }
    ],
    status: 'pending',
    deliveryProofs: [],
    createdAt: '2025-09-18',
    notes: 'Special request for Class 5'
  },
  {
    id: '2',
    name: 'Sekondi JHS',
    totalDeclared: 50,
    classes: [
      { className: 'JHS 1', declaredCount: 50 }
    ],
    students: [],
    status: 'approved',
    deliveryProofs: [],
    createdAt: '2025-09-17',
    notes: null
  }
];

export const students = [
  {
    id: '1',
    name: 'John Doe',
    dob: '2010-01-01',
    schoolId: '1',
    issued: false
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: '2010-02-02',
    schoolId: 'external',
    issued: true,
    claimantInfo: {
      voterId: '12345',
      proofUrls: []
    }
  }
];

export const inventory = {
  totalBooks: 300000,
  distributed: 1000,
  yearlyRecords: [
    { year: 2025, booksAdded: 300000, budget: 500000 }
  ]
};

export const reports = [
  {
    id: 'ir1',
    studentId: '1',
    schoolId: '1',
    books: 20,
    issuedAt: '2025-09-18',
    issuedBy: 'staff1'
  },
  {
    id: 'ir2',
    studentId: '2',
    schoolId: 'external',
    books: 20,
    issuedAt: '2025-09-17',
    issuedBy: 'staff2'
  }
];

export const users = [
  {
    id: '1',
    username: 'admin1',
    email: 'admin@example.com',
    role: 'admin'
  },
  {
    id: '2',
    username: 'school1',
    email: 'school@example.com',
    role: 'school',
    schoolId: '1'
  },
  {
    id: '3',
    username: 'staff1',
    email: 'staff@example.com',
    role: 'staff'
  }
];

export const logs = [
  {
    id: 'log1',
    role: 'admin',
    action: 'Created user',
    details: 'User school1',
    timestamp: '2025-09-18T10:00:00Z',
    user: 'admin1'
  },
  {
    id: 'log2',
    role: 'school',
    action: 'Submitted list',
    details: 'Sekondi Primary, 100 students',
    timestamp: '2025-09-18T09:00:00Z',
    user: 'school1'
  },
  {
    id: 'log3',
    role: 'staff',
    action: 'Delivered books',
    details: 'Sekondi JHS, 1000 books',
    timestamp: '2025-09-17T15:00:00Z',
    user: 'staff1'
  },
  {
    id: 'log4',
    role: 'staff',
    action: 'Collected books',
    details: 'Jane Smith, 20 books',
    timestamp: '2025-09-17T14:00:00Z',
    user: 'staff1'
  }
];

export const deliveries = [
  {
    id: 'del1',
    schoolId: '1',
    schoolName: 'Sekondi Primary',
    booksDelivered: 1000,
    deliveredAt: '2025-09-18T10:00:00Z',
    deliveredBy: 'staff1'
  }
];

// Helper function to simulate API delay
export const delay = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get mock data with delay
export const getMockData = async (dataType, delayMs = 2000) => {
  await delay(delayMs);
  return dataType;
};