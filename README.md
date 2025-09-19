# FreeBooks Sekondi

A comprehensive React application for tracking the distribution of 300,000 free exercise books to students in Sekondi. The system manages school submissions, admin approvals, parent collections, and generates detailed reports with role-based access control.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication**: Admin, School, and Staff roles with different permissions
- **School Submission System**: Multi-step form for schools to submit student lists
- **Admin Approval Workflow**: Review and approve school submissions with inventory tracking
- **Parent Collection**: Direct book collection for external students with QR receipt generation
- **Comprehensive Reporting**: Charts, exports, and analytics for distribution tracking

### Technical Features
- **React 18** with modern hooks and Context API
- **React Router v6** for client-side routing
- **Tailwind CSS** for responsive, accessible design
- **Real-time Inventory Management** with atomic updates
- **Fuzzy Search** powered by Fuse.js
- **File Upload** with drag-and-drop support
- **QR Code Generation** for collection receipts
- **Data Export** to CSV and PDF formats
- **Chart Visualization** with Chart.js
- **Skeleton Loading States** for better UX
- **Accessibility** with ARIA attributes and keyboard navigation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (version 16.0 or higher)
- **npm** (version 7.0 or higher)

## 🛠️ Installation

1. **Clone the repository** (or extract the files):
```bash
git clone <repository-url>
cd freebooks-sekondi
```

2. **Install dependencies**:
```bash
npm install
```

3. **Install Tailwind CSS** (if not already configured):
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm start
```
The application will open at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `build` folder.

### Running Tests
```bash
npm test
```
Runs the test suite in interactive watch mode.

## 🔐 Demo Credentials

The application includes mock authentication for demonstration purposes:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | admin | admin123 |
| **School** | school1 | school123 |
| **Staff** | staff1 | staff123 |

## 🎯 User Roles & Permissions

### Admin
- View dashboard with comprehensive statistics
- Approve/reject school submissions
- Mark deliveries as complete with proof upload
- Access all reports and analytics
- Manage inventory and view distribution data

### School
- Submit student lists with class breakdowns
- Upload CSV files or manually enter student data
- Track submission status
- View school-specific dashboard

### Staff
- Process parent collections
- Verify student eligibility
- Generate QR code receipts
- Access collection reports

## 📱 Application Structure

### Main Components

1. **Login** (`/login`)
   - Role-based authentication
   - Form validation and error handling
   - Demo credentials display

2. **Dashboard** (`/dashboard`)
   - Role-specific overview
   - Inventory statistics
   - Student search functionality
   - Recent activity logs

3. **School Submission** (`/submit`)
   - Multi-step form (School Info → Classes → Students)
   - CSV upload support
   - Real-time validation
   - Student count verification

4. **Admin Approval** (`/admin/approve`)
   - School submission review
   - Approval workflow with inventory deduction
   - Delivery confirmation with proof upload
   - Filterable table view

5. **Parent Collection** (`/collect`)
   - Student eligibility verification
   - Document upload requirements
   - QR code receipt generation
   - Inventory deduction on collection

6. **Reports** (`/reports`)
   - Distribution analytics
   - Interactive charts (pie charts for distribution breakdown)
   - Export functionality (CSV/PDF)
   - Date range and type filtering

### Utility Components

- **AutocompleteSearch**: Fuzzy search with Fuse.js
- **FileUpload**: Drag-and-drop file handling
- **PieChart**: Chart.js wrapper for data visualization
- **QRCodeGenerator**: QR code creation with download/print options

## 🔧 Configuration

### API Integration

The application is designed to work with a backend API but includes comprehensive mock data for demonstration. To switch from mock data to a real API:

1. **Update API base URL** in `src/services/api.js`:
```javascript
const api = axios.create({
  baseURL: 'https://your-api-domain.com/api', // Change from '/api'
  // ... other config
});
```

2. **Remove mock fallbacks** in API service functions by removing the `catch` blocks that use mock data.

### Expected API Endpoints

The application expects the following REST API endpoints:

```
POST /api/auth/login
POST /api/auth/logout
POST /api/schools/submit
GET  /api/schools/pending
GET  /api/schools
PATCH /api/schools/:id/approve
PATCH /api/schools/:id/deliver
GET  /api/students/search
GET  /api/students/verify
POST /api/students/:id/collect
GET  /api/reports
GET  /api/reports/inventory
GET  /api/reports/activity
GET  /api/reports/dashboard
```

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
REACT_APP_API_BASE_URL=http://localhost:3001/api
REACT_APP_ENVIRONMENT=development
```

## 🎨 Customization

### Styling
The application uses Tailwind CSS with custom colors defined in `tailwind.config.js`:
- Primary: #007BFF (Blue)
- Success: #28A745 (Green)
- Error: #DC3545 (Red)

### Fonts
Uses Google Fonts (Roboto) loaded via CDN in `public/index.html`.

### Inventory Settings
The total book inventory (300,000) and books per student (20) can be modified in:
- `src/contexts/InventoryContext.js` (total books)
- `src/mocks.js` (mock data)
- Various components that calculate book requirements

## 📊 Data Management

### State Management
- **AuthContext**: User authentication and role management
- **InventoryContext**: Book inventory tracking with atomic updates
- **Local Storage**: Persists auth tokens and inventory state

### Mock Data
Comprehensive mock data is provided in `src/mocks.js` including:
- Sample schools with student lists
- Student records with eligibility status
- Distribution reports and activity logs
- User accounts for different roles

## 🧪 Testing

The application includes Jest and React Testing Library tests for key components:

- **Login.test.js**: Authentication form testing
- **SchoolSubmission.test.js**: Multi-step form validation
- **ParentCollection.test.js**: Eligibility checking and collection flow

Run tests with:
```bash
npm test
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Server Configuration
For proper React Router support, configure your server to serve `index.html` for all routes.

## 🔍 Performance Optimizations

- **Lazy Loading**: Components are lazy-loaded using React.lazy()
- **Code Splitting**: Automatic code splitting by route
- **Memoization**: React.memo used for performance-critical components
- **Skeleton Loading**: Provides immediate feedback during data loading
- **Image Optimization**: Proper image handling in file uploads

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **npm install fails**
   - Ensure Node.js version 16+ is installed
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and `package-lock.json`, then reinstall

2. **Tailwind styles not loading**
   - Verify `tailwind.config.js` is properly configured
   - Check that `@tailwind` directives are in `src/index.css`
   - Restart the development server

3. **API calls failing**
   - Check browser console for CORS errors
   - Verify API endpoint URLs in `src/services/api.js`
   - Ensure backend server is running (if not using mocks)

4. **Charts not rendering**
   - Verify Chart.js is properly installed
   - Check for JavaScript errors in browser console
   - Ensure chart data format matches expected structure

### Getting Help

- Check the browser console for error messages
- Review the component documentation in code comments
- Verify all dependencies are properly installed
- Test with demo credentials first

## 📞 Support

For technical support or questions about the FreeBooks Sekondi system, please:
1. Check the troubleshooting section above
2. Review the code comments for component-specific guidance
3. Test with the provided mock data and demo credentials
4. Verify your development environment meets the prerequisites

---

**FreeBooks Sekondi** - Empowering Education Through Technology 📚✨