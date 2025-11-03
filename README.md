# SAR Educational Complex - School Management System

A comprehensive school management system for SAR Educational Complex, featuring web and mobile applications for administrators, teachers, students, and parents.

## 🏫 About

SAR Educational Complex is located at Sepe Dote near Hospital Junction, Asokore Mampong District, Kumasi, Ghana. This system digitalizes all school operations including admissions, attendance, grading, communication, and finance.

## 🚀 Features

- **Role-Based Access**: Admin, Teacher, Student, and Parent portals
- **Attendance Management**: Digital attendance tracking
- **Grade Management**: Assessment recording and report card generation
- **Payment Processing**: Integration with Paystack, MTN Mobile Money, and Hubtel
- **Communication**: Announcements, messaging, and notifications
- **Reports & Analytics**: Performance charts and PDF report cards
- **Multi-Platform**: Web app and mobile apps (Android & iOS)

## 📁 Project Structure

```
sar-school-management/
├── apps/
│   ├── web/              # React web application
│   └── mobile/           # React Native mobile app
├── packages/
│   └── shared/           # Shared types and utilities
├── supabase/             # Database migrations and config
└── .kiro/specs/          # Project specifications
```

## 🛠️ Technology Stack

- **Frontend (Web)**: React 18, TypeScript, Tailwind CSS, Vite
- **Mobile**: React Native, Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Query
- **UI Components**: React Native Paper (mobile)
- **Charts**: Recharts (web), React Native Chart Kit (mobile)
- **PDF Generation**: jsPDF

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Expo CLI (for mobile development)

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sar-school-management
```

2. **Install dependencies**
```bash
npm run install:all
```

3. **Set up Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Create `.env` files from examples:

```bash
# Web app
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your Supabase credentials

# Mobile app
cp apps/mobile/.env.example apps/mobile/.env
# Edit apps/mobile/.env with your Supabase credentials
```

4. **Run database migrations**
   - Follow instructions in `supabase/README.md`
   - Apply migrations using Supabase CLI or Dashboard

## 🚀 Development

### Web App
```bash
npm run web
```
Open http://localhost:5173

### Mobile App
```bash
npm run mobile
```
Scan QR code with Expo Go app

## 📱 Mobile App Deployment

### Android
```bash
cd apps/mobile
npx expo build:android
```

### iOS
```bash
cd apps/mobile
npx expo build:ios
```

## 🌐 Web Deployment

### Deploy to Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📚 Documentation

- [Requirements](.kiro/specs/sar-school-management-system/requirements.md)
- [Design](.kiro/specs/sar-school-management-system/design.md)
- [Implementation Tasks](.kiro/specs/sar-school-management-system/tasks.md)
- [Supabase Setup](supabase/README.md)

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication
- Role-based access control
- Secure file storage with access policies

## 🎨 Branding

The system supports Ghana's educational structure:
- Creche
- Nursery
- KG (Kindergarten)
- Primary
- JHS (Junior High School)

## 📄 License

Private - SAR Educational Complex

## 👥 Support

For support, contact SAR Educational Complex administration.


## 🚀 Quick Deploy

### Deploy to Vercel in 8 Minutes

See **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** for step-by-step instructions.

**Quick Commands:**
```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/sar-school-management.git
git branch -M main
git push -u origin main

# Then deploy on Vercel (https://vercel.com)
```

### Deployment Guides
- 📘 **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Simplest guide (8 minutes)
- 📗 **[QUICK_DEPLOY_COMMANDS.md](./QUICK_DEPLOY_COMMANDS.md)** - Just the commands
- 📕 **[DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md)** - Detailed guide
- ✅ **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step checklist

## 🔧 Database Setup

After deploying, run the database setup:

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the code from **[START_HERE.md](./START_HERE.md)**
3. Click Run
4. Done! Registration and login will work

## 🌐 Live Demo

After deployment, your app will be live at:
- **Production:** `https://your-project-name.vercel.app`
- **GitHub:** `https://github.com/YOUR-USERNAME/sar-school-management`

## 📱 Mobile App

The mobile app is built with React Native and Expo. See `apps/mobile/` for details.

## 🤝 Contributing

This is a private project for SAR Educational Complex. For questions or support, contact the development team.

## 📄 License

Proprietary - All rights reserved by SAR Educational Complex

---

**Built with ❤️ for SAR Educational Complex, Kumasi, Ghana**
