# 🔐 Midwife Login Credentials

## Quick Reference Guide

### 🏥 Midwife Accounts (Healthcare Personnel)

All midwife accounts use the same password: **midwife123**

---

### 👩‍⚕️ Midwife 1: Senior Midwife
- **Name**: Maria Santos
- **Email**: `maria.santos@safematch.com`
- **Password**: `midwife123`
- **Position**: Senior Midwife
- **Contact**: 09171234567

---

### 👩‍⚕️ Midwife 2: Midwife
- **Name**: Ana Cruz
- **Email**: `ana.cruz@safematch.com`
- **Password**: `midwife123`
- **Position**: Midwife
- **Contact**: 09181234567

---

### 👩‍⚕️ Midwife 3: Midwife
- **Name**: Rosa Reyes
- **Email**: `rosa.reyes@safematch.com`
- **Password**: `midwife123`
- **Position**: Midwife
- **Contact**: 09191234567

---

### 👩‍⚕️ Midwife 4: Junior Midwife
- **Name**: Elena Garcia
- **Email**: `elena.garcia@safematch.com`
- **Password**: `midwife123`
- **Position**: Junior Midwife
- **Contact**: 09201234567

---

### 👨‍💼 Administrator Account
- **Name**: Administrator
- **Email**: `admin@safematch.com`
- **Password**: `password`
- **Access**: Full system access including User Management

---

## 🚀 How to Create These Accounts

Run this command in the backend directory:

```bash
cd safematch-backend
php artisan db:seed --class=MidwiferyUserSeeder
```

---

## 📋 Access Levels

### Healthcare Personnel (Midwives) Can Access:
✅ Dashboard
✅ Mothers Management
✅ Newborns Management
✅ QR Verification
✅ Screenings
✅ Maternal Assessments
✅ Discharge Management
✅ Activity Logs
❌ Users Management (Admin Only)

### Administrator Can Access:
✅ Everything above, PLUS:
✅ Users Management (Create/Edit/Delete Users)

---

## 💡 Testing Tips

1. **Login as different users** to test multi-user scenarios
2. **Check Activity Logs** to see who did what
3. **Use administrator** to manage user accounts
4. **Test QR verification** with different midwives

---

## ⚠️ Important Notes

- These credentials are for **TESTING ONLY**
- For production, use **strong, unique passwords**
- Change passwords before deploying to production
- Regularly review and update user accounts

---

## 📞 Support

If you have issues logging in:
1. Make sure you ran the seeder
2. Check that the backend server is running
3. Verify the database connection
4. Try clearing browser cache and cookies
