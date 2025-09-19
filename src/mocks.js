// Mock data for FreeBooks Sekondi application
// This file contains sample data to simulate API responses during development

export const mockSchools = [
  {
    id: '1',
    name: 'Sekondi Primary School',
    totalDeclared: 100,
    classes: [
      { className: 'Class 1', declaredCount: 20 },
      { className: 'Class 2', declaredCount: 25 },
      { className: 'Class 3', declaredCount: 30 },
      { className: 'Class 4', declaredCount: 25 }
    ],
    students: [
      { name: 'John Doe', dob: '2010-01-01', className: 'Class 1', issued: false },
      { name: 'Jane Smith', dob: '2010-02-02', className: 'Class 2', issued: false },
      { name: 'Michael Johnson', dob: '2009-12-15', className: 'Class 3', issued: false },
      { name: 'Sarah Wilson', dob: '2010-03-10', className: 'Class 4', issued: false }
    ],
    status: 'pending',
    deliveryProofs: [],
    createdAt: '2025-09-18',
    submittedBy: 'principal@sekondi-primary.edu.gh'
  },
  {
    id: '2',
    name: 'Takoradi Methodist School',
    totalDeclared: 150,
    classes: [
      { className: 'Class 1', declaredCount: 35 },
      { className: 'Class 2', declaredCount: 40 },
      { className: 'Class 3', declaredCount: 45 },
      { className: 'Class 4', declaredCount: 30 }
    ],
    students: [
      { name: 'Emmanuel Asante', dob: '2009-11-20', className: 'Class 1', issued: false },
      { name: 'Grace Mensah', dob: '2010-04-05', className: 'Class 2', issued: false },
      { name: 'Kwame Osei', dob: '2009-09-30', className: 'Class 3', issued: false }
    ],
    status: 'approved',
    deliveryProofs: ['delivery_proof_2.pdf'],
    createdAt: '2025-09-17',
    submittedBy: 'admin@takoradi-methodist.edu.gh'
  },
  {
    id: '3',
    name: 'Essikado Senior High School',
    totalDeclared: 200,
    classes: [
      { className: 'Form 1A', declaredCount: 50 },
      { className: 'Form 1B', declaredCount: 50 },
      { className: 'Form 2A', declaredCount: 50 },
      { className: 'Form 2B', declaredCount: 50 }
    ],
    students: [],
    status: 'delivered',
    deliveryProofs: ['delivery_proof_3.pdf', 'receipt_3.jpg'],
    createdAt: '2025-09-16',
    submittedBy: 'head@essikado-shs.edu.gh'
  }
];

export const mockStudents = [
  {
    id: '1',
    name: 'John Doe',
    dob: '2010-01-01',
    schoolId: '1',
    schoolName: 'Sekondi Primary School',
    className: 'Class 1',
    issued: false,
    eligibleForCollection: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    dob: '2010-02-02',
    schoolId: 'external',
    schoolName: 'External Student',
    className: 'N/A',
    issued: true,
    eligibleForCollection: false,
    claimantInfo: {
      voterId: '12345',
      claimedAt: '2025-09-18',
      claimedBy: 'Mary Smith (Mother)'
    }
  },
  {
    id: '3',
    name: 'Michael Johnson',
    dob: '2009-12-15',
    schoolId: '1',
    schoolName: 'Sekondi Primary School',
    className: 'Class 3',
    issued: false,
    eligibleForCollection: true
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    dob: '2010-03-10',
    schoolId: '1',
    schoolName: 'Sekondi Primary School',
    className: 'Class 4',
    issued: false,
    eligibleForCollection: true
  },
  {
    id: '5',
    name: 'Emmanuel Asante',
    dob: '2009-11-20',
    schoolId: '2',
    schoolName: 'Takoradi Methodist School',
    className: 'Class 1',
    issued: false,
    eligibleForCollection: true
  },
  {
    id: '6',
    name: 'Grace Mensah',
    dob: '2010-04-05',
    schoolId: '2',
    schoolName: 'Takoradi Methodist School',
    className: 'Class 2',
    issued: false,
    eligibleForCollection: true
  },
  {
    id: '7',
    name: 'Kwame Osei',
    dob: '2009-09-30',
    schoolId: '2',
    schoolName: 'Takoradi Methodist School',
    className: 'Class 3',
    issued: false,
    eligibleForCollection: true
  },
  {
    id: '8',
    name: 'Akosua Boateng',
    dob: '2010-06-12',
    schoolId: 'external',
    schoolName: 'External Student',
    className: 'N/A',
    issued: false,
    eligibleForCollection: true
  }
];

export const mockInventory = {
  totalBooks: 300000,
  distributed: 1500,
  remaining: 298500
};

export const mockReports = [
  {
    id: '1',
    studentId: '2',
    studentName: 'Jane Smith',
    schoolId: 'external',
    schoolName: 'External Student',
    books: 20,
    issuedAt: '2025-09-18',
    issuedBy: 'staff_user',
    type: 'external'
  },
  {
    id: '2',
    studentId: '5',
    studentName: 'Emmanuel Asante',
    schoolId: '2',
    schoolName: 'Takoradi Methodist School',
    books: 20,
    issuedAt: '2025-09-17',
    issuedBy: 'admin_user',
    type: 'school'
  },
  {
    id: '3',
    studentId: '6',
    studentName: 'Grace Mensah',
    schoolId: '2',
    schoolName: 'Takoradi Methodist School',
    books: 20,
    issuedAt: '2025-09-17',
    issuedBy: 'admin_user',
    type: 'school'
  }
];

export const mockUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    email: 'admin@freebooks.gov.gh'
  },
  {
    id: '2',
    username: 'school1',
    password: 'school123',
    role: 'school',
    name: 'Sekondi Primary School',
    email: 'principal@sekondi-primary.edu.gh'
  },
  {
    id: '3',
    username: 'staff1',
    password: 'staff123',
    role: 'staff',
    name: 'Distribution Staff',
    email: 'staff@freebooks.gov.gh'
  }
];

export const mockActivityLogs = [
  {
    id: '1',
    action: 'School Submission',
    description: 'Sekondi Primary School submitted student list (100 students)',
    timestamp: '2025-09-18 10:30:00',
    user: 'school1',
    type: 'submission'
  },
  {
    id: '2',
    action: 'Book Collection',
    description: 'Jane Smith collected 20 books (External)',
    timestamp: '2025-09-18 09:15:00',
    user: 'staff1',
    type: 'collection'
  },
  {
    id: '3',
    action: 'School Approval',
    description: 'Takoradi Methodist School approved for delivery (150 students)',
    timestamp: '2025-09-17 14:45:00',
    user: 'admin',
    type: 'approval'
  },
  {
    id: '4',
    action: 'Book Delivery',
    description: 'Delivered 3000 books to Takoradi Methodist School',
    timestamp: '2025-09-17 16:20:00',
    user: 'admin',
    type: 'delivery'
  },
  {
    id: '5',
    action: 'Book Collection',
    description: 'Emmanuel Asante collected 20 books',
    timestamp: '2025-09-17 11:10:00',
    user: 'staff1',
    type: 'collection'
  }
];

// Utility function to simulate API delay
export const simulateApiDelay = (ms = 2000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};