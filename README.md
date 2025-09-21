BookAid Gh.

A React frontend application for tracking the yearly distribution of 300,000 free exercise books, trunks, chop boxes, pencils, and pens in Ghana. The application provides role-based access for system administrators, staff, and school administrators to manage distribution, school submissions, and parental collections.
Features
System Administrator (Role: 'admin')

User Management: Create, suspend, deactivate, or remove users with different roles.
Distribution Records: Manage yearly records for books, pencils, pens (trunks and chop boxes displayed but inactive).
School Approvals: Review, approve, or reject school submissions.
Comprehensive Reports: View all distribution activities and generate reports.
Dashboard: Overview of total distributions, items, and system metrics.

Staff (Role: 'staff')

Delivery Entry: Record school deliveries (books, pencils, pens) with timestamps and quantities (trunks and chop boxes displayed but inactive).
Parent Collection: Process parental collections with student detail search, cross-checking allocation/collection status, and proof upload (image, receipt, or report card).
Activity Tracking: View delivery and collection activities.
Reports: Access distribution reports and statistics.

School Administrators (Role: 'school')

School Registration: Sign up schools with automatic password generation; new users appear in admin user management.
School Submission: Submit student lists with optional pencil/pen requests (2 per student, adjustable by level: lower primary, upper primary, JHS).
Submission History: View submission status and history.
Dashboard: Monitor school statistics and submissions.

Technology Stack

React 18 with JavaScript
React Router v6 for navigation
Tailwind CSS for styling
Context API for state management
Axios for API calls
Chart.js for data visualization
jsPDF with autoTable for PDF generation
React Dropzone for file uploads
React DatePicker for date selection
QRCode React for receipt generation
Fuse.js for search functionality
React Loading Skeleton for loading states

Installation

Clone the repository
git clone <repository-url>
cd bookaid-gh


Install dependencies
npm install


Start the development server
npm start


Open your browserNavigate to http://localhost:3000


Configuration
Mock Data vs Real API
The application uses mock data by default. To switch to a real API:

Open src/services/api.jsx
Change useMocks = false to use real API endpoints
Update the API_BASE_URL to point to your backend

Demo Credentials
Use these credentials to test different user roles:

Admin: admin1 / password
Staff: staff1 / password
School: school1 / password

Project Structure
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Textarea.jsx
│   │   ├── Table.jsx
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   └── SkeletonWrapper.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── UserManagement.jsx
│   ├── DistributionRecords.jsx
│   ├── SchoolSubmission.jsx
│   ├── AdminApproval.jsx
│   ├── DeliveryEntry.jsx
│   ├── ParentCollection.jsx
│   ├── Reports.jsx
│   ├── Details.jsx
│   └── Navbar.jsx
├── contexts/
│   ├── AuthContext.jsx   # Authentication state
│   └── InventoryContext.jsx # Inventory management
├── services/
│   └── api.jsx          # API service layer
├── utils/
│   ├── validateSchoolSubmission.jsx
│   ├── fuseSearch.jsx
│   └── parseCSV.jsx
├── mocks.jsx            # Mock data
├── tests/               # Test files
├── App.jsx
└── index.jsx

Key Features
Role-Based Access Control

Different dashboards and features based on user role
Protected routes with automatic redirection
Role-specific navigation menus

Responsive Design

Mobile-first approach with Tailwind CSS
Responsive breakpoints (sm:, md:, lg:)
Touch-friendly interface with large touch targets

Accessibility

ARIA attributes for screen readers
Keyboard navigation support
Focus management and focus traps
Semantic HTML structure

Data Management

CSV file upload and parsing for student lists
Image/receipt/report card upload for parent collection
PDF export with autoTable
Real-time student search with Fuse.js
Form validation with error handling

Loading States

Skeleton loaders for better UX
2-second delay simulation for demo purposes
Loading spinners for async operations

API Endpoints
The application expects the following API endpoints:
Authentication

POST /api/auth/login - User login
POST /api/auth/signup - School registration
POST /api/auth/change-password - Password change

Users

GET /api/users - Get users list
POST /api/users/create - Create user
DELETE /api/users/remove/:id - Remove user
PATCH /api/users/:id/suspend - Suspend/deactivate user

Inventory

GET /api/inventory - Get inventory data (books, pencils, pens)
POST /api/inventory/add-yearly - Add yearly distribution records

Schools

GET /api/schools - Get schools list
POST /api/schools/submit - Submit school data (including pencil/pen requests)
POST /api/schools/:id/approve - Approve school
POST /api/schools/:id/reject - Reject school
POST /api/schools/:id/deliver - Mark as delivered

Students

POST /api/students/search - Search student
POST /api/students/:id/collect - Collect items (books, pencils, pens)
POST /api/students/:id/upload-proof - Upload school proof

Deliveries

POST /api/deliveries/create - Create delivery record (books, pencils, pens)

Reports

GET /api/reports - Get distribution reports

Logs

GET /api/logs - Get activity logs

Testing
Run the test suite:
npm test

The application includes comprehensive tests for:

Login and authentication
School submission forms (including pencil/pen requests)
Parent collection process (with proof upload)
Dashboard functionality
User management (create, suspend, remove)

Building for Production
npm run build

This creates an optimized production build in the build folder.
Browser Support

Chrome (latest)
Firefox (latest)
Safari (latest)
Edge (latest)

Contributing

Fork the repository
Create a feature branch (feat/<description>)
Make your changes and add tests
Submit a pull request

License
This project is licensed under the MIT License.
Support
For support, contact the development team or create an issue in the repository.

BookAid Gh. - Ensuring transparency and accessibility in the distribution of books, trunks, chop boxes, pencils, and pens for schools and students in Ghana.
