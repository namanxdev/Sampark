# Sampark - Panchayat Survey Management Frontend

A beautiful, modern, production-quality React frontend for the Sampark Panchayat Survey Management System.

## 🎨 Features

- **Modern UI/UX**: Built with TailwindCSS v4 and DaisyUI for a stunning, gradient-based design
- **Responsive Design**: Mobile-first approach, works seamlessly on all devices
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Smooth Animations**: Framer Motion for delightful micro-interactions
- **Real-time Feedback**: Toast notifications for user actions
- **Offline-First**: Survey data management with conflict detection
- **Role-Based Access**: Different views for staff, admin, and block officers
- **Progressive Enhancement**: Modern features with graceful fallbacks

## 🛠️ Tech Stack

- **React 19** - Latest React with modern features
- **React Router v6** - Client-side routing
- **TailwindCSS v4** - Utility-first CSS framework
- **DaisyUI** - Beautiful component library
- **Framer Motion** - Animation library
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Vite** - Lightning-fast build tool

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Card.jsx
│   │   ├── StatCard.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Route-based screens
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Surveys.jsx
│   │   ├── SurveyDetail.jsx
│   │   ├── NewSurvey.jsx
│   │   └── NotFound.jsx
│   ├── services/           # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   └── surveyService.js
│   ├── context/            # React Context for state
│   │   └── AuthContext.jsx
│   ├── hooks/              # Custom React hooks
│   │   └── useSurveys.js
│   ├── utils/              # Helper functions
│   │   └── constants.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env                    # Environment variables
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🚀 Getting Started

### Prerequisites

- Node.js v20.19.0 or higher
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## 🎯 Key Features & Pages

### 🔐 Login Page
- Beautiful gradient background
- Form validation
- Demo credentials display
- Smooth animations
- Error handling with toast notifications

### 📊 Dashboard
- Welcome header with user info
- Statistics cards (Total Surveys, Completed, In Progress, Sync Status)
- Recent surveys list with progress indicators
- Quick actions panel
- Sync status overview
- Responsive grid layout

### 📝 Surveys Page
- Survey cards grid with hover effects
- Search by village name
- Filter by completion status
- Progress bars for each survey
- Batch sync functionality
- Create new survey button
- Edit/Delete actions (role-based)

### 📋 Survey Detail/Edit Page
- Module-based navigation (7 modules)
- Progress tracking
- Auto-save functionality
- Conflict detection
- Dynamic forms for each module
- Completion percentage calculation
- Modules:
  - Basic Information
  - Infrastructure
  - Sanitation
  - Connectivity
  - Land & Forest
  - Electricity
  - Waste Management

### ➕ New Survey Page
- Simple form to create surveys
- Panchayat auto-assignment
- Village name input
- Informational alerts
- Redirects to edit page after creation

## 🎨 Design System

### Color Palette
- **Primary**: `#3b82f6` (Blue) - Main actions, links
- **Secondary**: `#8b5cf6` (Purple) - Accents, gradients
- **Accent**: `#f59e0b` (Orange) - Highlights
- **Success**: Green - Completed items
- **Warning**: Yellow - In progress
- **Error**: Red - Errors, conflicts

### Typography
- System fonts with fallbacks
- Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- TailwindCSS spacing scale (0.25rem increments)
- Consistent padding and margins

### Components
All components use:
- Rounded corners (`rounded-lg`, `rounded-2xl`)
- Drop shadows (`shadow-lg`, `shadow-xl`)
- Hover effects (scale, translate, color changes)
- Smooth transitions (200-300ms)
- Gradient backgrounds where appropriate

## 🔒 Authentication

- JWT token-based authentication
- Token stored in localStorage
- Auto-redirect on 401 errors
- Protected routes with role checking
- Persistent login state

## 🌐 API Integration

All API calls go through:
1. **api.js** - Axios instance with interceptors
2. **authService.js** - Authentication endpoints
3. **surveyService.js** - Survey CRUD and sync endpoints

### API Endpoints Used
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `GET /api/surveys` - List surveys
- `GET /api/surveys/:id` - Get survey details
- `POST /api/surveys` - Create survey
- `PUT /api/surveys/:id` - Update survey
- `DELETE /api/surveys/:id` - Delete survey
- `POST /api/sync/batch` - Batch sync
- `GET /api/sync/status` - Sync status

## 🎭 Theme System

DaisyUI themes with custom colors:
- Light theme (default)
- Dark theme
- Theme persistence in localStorage
- Smooth theme transitions

Toggle theme using the sun/moon icon in navbar.

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🧩 Reusable Components

### Card
```jsx
<Card hover gradient className="...">
  {children}
</Card>
```

### StatCard
```jsx
<StatCard
  title="Total Surveys"
  value={150}
  icon={<FiFileText />}
  color="primary"
  trend={12}
/>
```

### LoadingSpinner
```jsx
<LoadingSpinner size="lg" fullScreen />
```

## 🔧 Customization

### Add New Survey Module
1. Add module to `SURVEY_MODULES` in `utils/constants.js`
2. Add fields to `getFieldsForModule` in `SurveyDetail.jsx`
3. Backend will automatically handle the JSONB field

### Change Theme Colors
Edit `tailwind.config.js`:
```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
      accent: '#your-color',
    },
  },
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173
```

### API Connection Issues
- Check `.env` file has correct `VITE_API_URL`
- Ensure backend is running on the specified URL
- Check browser console for CORS errors

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📦 Production Deployment

1. **Build**
   ```bash
   npm run build
   ```

2. **Deploy `dist` folder** to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Environment Variables**
   Set `VITE_API_URL` to your production API URL

## 🎯 Best Practices Followed

- ✅ Functional components with hooks
- ✅ Custom hooks for reusable logic
- ✅ Context API for global state
- ✅ Proper error handling
- ✅ Loading states everywhere
- ✅ Responsive design
- ✅ Accessible components
- ✅ Clean code structure
- ✅ Consistent naming conventions
- ✅ Performance optimizations

## 🤝 Contributing

When adding new features:
1. Follow the existing folder structure
2. Use functional components and hooks
3. Add proper error handling
4. Include loading states
5. Make it responsive
6. Add smooth animations
7. Use DaisyUI components
8. Follow the color scheme

## 📄 License

Built for Sampark - Panchayat Survey Management System

---

**Built with ❤️ using React, TailwindCSS, and modern web technologies**
