# 🚀 Quick Start Guide - Sampark Frontend

Get your frontend running in 3 minutes!

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

## Step 2: Configure Environment

The `.env` file is already created with:
```
VITE_API_URL=http://localhost:8000
```

If your backend runs on a different URL, update this file.

## Step 3: Start Development Server

```bash
npm run dev
```

Open your browser to: **http://localhost:5173**

## Step 4: Login

Use these demo credentials:
- **Admin**: `admin` / `admin123`
- **Staff**: `staff` / `staff123`

(Make sure your backend has these users seeded!)

## 🎉 That's it!

You should now see:
- A beautiful login page with gradient background
- After login: Dashboard with stats and recent surveys
- Navigation bar with theme toggle
- Responsive design that works on mobile

## 📱 What You Can Do

1. **Dashboard**: View overview and stats
2. **Surveys**: 
   - Create new surveys
   - View all surveys in a grid
   - Search and filter
   - Click to edit/view details
3. **Survey Details**:
   - Fill out 7 modules
   - Track progress
   - Auto-save
4. **Theme**: Toggle dark/light mode in navbar

## 🔧 Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🐛 Troubleshooting

**Problem**: "Cannot connect to API"
- ✅ Check backend is running on port 8000
- ✅ Check `.env` file has correct URL

**Problem**: "Port 5173 already in use"
```bash
npx kill-port 5173
npm run dev
```

**Problem**: "Module not found" errors
```bash
rm -rf node_modules
npm install
```

## 📚 Project Structure Overview

```
src/
├── components/     → Reusable UI (Navbar, Footer, Cards)
├── pages/          → Main screens (Login, Dashboard, Surveys)
├── services/       → API calls (auth, surveys)
├── context/        → Global state (Auth)
├── hooks/          → Custom hooks (useSurveys)
└── utils/          → Constants and helpers
```

## 🎨 Customization

Want to change colors? Edit `tailwind.config.js`:
```js
colors: {
  primary: '#3b82f6',    // Change this
  secondary: '#8b5cf6',  // And this
  accent: '#f59e0b',     // And this
}
```

## 🔗 API Requirements

Your backend should have these endpoints:
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/surveys`
- `POST /api/surveys`
- `PUT /api/surveys/:id`
- `GET /api/sync/status`

All are already implemented in your FastAPI backend! ✅

## 🎯 Next Steps

1. ✅ Customize the color scheme
2. ✅ Add your logo in Navbar.jsx
3. ✅ Customize survey form fields in SurveyDetail.jsx
4. ✅ Add more pages as needed
5. ✅ Deploy to production

## 💡 Tips

- Use `Ctrl+Shift+I` to open DevTools
- Check Console for errors
- Network tab shows API calls
- React DevTools extension is helpful

---

**Need Help?** Check `FRONTEND_README.md` for detailed documentation!
