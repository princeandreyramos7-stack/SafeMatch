# SafeMatch Testing Guide

## 🚀 System is Running!

**Backend API:** http://127.0.0.1:8000  
**Frontend App:** http://localhost:5174/

## 📝 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Administrator | admin@safematch.com | password |
| Healthcare Personnel | nurse@safematch.com | password |

## ✅ Step-by-Step Testing Instructions

### 1. Login and Dashboard (Task 12)

1. **Open your browser** and go to: http://localhost:5174/
2. **Login** with admin credentials:
   - Email: `admin@safematch.com`
   - Password: `password`
3. **View Dashboard** - You should see:
   - ✓ 8 statistics cards (all showing 0 initially)
   - ✓ Registration trends chart (empty)
   - ✓ QR verification trends chart (empty)
   - ✓ Screening distribution chart (if data exists)
   - ✓ Assessment distribution chart (if data exists)
   - ✓ Recent activities feed
   - ✓ Quick actions panel with 6 buttons

### 2. User Management (Task 4)

1. **Click "Users"** in the sidebar (admin only)
2. **View existing users** - Should see Admin and Nurse
3. **Create new user:**
   - Click "Add User" button
   - Fill in: Name, Email, Password, Role, Contact, Position
   - Click "Create User"
4. **Edit user:** Click edit icon, modify details, save
5. **Toggle status:** Click toggle icon to activate/deactivate
6. **Check Activity Logs** - Click "Activity Logs" to see audit trail

### 3. Mother Management (Task 5)

1. **Click "Mothers"** in the sidebar
2. **Register a mother:**
   - Click "Register Mother" button
   - Fill in form:
     - Full Name: `Maria Santos`
     - Date of Birth: `1995-06-15`
     - Contact: `09123456789`
     - Address: `123 Main St, Manila`
     - Admission Date: Today's date
     - Status: Active
   - Click "Register"
3. **View mother details:** Click "View" button
4. **Generate QR Code:**
   - In mother details modal, click "Generate QR Code"
   - View the QR code preview
   - Click "Download" to get PNG file
   - Click "Print" to print with patient info
5. **Check mother ID format:** Should be `M-YYYYMMDD-XXXX`

### 4. Newborn Management (Task 6)

1. **Click "Newborns"** in the sidebar
2. **Register a newborn:**
   - Click "Register Newborn" button
   - Select mother from dropdown
   - Fill in:
     - Full Name: `Baby Santos`
     - Sex: Male/Female
     - Birth Date & Time: Today
     - Birth Weight: `3000` (grams)
     - Birth Length: `50` (cm)
     - Head Circumference: `35` (cm)
     - Delivery Info: Normal delivery
     - Status: Active
   - Click "Register"
3. **View newborn details:** Click "View" button
4. **Generate QR Code** for newborn
5. **Check newborn ID format:** Should be `NB-YYYYMMDD-XXXX`

### 5. QR Verification (Task 8)

1. **Click "QR Verification"** in the sidebar
2. **Test Single QR Verification:**
   - Select "Single QR Verification" mode
   - Click "Start Camera"
   - Point camera at QR code (from downloaded/printed image)
   - System should auto-scan and validate
   - Check result: Valid/Invalid, patient info displayed
3. **Test Mother-Newborn Pairing:**
   - Select "Mother-Newborn Pairing" mode
   - Click "Start Camera"
   - Scan mother's QR code first
   - Then scan newborn's QR code
   - Check match result:
     - ✓ Green checkmark = MATCH (correct pair)
     - ✗ Red X = NO MATCH (wrong pair)
4. **View verification history:** Scroll down to see past verifications
5. **Check statistics:** Total verifications, matches, match rate

### 6. Newborn Screenings (Task 9)

1. **Click "Screenings"** in the sidebar
2. **Manage screening types:**
   - Click "Manage Screening Types" button
   - Add types: `Hearing Test`, `Vision Test`, `Metabolic Screening`
   - Set mandatory flag and typical timeframe
   - Click "Save"
3. **Record a screening:**
   - Click "Record Screening" button
   - Select newborn
   - Select screening type
   - Date performed: Today
   - Status: `Completed`
   - Result: `Passed`
   - Findings: `All parameters normal`
   - Click "Save"
4. **Check statistics:** Total, completed, followup counts
5. **Filter screenings:** Use search and status filters

### 7. Maternal Assessments (Task 10)

1. **Click "Maternal Assessments"** in the sidebar
2. **Manage assessment types:**
   - Click "Manage Assessment Types" button
   - Add types: `Vital Signs`, `Bleeding Assessment`, `Pain Assessment`
   - Set frequency (e.g., every 4 hours)
   - Mark as mandatory
   - Click "Save"
3. **Record an assessment:**
   - Click "Record Assessment" button
   - Select mother
   - Select assessment type
   - Date/Time: Now
   - Status: `Normal`
   - Clinical Findings (JSON format):
     ```json
     {
       "blood_pressure": "120/80",
       "temperature": "37.0",
       "pulse": "72",
       "respiration": "16",
       "bleeding": "minimal",
       "pain_level": "2"
     }
     ```
   - Notes: Optional
   - Click "Save"
4. **Check critical assessments:** Record one with status `Critical` to see alert
5. **View statistics:** Total, normal, requires attention, critical counts

### 8. Discharge Management (Task 11)

1. **Click "Discharge"** in the sidebar
2. **Manage discharge requirements:**
   - Click "Manage Requirements" button
   - Add requirements:
     - `All screenings completed` (Newborn, Mandatory)
     - `Vital signs stable for 24h` (Mother, Mandatory)
     - `Feeding established` (Newborn, Mandatory)
     - `Discharge education completed` (Both, Optional)
   - Click "Save"
3. **Check discharge readiness:**
   - Find a mother-newborn pair in the table
   - Click "Check Readiness" button
   - View mother and newborn requirement checklists
   - Toggle checkboxes to mark requirements as complete
   - System calculates overall readiness
4. **Create discharge decision:**
   - When both ready, click "Create Discharge Decision"
   - Status: `Approved`
   - Notes: `All criteria met`
   - Click "Save"
5. **View statistics:** Ready for discharge, pending approval, discharged today

### 9. Dashboard Testing (Task 12)

After creating data in previous steps, go back to Dashboard:

1. **Check statistics update:**
   - Total Mothers: Should show count
   - Total Newborns: Should show count
   - Verifications Today: If you scanned QR codes
   - Pending Screenings: Based on data entered
   - Critical Assessments: If any marked critical
   - Ready for Discharge: Based on requirements
2. **Check charts:**
   - Registration trends: Should show today's data
   - QR verification trends: Should show verification patterns
   - Screening distribution: Pie chart with status breakdown
   - Assessment distribution: Pie chart with status breakdown
3. **Check recent activities:** Should show recent actions
4. **Check alerts:** Should show any critical/warning items
5. **Test quick actions:** Click buttons to navigate to modules

### 10. Activity Logs

1. **Click "Activity Logs"** in the sidebar
2. **View all activities:**
   - User logins
   - Mother/newborn registrations
   - QR code generations
   - Screenings recorded
   - Assessments recorded
   - Discharge decisions
3. **Check details:** User, timestamp, action type

## 🎯 Expected Results Summary

After completing all tests, you should have:

- ✅ 2+ users (admin, nurse, and any you created)
- ✅ 1+ mothers with QR codes
- ✅ 1+ newborns with QR codes  
- ✅ 1+ QR verifications (match/no-match)
- ✅ 1+ newborn screenings
- ✅ 1+ maternal assessments
- ✅ Discharge requirements configured
- ✅ Dashboard showing all statistics
- ✅ Charts populated with data
- ✅ Activity logs tracking everything

## 🐛 Common Issues & Solutions

### Issue 1: Dashboard shows all zeros
**Solution:** Create test data first (mothers, newborns, screenings, etc.)

### Issue 2: QR codes not generating
**Solution:** Check that `storage:link` was run: `php artisan storage:link`

### Issue 3: Camera not working for QR scanning
**Solution:** 
- Grant browser camera permissions
- Use HTTPS or localhost (HTTP won't work on remote)
- Try different camera (front/back)

### Issue 4: Login fails
**Solution:** 
- Check backend is running on port 8000
- Check credentials: admin@safematch.com / password
- Clear browser cache/cookies

### Issue 5: CORS errors
**Solution:** Backend should already have CORS configured in `bootstrap/app.php`

### Issue 6: "Cannot connect to API"
**Solution:**
- Verify backend is running: http://127.0.0.1:8000
- Check `.env` file in frontend has: `VITE_API_URL=http://localhost:8000`

## 📊 Test Data Checklist

Use this to track your testing progress:

- [ ] Created admin user
- [ ] Created healthcare personnel user
- [ ] Registered first mother
- [ ] Generated mother's QR code
- [ ] Registered first newborn
- [ ] Generated newborn's QR code
- [ ] Verified QR code (single)
- [ ] Verified mother-newborn pairing
- [ ] Created screening types
- [ ] Recorded first screening
- [ ] Created assessment types
- [ ] Recorded first assessment
- [ ] Created discharge requirements
- [ ] Checked discharge readiness
- [ ] Approved discharge decision
- [ ] Verified dashboard statistics updated
- [ ] Checked all charts display data
- [ ] Reviewed activity logs

## 🎥 Testing Video Workflow

For a complete demo, follow this sequence:

1. Login → Dashboard (empty state)
2. Create mother → Generate QR → View details
3. Create newborn → Generate QR → View details
4. Scan QR codes → Verify pairing → Check match
5. Add screening types → Record screening
6. Add assessment types → Record assessment (including 1 critical)
7. Configure discharge requirements → Check readiness
8. Go to Dashboard → See all statistics populated
9. Check Activity Logs → See complete audit trail

## 💡 Tips for Best Testing Experience

1. **Use multiple browser tabs** - Keep dashboard open in one tab while working in others
2. **Test as different users** - Login as both admin and nurse to see role differences
3. **Print QR codes** - Easier to scan than from screen
4. **Use test data** - Don't use real patient information
5. **Take screenshots** - Document any issues you find
6. **Check console** - Open browser DevTools to see any errors
7. **Refresh dashboard** - After creating data, refresh to see updated statistics

---

## 🚀 Quick Start Commands

**Start Backend:**
```bash
cd safematch-backend
php artisan serve
```

**Start Frontend:**
```bash
cd safematch-frontend
npm run dev
```

**Create Test Users:**
```bash
cd safematch-backend
php artisan db:seed --class=TestUserSeeder
```

**Reset Database (if needed):**
```bash
cd safematch-backend
php artisan migrate:fresh
php artisan db:seed --class=TestUserSeeder
```

---

**Last Updated:** November 12, 2026  
**System Version:** SafeMatch v1.0 (Tasks 1-12 Completed)
