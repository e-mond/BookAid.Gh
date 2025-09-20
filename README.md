# FreeBooks Sekondi

A React frontend application for tracking the yearly distribution of 300,000 free exercise books in Sekondi. The application provides role-based access for system administrators, staff, and school administrators to manage book distribution, school submissions, and parental collections.

## Features

### System Administrator (Role: 'admin')
- **User Management**: Create and remove users with different roles
- **Book Records**: Add and manage yearly book records with budget tracking
- **School Approvals**: Review and approve school submissions
- **Comprehensive Reports**: View all distribution activities and generate reports
- **Dashboard**: Overview of total distributions, books, and system metrics

### Staff (Role: 'staff')
- **Delivery Entry**: Record school deliveries with timestamps and quantities
- **Parent Collection**: Process parental book collections with QR code receipts
- **Activity Tracking**: View delivery and collection activities
- **Reports**: Access distribution reports and statistics

### School Administrators (Role: 'school')
- **School Registration**: Sign up schools with automatic password generation
- **School Submission**: Submit student lists with optional notes (max 500 characters)
- **Submission History**: View submission status and history
- **Dashboard**: Monitor own school statistics and submissions

## Technology Stack

- **React 18** with JavaScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Context API** for state management
- **Axios** for API calls
- **Chart.js** for data visualization
- **jsPDF** with autoTable for PDF generation
- **React Dropzone** for file uploads
- **React DatePicker** for date selection
- **QRCode React** for receipt generation
- **Fuse.js** for search functionality
- **React Loading Skeleton** for loading states

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd freebooks-sekondi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## Configuration

### Mock Data vs Real API

The application uses mock data by default. To switch to a real API:

1. Open `src/services/api.jsx`
2. Change `useMocks = false` to use real API endpoints
3. Update the `API_BASE_URL` to point to your backend

### Demo Credentials

Use these credentials to test different user roles:

- **Admin**: `admin1` / `password`
- **Staff**: `staff1` / `password`
- **School**: `school1` / `password`

## Project Structure

```
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
│   ├── BookRecords.jsx
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
```

## Key Features

### Role-Based Access Control
- Different dashboards and features based on user role
- Protected routes with automatic redirection
- Role-specific navigation menus

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive breakpoints (`md:`, `lg:`)
- Touch-friendly interface

### Accessibility
- ARIA attributes for screen readers
- Keyboard navigation support
- Focus management and focus traps
- Semantic HTML structure

### Data Management
- CSV file upload and parsing
- PDF export with autoTable
- Real-time search with Fuse.js
- Form validation with error handling

### Loading States
- Skeleton loaders for better UX
- 2-second delay simulation for demo purposes
- Loading spinners for async operations

## API Endpoints

The application expects the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - School registration
- `POST /api/auth/change-password` - Password change

### Inventory
- `GET /api/inventory` - Get inventory data
- `POST /api/inventory/add-yearly` - Add yearly book records

### Schools
- `GET /api/schools` - Get schools list
- `POST /api/schools/submit` - Submit school data
- `POST /api/schools/:id/approve` - Approve school
- `POST /api/schools/:id/deliver` - Mark as delivered

### Students
- `POST /api/students/search` - Search student
- `POST /api/students/:id/collect` - Collect books

### Deliveries
- `POST /api/deliveries/create` - Create delivery record

### Reports
- `GET /api/reports` - Get distribution reports

### Users
- `GET /api/users` - Get users list
- `POST /api/users/create` - Create user
- `DELETE /api/users/remove/:id` - Remove user

### Logs
- `GET /api/logs` - Get activity logs

## Testing

Run the test suite:

```bash
npm test
```

The application includes comprehensive tests for:
- Login and authentication
- School submission forms
- Parent collection process
- Dashboard functionality
- User management

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**FreeBooks Sekondi** - Ensuring transparency and accessibility in book distribution for all schools and students in Sekondi.