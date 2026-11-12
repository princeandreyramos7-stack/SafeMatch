# SafeMatch - Healthcare Management System

SafeMatch is a comprehensive healthcare management system designed for postpartum care facilities to manage mothers, newborns, screenings, assessments, and discharge processes with secure QR code verification.

## 🌟 Features

### Core Modules
- **Mother Management** - Register and track mothers with unique IDs
- **Newborn Management** - Complete newborn records with birth metrics
- **QR Code System** - Generate and verify QR codes for mothers and newborns
- **QR Verification** - Camera-based scanning with pairing validation
- **Newborn Screening** - Track hearing, vision, metabolic, and other screenings
- **Maternal Assessments** - Monitor vital signs, bleeding, pain, and recovery
- **Discharge Management** - Checklist-based discharge readiness tracking
- **Dashboard** - Real-time statistics and charts
- **Analytics & Reporting** - Advanced filtering and CSV export
- **Notifications** - Real-time alerts for critical events
- **Activity Logs** - Complete audit trail
- **User Management** - Role-based access control (Admin, Healthcare Personnel)

### Security Features
- Laravel Sanctum authentication
- Token-based API security
- Role-based access control (RBAC)
- SHA-256 hashed QR tokens
- Activity logging for audit trails
- Soft deletes with relationship protection

## 🚀 Quick Start

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SafeMatch
```

2. **Backend Setup**
```bash
cd safematch-backend
composer install
cp .env.example .env
php artisan key:generate
```

3. **Configure Database**
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=safematch
DB_USERNAME=root
DB_PASSWORD=your_password
```

4. **Run Migrations and Seeders**
```bash
php artisan migrate:fresh --seed
php artisan storage:link
```

5. **Frontend Setup**
```bash
cd ../safematch-frontend
npm install
cp .env.example .env
```

Edit `safematch-frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

6. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd safematch-backend
php artisan serve
```

Terminal 2 (Frontend):
```bash
cd safematch-frontend
npm run dev
```

7. **Access the Application**
- Frontend: http://localhost:5174
- Backend API: http://127.0.0.1:8000/api

### Default Login Credentials
```
Admin:
Email: admin@safematch.com
Password: password

Midwife:
Email: midwifery@safematch.com
Password: password

Nurse:
Email: nurse@safematch.com
Password: password
```

## 📚 Documentation

### Project Structure

```
SafeMatch/
├── safematch-backend/          # Laravel API Backend
│   ├── app/
│   │   ├── Http/Controllers/Api/   # API Controllers
│   │   ├── Models/                 # Eloquent Models
│   │   └── Middleware/             # Custom Middleware
│   ├── database/
│   │   ├── migrations/             # Database Migrations
│   │   └── seeders/                # Database Seeders
│   └── routes/api.php              # API Routes
│
├── safematch-frontend/         # React Frontend
│   ├── src/
│   │   ├── components/             # Reusable Components
│   │   ├── contexts/               # React Contexts
│   │   ├── pages/                  # Page Components
│   │   └── lib/                    # Utilities & Config
│   └── package.json
│
├── README.md                   # This file
├── SETUP.md                    # Detailed setup guide
└── API_DOCUMENTATION.md        # API reference
```

### Database Schema

The system uses 14 main tables:
- `users` - System users with role-based access
- `mothers` - Mother registration records
- `newborns` - Newborn registration records
- `qr_codes` - QR code generation records
- `qr_verifications` - QR verification history
- `newborn_screening_types` - Screening type templates
- `newborn_screenings` - Screening records
- `maternal_assessment_types` - Assessment type templates
- `maternal_assessments` - Assessment records
- `discharge_requirements` - Discharge requirement templates
- `discharge_records` - Discharge requirement completion
- `discharge_decisions` - Discharge approval decisions
- `notifications` - User notifications
- `activity_log` - System audit trail

## 🔧 Development

### Technology Stack

**Backend:**
- Laravel 11.x
- PHP 8.2+
- MySQL 8.0+
- Laravel Sanctum (API Authentication)
- SimpleSoftwareIO/QrCode (QR Generation)
- Spatie Laravel Activity Log

**Frontend:**
- React 18+
- TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios
- Recharts (Data Visualization)
- html5-qrcode (Camera Scanning)
- Lucide React (Icons)

### API Endpoints

Base URL: `http://127.0.0.1:8000/api`

#### Authentication
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /user` - Get authenticated user

#### Mothers
- `GET /mothers` - List all mothers
- `POST /mothers` - Create mother
- `GET /mothers/{id}` - Get mother details
- `PUT /mothers/{id}` - Update mother
- `DELETE /mothers/{id}` - Delete mother
- `GET /mothers/statistics` - Get statistics

#### Newborns
- `GET /newborns` - List all newborns
- `POST /newborns` - Create newborn
- `GET /newborns/{id}` - Get newborn details
- `PUT /newborns/{id}` - Update newborn
- `DELETE /newborns/{id}` - Delete newborn
- `GET /newborns/statistics` - Get statistics

#### QR Codes
- `POST /qr-codes/generate` - Generate QR code
- `GET /qr-codes/{id}/download` - Download QR image
- `GET /qr-codes/{id}/image` - View QR image
- `POST /qr-codes/revoke` - Revoke QR code

#### QR Verification
- `POST /qr-verification/verify-single` - Verify single QR
- `POST /qr-verification/verify-pairing` - Verify mother-newborn pair
- `GET /qr-verification/history` - Verification history
- `GET /qr-verification/statistics` - Verification stats

#### Analytics
- `GET /analytics/overview` - Overview statistics
- `GET /analytics/registration-trends` - Registration trends
- `GET /analytics/screening-analytics` - Screening analytics
- `GET /analytics/assessment-analytics` - Assessment analytics
- `GET /analytics/export-csv` - Export data to CSV

#### Notifications
- `GET /notifications` - List notifications
- `GET /notifications/unread-count` - Unread count
- `POST /notifications/{id}/mark-read` - Mark as read
- `POST /notifications/mark-all-read` - Mark all as read
- `DELETE /notifications/{id}` - Delete notification

See `API_DOCUMENTATION.md` for complete API reference.

## 🧪 Testing

### Run Seeders
```bash
cd safematch-backend
php artisan migrate:fresh --seed
```

This will create:
- 4 users (admin, midwife, nurse, doctor)
- 5 mothers with Filipino names
- 6 newborns (including twins)
- 11 QR codes (SVG format)
- 6 screening types
- 24 sample screenings
- 8 assessment types
- 139 sample assessments
- 20 discharge requirements

### Test QR Verification
1. Login with any user
2. Navigate to QR Verification page
3. Click "Generate QR Code" for any mother/newborn
4. Download the QR code
5. Use camera scanner or manual token entry to verify

## 🔐 Security Considerations

- All API endpoints require authentication except `/login`
- User management routes require administrator role
- QR tokens are SHA-256 hashed
- Activity logging tracks all CRUD operations
- Soft deletes prevent accidental data loss
- CORS configured for localhost development

## 📊 System Requirements

### Minimum Requirements
- 2 CPU cores
- 4GB RAM
- 10GB disk space
- Internet connection for dependencies

### Recommended
- 4+ CPU cores
- 8GB+ RAM
- 20GB+ disk space
- SSD storage

## 🤝 Contributing

This is an academic capstone project. For questions or issues, please contact the development team.

## 📄 License

This project is developed for academic purposes.

## 👥 Development Team

SafeMatch Healthcare Management System
Capstone Project 2026

## 📞 Support

For technical support or questions:
- Check `SETUP.md` for detailed setup instructions
- Review `API_DOCUMENTATION.md` for API details
- Check the Activity Logs page for system audit trail

## 🎯 Roadmap

Completed Features (v1.0):
- ✅ Complete authentication system
- ✅ Mother and newborn management
- ✅ QR code generation and verification
- ✅ Screening and assessment tracking
- ✅ Discharge management
- ✅ Real-time dashboard
- ✅ Analytics and reporting
- ✅ Notifications system
- ✅ Activity logging

## 🔄 Version History

### v1.0.0 (November 2026)
- Initial release
- Complete healthcare management system
- All 16 core features implemented
- 14 database tables
- 100+ API endpoints
- Comprehensive demo data seeders

---

Built with ❤️ for better healthcare management
