# SafeMatch Setup Guide

Complete setup and installation guide for SafeMatch Healthcare Management System.

## 📋 Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Deployment](#deployment)

---

## System Requirements

### Minimum Requirements
- **PHP:** 8.2 or higher
- **Composer:** 2.x
- **Node.js:** 18.x or higher
- **npm:** 9.x or higher
- **MySQL:** 8.0 or higher
- **Git:** 2.x
- **RAM:** 4GB minimum
- **Disk Space:** 10GB minimum

### Recommended
- PHP 8.3
- 8GB RAM
- SSD storage
- Dedicated database server

### PHP Extensions Required
```bash
php -m | grep -E 'pdo|pdo_mysql|mbstring|tokenizer|xml|ctype|json|bcmath|fileinfo|gd'
```

Required extensions:
- PDO
- pdo_mysql
- mbstring
- tokenizer
- XML
- ctype
- JSON
- BCMath
- fileinfo
- GD or Imagick (for QR codes)

---

## Installation Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url> SafeMatch
cd SafeMatch
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd safematch-backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../safematch-frontend

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env
```

---

## Configuration

### Backend Configuration (.env)

Edit `safematch-backend/.env`:

```env
APP_NAME=SafeMatch
APP_ENV=local
APP_KEY=base64:generated_key
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=safematch
DB_USERNAME=root
DB_PASSWORD=your_password

# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:5174,localhost:5173,localhost,127.0.0.1

# CORS Configuration
FRONTEND_URL=http://localhost:5174

# Session Configuration
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Cache & Queue
CACHE_DRIVER=file
QUEUE_CONNECTION=sync
```

### Frontend Configuration (.env)

Edit `safematch-frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

---

## Database Setup

### Step 1: Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE safematch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional)
CREATE USER 'safematch_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON safematch.* TO 'safematch_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### Step 2: Run Migrations

```bash
cd safematch-backend

# Run all migrations
php artisan migrate

# Or fresh migration (drops all tables first)
php artisan migrate:fresh
```

### Step 3: Seed Database

```bash
# Seed with demo data
php artisan db:seed

# Or combine fresh migration and seeding
php artisan migrate:fresh --seed
```

This creates:
- **4 Users:** Admin, Midwife, Nurse, Doctor
- **5 Mothers:** With realistic Filipino names
- **6 Newborns:** Including a set of twins
- **11 QR Codes:** For all mothers and newborns
- **6 Screening Types:** Hearing, Vision, Metabolic, etc.
- **24 Screenings:** Sample screening records
- **8 Assessment Types:** Vital signs, Bleeding, Pain, etc.
- **139 Assessments:** Sample assessment records
- **20 Discharge Requirements:** Maternal and newborn requirements

### Step 4: Create Storage Link

```bash
# Create symbolic link for storage
php artisan storage:link
```

This links `storage/app/public` to `public/storage` for serving QR code images.

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd safematch-backend
php artisan serve
```
Backend will run on: `http://127.0.0.1:8000`

**Terminal 2 - Frontend:**
```bash
cd safematch-frontend
npm run dev
```
Frontend will run on: `http://localhost:5174`

### Access the Application

1. Open browser: `http://localhost:5174`
2. Login with demo credentials:
   ```
   Email: admin@safematch.com
   Password: password
   ```

---

## Testing

### Backend Testing

```bash
cd safematch-backend

# Run all tests (if configured)
php artisan test

# Check routes
php artisan route:list

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### Frontend Testing

```bash
cd safematch-frontend

# Run build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Manual Testing Checklist

#### Authentication
- [ ] Login with admin credentials
- [ ] Login with healthcare personnel credentials
- [ ] Logout functionality
- [ ] Invalid credentials handling

#### Mother Management
- [ ] Create new mother
- [ ] View mother list
- [ ] Search mothers
- [ ] Edit mother details
- [ ] View mother details modal

#### Newborn Management
- [ ] Create new newborn
- [ ] Link to mother
- [ ] View newborn list
- [ ] Edit newborn details
- [ ] View newborn details modal

#### QR Code System
- [ ] Generate QR code for mother
- [ ] Generate QR code for newborn
- [ ] Download QR code (SVG)
- [ ] View QR code in modal

#### QR Verification
- [ ] Verify single QR code
- [ ] Verify mother-newborn pairing
- [ ] Camera scanning (requires HTTPS or localhost)
- [ ] Manual token entry
- [ ] View verification history

#### Screenings
- [ ] Create screening record
- [ ] Manage screening types
- [ ] View screening statistics
- [ ] Filter screenings by status

#### Maternal Assessments
- [ ] Create assessment
- [ ] Manage assessment types
- [ ] View assessment statistics
- [ ] Filter by status

#### Discharge Management
- [ ] View discharge readiness
- [ ] Toggle requirement completion
- [ ] Create discharge decision
- [ ] Manage discharge requirements

#### Dashboard
- [ ] View statistics cards
- [ ] View charts (registration trends, verification, etc.)
- [ ] View recent activities
- [ ] View system alerts

#### Analytics
- [ ] Filter by date range
- [ ] View analytics charts
- [ ] Export CSV (overview, mothers, newborns, etc.)

#### Notifications
- [ ] View notifications
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] View unread count

#### Activity Logs
- [ ] View activity history
- [ ] Search activities
- [ ] Filter by user

#### User Management (Admin Only)
- [ ] Create user
- [ ] Edit user
- [ ] Toggle user status
- [ ] View user list

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Error:** `SQLSTATE[HY000] [2002] Connection refused`

**Solution:**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Start MySQL
sudo systemctl start mysql

# Verify database credentials in .env
```

#### 2. Storage Link Not Working

**Error:** QR codes not displaying

**Solution:**
```bash
cd safematch-backend
php artisan storage:link

# Check if symbolic link exists
ls -la public/storage
```

#### 3. CORS Error

**Error:** CORS policy blocked

**Solution:**
Edit `safematch-backend/.env`:
```env
SANCTUM_STATEFUL_DOMAINS=localhost:5174,localhost:5173
```

Clear config cache:
```bash
php artisan config:clear
```

#### 4. Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# For backend (port 8000)
php artisan serve --port=8001

# For frontend (port 5174)
npm run dev -- --port 5175
```

#### 5. Node Modules Error

**Error:** Module not found

**Solution:**
```bash
cd safematch-frontend
rm -rf node_modules package-lock.json
npm install
```

#### 6. Composer Dependencies Error

**Error:** Class not found

**Solution:**
```bash
cd safematch-backend
rm -rf vendor composer.lock
composer install
composer dump-autoload
```

#### 7. Permission Denied (Storage)

**Error:** Permission denied in storage directory

**Solution:**
```bash
cd safematch-backend
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

#### 8. QR Code Generation Error

**Error:** QR code generation fails

**Solution:**
Check GD extension:
```bash
php -m | grep gd
```

Install if missing:
```bash
sudo apt-get install php8.2-gd
sudo systemctl restart apache2
```

---

## Deployment

### Production Deployment

#### 1. Server Requirements
- Ubuntu 22.04 LTS or similar
- Nginx or Apache
- PHP 8.2+ with FPM
- MySQL 8.0+
- Node.js 18+
- SSL certificate (Let's Encrypt)

#### 2. Backend Deployment

```bash
# Clone repository
git clone <repository-url> /var/www/safematch

# Install dependencies
cd /var/www/safematch/safematch-backend
composer install --optimize-autoloader --no-dev

# Set environment
cp .env.example .env
nano .env  # Edit for production

# Set APP_ENV=production
# Set APP_DEBUG=false
# Configure database
# Set proper APP_URL

# Generate key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed if needed
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
sudo chown -R www-data:www-data /var/www/safematch
sudo chmod -R 755 /var/www/safematch
sudo chmod -R 775 /var/www/safematch/safematch-backend/storage
sudo chmod -R 775 /var/www/safematch/safematch-backend/bootstrap/cache
```

#### 3. Frontend Deployment

```bash
cd /var/www/safematch/safematch-frontend

# Install dependencies
npm ci

# Build for production
npm run build

# Output will be in 'dist' folder
```

#### 4. Nginx Configuration

```nginx
# Backend API
server {
    listen 80;
    server_name api.safematch.com;
    root /var/www/safematch/safematch-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}

# Frontend
server {
    listen 80;
    server_name safematch.com www.safematch.com;
    root /var/www/safematch/safematch-frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 5. SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d safematch.com -d www.safematch.com
sudo certbot --nginx -d api.safematch.com

# Auto-renewal is configured automatically
```

#### 6. Environment Variables (Production)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.safematch.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=safematch_prod
DB_USERNAME=safematch_user
DB_PASSWORD=secure_password

SANCTUM_STATEFUL_DOMAINS=safematch.com,www.safematch.com
FRONTEND_URL=https://safematch.com

SESSION_DRIVER=database
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
```

---

## Monitoring & Maintenance

### Log Files

**Backend Logs:**
```bash
tail -f safematch-backend/storage/logs/laravel.log
```

**Nginx Logs:**
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Database Backup

```bash
# Backup database
mysqldump -u root -p safematch > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u root -p safematch < backup_20261112.sql
```

### System Updates

```bash
# Update dependencies
cd safematch-backend
composer update

cd ../safematch-frontend
npm update

# Run migrations
php artisan migrate

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

---

## Performance Optimization

### Backend Optimization

```bash
# Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=10000

# Queue jobs
QUEUE_CONNECTION=redis
php artisan queue:work

# Use Redis for cache/session
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

### Frontend Optimization

```bash
# Build with optimizations
npm run build

# Serve with compression
# Enable gzip in Nginx
gzip on;
gzip_types text/css application/javascript image/svg+xml;
```

---

## Development Workflow

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Code Standards

**PHP (PSR-12):**
```bash
composer require --dev friendsofphp/php-cs-fixer
./vendor/bin/php-cs-fixer fix
```

**JavaScript/TypeScript:**
```bash
npm run lint
npm run lint -- --fix
```

---

## Support & Documentation

- **README.md** - Project overview
- **API_DOCUMENTATION.md** - Complete API reference
- **SETUP.md** - This file
- **Activity Logs** - In-app audit trail

---

**Last Updated:** November 2026  
**Version:** 1.0.0
