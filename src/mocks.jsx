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
  },
  {
    id: '3',
    name: 'Sekondi SHS',
    totalDeclared: 200,
    classes: [
      { className: 'SHS 1', declaredCount: 100 },
      { className: 'SHS 2', declaredCount: 100 }
    ],
    students: [],
    status: 'delivered',
    deliveryProofs: ['proof1.jpg', 'proof2.jpg'],
    createdAt: '2025-09-16',
    notes: 'Urgent delivery needed'
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
      proofUrls: ['voter_id.jpg']
    }
  },
  {
    id: '3',
    name: 'Mike Johnson',
    dob: '2009-05-15',
    schoolId: 'external',
    issued: false
  }
];

export const inventory = {
  totalBooks: 300000,
  distributed: 1000,
  remaining: 299000,
  yearlyRecords: [
    { year: 2025, booksAdded: 300000, budget: 500000 },
    { year: 2024, booksAdded: 280000, budget: 450000 },
    { year: 2023, booksAdded: 250000, budget: 400000 }
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
  },
  {
    id: 'ir3',
    studentId: '3',
    schoolId: 'external',
    books: 20,
    issuedAt: '2025-09-16',
    issuedBy: 'staff1'
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
  },
  {
    id: '4',
    username: 'school2',
    email: 'school2@example.com',
    role: 'school',
    schoolId: '2'
  }
];

export const logs = [
  {
    id: 'log1',
    role: 'admin',
    action: 'Created user',
    details: 'User school1 created with role school',
    timestamp: '2025-09-18T10:00:00Z',
    userId: '1'
  },
  {
    id: 'log2',
    role: 'school',
    action: 'Submitted list',
    details: 'Sekondi Primary submitted 100 students',
    timestamp: '2025-09-18T09:00:00Z',
    userId: '2'
  },
  {
    id: 'log3',
    role: 'staff',
    action: 'Delivered books',
    details: 'Sekondi JHS received 1000 books',
    timestamp: '2025-09-17T15:00:00Z',
    userId: '3'
  },
  {
    id: 'log4',
    role: 'staff',
    action: 'Parental collection',
    details: 'Jane Smith collected 20 books',
    timestamp: '2025-09-17T14:30:00Z',
    userId: '3'
  },
  {
    id: 'log5',
    role: 'admin',
    action: 'Approved school',
    details: 'Sekondi Primary approved for delivery',
    timestamp: '2025-09-17T10:00:00Z',
    userId: '1'
  }
];

export const deliveries = [
  {
    id: 'del1',
    schoolId: '2',
    schoolName: 'Sekondi JHS',
    booksDelivered: 1000,
    deliveredAt: '2025-09-17T15:00:00Z',
    deliveredBy: 'staff1'
  },
  {
    id: 'del2',
    schoolId: '3',
    schoolName: 'Sekondi SHS',
    booksDelivered: 4000,
    deliveredAt: '2025-09-16T14:00:00Z',
    deliveredBy: 'staff2'
  }
];

// Helper function to simulate API delay
export const delay = (ms = 2000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get user by credentials
export const getUserByCredentials = (username, password, role) => {
  const user = users.find(u => 
    u.username === username && 
    u.role === role
  );
  
  if (user) {
    return {
      ...user,
      token: `mock-token-${user.id}-${Date.now()}`
    };
  }
  return null;
};

// Helper function to filter logs by role
export const getLogsByRole = (role) => {
  if (role === 'admin') {
    return logs; // Admin sees all logs
  } else if (role === 'staff') {
    return logs.filter(log => 
      log.action === 'Delivered books' || 
      log.action === 'Parental collection'
    );
  } else if (role === 'school') {
    return logs.filter(log => 
      log.action === 'Submitted list' && 
      log.userId === users.find(u => u.role === 'school')?.id
    );
  }
  return [];
};

// Helper function to generate default password
export const generateDefaultPassword = () => {
  return 'FreeBooks2025!';
};

// Helper function to validate school submission
export const validateSchoolSubmission = (submission) => {
  const errors = [];
  
  if (!submission.schoolName || submission.schoolName.trim().length < 2) {
    errors.push('School name must be at least 2 characters');
  }
  
  if (!submission.classes || submission.classes.length === 0) {
    errors.push('At least one class must be added');
  }
  
  if (submission.classes) {
    const totalDeclared = submission.classes.reduce((sum, cls) => sum + (cls.declaredCount || 0), 0);
    if (totalDeclared === 0) {
      errors.push('Total declared students must be greater than 0');
    }
  }
  
  if (submission.notes && submission.notes.length > 500) {
    errors.push('Notes must be 500 characters or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};