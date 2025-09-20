# FreeBooks Sekondi

A React frontend application for tracking the yearly distribution of 300,000 free exercise books (20 per student) in Sekondi. The application supports three user roles: System Admin, Staff, and School Administrators, with role-based access control and comprehensive features for managing book distribution.

## Features

### System Admin (Role: 'admin')
- **User Management**: Create and remove users with different roles
- **Book Records**: View and add yearly book distribution records
- **School Approval**: Review and approve school submissions
- **Recent Activities**: View all system activities with detailed logs
- **Dashboard**: Comprehensive overview with clickable cards for detailed views
- **Reports**: Export distribution data to PDF and CSV formats

### Staff (Role: 'staff')
- **Delivery Entry**: Record book deliveries to schools with timestamps
- **Parental Collection**: Process book collections for external students
- **QR Receipt Generation**: Generate QR codes for collection receipts
- **Recent Activities**: View delivery and collection activities only

### School Administrators (Role: 'school')
- **Student List Submission**: Submit student lists with optional notes
- **CSV Import**: Import student data from CSV files
- **Multi-step Form**: Guided submission process with validation
- **Recent Activities**: View submission history only

## Technology Stack

- **React 18** with JavaScript
- **React Router v6** for navigation
- **Tailwind CSS** for styling
- **Context API** for state management
- **Axios** for API calls
- **Chart.js** for data visualization
- **jsPDF** with autoTable for PDF generation
- **React DatePicker** for date selection
- **React Dropzone** for file uploads
- **Fuse.js** for search functionality
- **Headless UI** for accessible components
- **Heroicons** for icons

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

4. **Run tests**
   ```bash
   npm test
   ```

## Configuration

### Mock Data vs Real API
The application uses mock data by default. To switch to real API calls:

1. Open `src/services/api.jsx`
2. Change `useMocks = false` to use real API endpoints
3. Update the `baseURL` to point to your API server

### Customization
- **Colors**: Update `tailwind.config.js` for custom color schemes
- **Fonts**: Modify `public/index.html` to change the font family
- **Mock Data**: Edit `src/mocks.jsx` to customize sample data

## Project Structure

```
freebooks-sekondi/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Textarea.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── SkeletonWrapper.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── UserManagement.jsx
│   │   ├── BookRecords.jsx
│   │   ├── SchoolSubmission.jsx
│   │   ├── AdminApproval.jsx
│   │   ├── DeliveryEntry.jsx
│   │   ├── ParentCollection.jsx
│   │   ├── Reports.jsx
│   │   ├── Details.jsx
│   │   └── Navbar.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── InventoryContext.jsx
│   ├── services/
│   │   └── api.jsx
│   ├── utils/
│   │   ├── validateSchoolSubmission.jsx
│   │   ├── fuseSearch.jsx
│   │   └── parseCSV.jsx
│   ├── mocks.jsx
│   ├── App.jsx
│   ├── index.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── README.md
```

## Key Features

### Authentication & Authorization
- Role-based access control (Admin, Staff, School)
- Protected routes with automatic redirects
- JWT token-based authentication
- Password change functionality for schools

### Data Management
- Real-time inventory tracking
- Yearly book record management
- Student list submission with validation
- CSV import/export functionality

### User Experience
- Responsive design for all screen sizes
- Loading skeletons for better UX
- Toast notifications for user feedback
- Accessible components with ARIA attributes
- Keyboard navigation support

### Reporting & Analytics
- Interactive charts and graphs
- PDF and CSV export functionality
- Detailed distribution reports
- Role-based activity logs

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
- `GET /api/schools` - Get all schools
- `POST /api/schools/submit` - Submit school data
- `POST /api/schools/:id/approve` - Approve school

### Users
- `GET /api/users` - Get all users
- `POST /api/users/create` - Create user
- `DELETE /api/users/remove/:id` - Remove user

### Deliveries
- `POST /api/deliveries/create` - Create delivery record

### Students
- `POST /api/students/search` - Search student
- `POST /api/students/collect` - Collect books

### Reports & Logs
- `GET /api/reports` - Get distribution reports
- `GET /api/logs` - Get activity logs

## Testing

The application includes Jest tests for key components:

```bash
npm test
```

Test files are located in `src/tests/` and cover:
- Login functionality
- Signup process
- School submission validation
- Parent collection workflow
- Dashboard components
- User management

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting service

3. **Configure environment variables** for production API endpoints

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