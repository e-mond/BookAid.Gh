# BookAid Gh.

A React frontend application for tracking the yearly distribution of 300,000 free exercise books, trunks, chop boxes, pencils, and pens in Ghana. The application provides role-based access for system administrators, staff, and school administrators to manage distribution, school submissions, and parental collections.

## Features

### System Administrator (Role: 'admin')
- **User Management**: Create, suspend, deactivate, or remove users with different roles.
- **Distribution Records**: Manage yearly records for books, pencils, pens (trunks and chop boxes displayed but inactive).
- **School Approvals**: Review, approve, or reject school submissions.
- **Comprehensive Reports**: View all distribution activities and generate reports.
- **Dashboard**: Overview of total distributions, items, and system metrics.

### Staff (Role: 'staff')
- **Delivery Entry**: Record school deliveries (books, pencils, pens) with timestamps and quantities (trunks and chop boxes displayed but inactive).
- **Parent Collection**: Process parental collections with student detail search, cross-checking allocation/collection status, and proof upload (image, receipt, or report card).
- **Activity Tracking**: View delivery and collection activities.
- **Reports**: Access distribution reports and statistics.

### School Administrators (Role: 'school')
- **School Registration**: Sign up schools with automatic password generation; new users appear in admin user management.
- **School Submission**: Submit student lists with optional pencil/pen requests (2 per student, adjustable by level: lower primary, upper primary, JHS).
- **Submission History**: View submission status and history.
- **Dashboard**: Monitor school statistics and submissions.

---

## Technology Stack
- React 18 with JavaScript
- React Router v6 for navigation
- Tailwind CSS for styling
- Context API for state management
- Axios for API calls
- Chart.js for data visualization
- jsPDF with autoTable for PDF generation
- React Dropzone for file uploads
- React DatePicker for date selection
- QRCode React for receipt generation
- Fuse.js for search functionality
- React Loading Skeleton for loading states

---

## Installation
```bash
git clone <https://github.com/e-mond/BookAid.Gh
cd bookaid-gh
npm install
npm start
```
Then open your browser at [http://localhost:3000](http://localhost:3000).

---

## Configuration
### Mock Data vs Real API
The application uses mock data by default. To switch to a real API:
1. Open `src/services/api.jsx`
2. Change `useMocks = false` to use real API endpoints
3. Update the `API_BASE_URL` to point to your backend

---

## Demo Credentials
- **Admin**: `admin1 / password`
- **Staff**: `staff1 / password`
- **School**: `school1 / password`

---

## Project Structure
```
src/
├── components/
│   ├── common/           
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
│   ├── AuthContext.jsx   
│   └── InventoryContext.jsx
├── services/
│   └── api.jsx          
├── utils/
│   ├── validateSchoolSubmission.jsx
│   ├── fuseSearch.jsx
│   └── parseCSV.jsx
├── mocks.jsx            
├── tests/               
├── App.jsx
└── index.jsx
```

---

## Key Features
- Role-Based Access Control (different dashboards, protected routes, role-specific menus)
- Responsive Design (mobile-first, Tailwind breakpoints, touch-friendly)
- Accessibility (ARIA, keyboard navigation, semantic HTML)
- Data Management (CSV uploads, receipt uploads, PDF export, real-time search)
- Loading States (skeleton loaders, spinners)

---

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/change-password`

### Users
- `GET /api/users`
- `POST /api/users/create`
- `DELETE /api/users/remove/:id`
- `PATCH /api/users/:id/suspend`

### Inventory
- `GET /api/inventory`
- `POST /api/inventory/add-yearly`

### Schools
- `GET /api/schools`
- `POST /api/schools/submit`
- `POST /api/schools/:id/approve`
- `POST /api/schools/:id/reject`
- `POST /api/schools/:id/deliver`

### Students
- `POST /api/students/search`
- `POST /api/students/:id/collect`
- `POST /api/students/:id/upload-proof`

### Deliveries
- `POST /api/deliveries/create`

### Reports
- `GET /api/reports`

### Logs
- `GET /api/logs`

---

## Testing
Run the test suite:
```bash
npm test
```

Includes tests for:
- Authentication
- School submission forms
- Parent collection process
- Dashboard functionality
- User management

---

## Production Build
```bash
npm run build
```

---

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Contributing
1. Fork the repository
2. Create a feature branch (`feat/<description>`)
3. Commit changes and add tests
4. Submit a pull request

---

## License
This project is licensed under the MIT License.

---

## Support
For support, contact the development team or create an issue in the repository.

---

**BookAid Gh.** - Ensuring transparency and accessibility in the distribution of books, trunks, chop boxes, pencils, and pens for schools and students in Ghana.
