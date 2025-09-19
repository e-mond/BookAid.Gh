# FreeBooks Sekondi

A comprehensive React application for managing the distribution of 300,000 free exercise books (20 per student) in Sekondi. The system supports multiple user roles and provides a complete workflow from school submission to parent collection.

## Features

### 🎯 Core Functionality
- **Multi-role Authentication**: Admin, School, and Staff roles with different permissions
- **School Submission**: Multi-step form for schools to submit student lists
- **Admin Approval**: Review and approve school submissions with delivery tracking
- **Parent Collection**: Staff-assisted book collection with eligibility verification
- **Inventory Management**: Real-time tracking of 300,000 books with atomic updates
- **Reports & Analytics**: Comprehensive reporting with charts and export functionality

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: ARIA attributes, keyboard navigation, and screen reader support
- **Loading States**: Skeleton loaders for all async operations
- **Error Handling**: User-friendly error messages with retry options
- **Real-time Validation**: Form validation with immediate feedback

### 🔧 Technical Features
- **State Management**: React Context API for auth and inventory
- **API Integration**: Axios with fallback to mock data for demo
- **File Uploads**: Drag-and-drop file uploads with progress tracking
- **Search**: Fuzzy search with Fuse.js for student lookup
- **Charts**: Interactive pie charts with Chart.js
- **Export**: PDF and CSV export functionality
- **QR Codes**: Receipt generation with QR codes for verification

## Technology Stack

- **Frontend**: React 18, JavaScript (ES6+)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Chart.js with react-chartjs-2
- **File Handling**: react-dropzone
- **Date Picker**: react-datepicker
- **Search**: Fuse.js for fuzzy search
- **QR Codes**: qrcode.react
- **PDF Generation**: jsPDF
- **CSV Export**: react-csv
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Loading**: react-loading-skeleton
- **Testing**: Jest + React Testing Library

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

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

## Usage

### Demo Credentials

The application includes demo credentials for testing:

- **School Administrator**: `school1` / `password123`
- **System Administrator**: `admin1` / `password123`
- **Collection Staff**: `staff1` / `password123`

### User Roles & Permissions

#### School Administrator
- Submit student lists for book distribution
- View submission status
- Access dashboard with school-specific statistics

#### System Administrator
- Review and approve school submissions
- Confirm book deliveries
- Access comprehensive reports
- Manage inventory

#### Collection Staff
- Help parents collect books
- Verify student eligibility
- Generate collection receipts with QR codes
- View collection reports

### Workflow

1. **School Submission**: Schools submit student lists through a multi-step form
2. **Admin Review**: Administrators review submissions and approve eligible schools
3. **Delivery**: Books are delivered to schools with proof documentation
4. **Parent Collection**: Staff assist parents in collecting books for their children
5. **Reporting**: Comprehensive reports track all distributions and collections

## Configuration

### Switching from Mock to Real API

The application is configured to use mock data by default. To connect to a real backend:

1. **Update API Base URL**
   ```javascript
   // In src/services/api.js
   const api = axios.create({
     baseURL: 'https://your-api-domain.com/api', // Change this
     // ... rest of config
   });
   ```

2. **Implement Backend Endpoints**
   The following endpoints should be implemented:
   - `POST /api/auth/login` - User authentication
   - `POST /api/schools/submit` - School submission
   - `GET /api/schools/pending` - Get pending schools
   - `POST /api/schools/{id}/approve` - Approve school
   - `POST /api/schools/{id}/deliver` - Confirm delivery
   - `GET /api/students/search` - Search students
   - `POST /api/students/collect` - Collect books
   - `POST /api/students/check-eligibility` - Check eligibility
   - `GET /api/inventory` - Get inventory status
   - `GET /api/reports` - Get distribution reports
   - `POST /api/upload` - File upload

3. **Authentication**
   - Implement JWT token-based authentication
   - Include `Authorization: Bearer <token>` header in requests
   - Handle token expiration and refresh

### Customization

#### Theme Colors
```javascript
// In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',    // Change primary color
        success: '#28A745',    // Change success color
        error: '#DC3545',      // Change error color
      }
    }
  }
}
```

#### Inventory Settings
```javascript
// In src/contexts/InventoryContext.js
const [inventory, setInventory] = useState({
  totalBooks: 300000,  // Change total book count
  distributed: 0,
  remaining: 300000
});
```

## Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

### Test Files
- `src/tests/Login.test.js` - Login component tests
- `src/tests/SchoolSubmission.test.js` - School submission tests
- `src/tests/ParentCollection.test.js` - Parent collection tests

## Building for Production

### Create Production Build
```bash
npm run build
```

### Serve Production Build
```bash
npx serve -s build
```

## Project Structure

```
freebooks-sekondi/
├── public/
│   └── index.html              # HTML template with Roboto font
├── src/
│   ├── components/             # React components
│   │   ├── Navbar.js          # Navigation component
│   │   ├── Login.js           # Login form
│   │   ├── Dashboard.js       # Dashboard with statistics
│   │   ├── SchoolSubmission.js # School submission form
│   │   ├── AdminApproval.js   # Admin approval interface
│   │   ├── ParentCollection.js # Parent collection interface
│   │   ├── Reports.js         # Reports and analytics
│   │   ├── AutocompleteSearch.js # Search component
│   │   ├── FileUpload.js      # File upload component
│   │   ├── PieChart.js        # Chart component
│   │   └── QRCodeGenerator.js # QR code component
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.js     # Authentication context
│   │   └── InventoryContext.js # Inventory management context
│   ├── services/              # API services
│   │   └── api.js            # Axios configuration and API calls
│   ├── tests/                # Test files
│   │   ├── Login.test.js
│   │   ├── SchoolSubmission.test.js
│   │   └── ParentCollection.test.js
│   ├── mocks.js              # Mock data for demo
│   ├── App.js                # Main app component with routing
│   ├── index.js              # App entry point
│   ├── index.css             # Global styles and Tailwind imports
│   └── tailwind.config.js    # Tailwind configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All the open-source libraries that made this project possible
- The Sekondi community for their support

---

**FreeBooks Sekondi** - Empowering Education Through Technology 📚✨