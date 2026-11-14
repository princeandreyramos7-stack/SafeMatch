# Test Profile Picture Feature

## Quick Test Steps

### Step 1: Check Current User in Database
```bash
cd safematch-backend
php artisan tinker
User::find(2) // Replace 2 with your user ID
exit
```

### Step 2: Manually Update localStorage (For Testing)
Open browser console (F12) and run:
```javascript
// Get current user
let user = JSON.parse(localStorage.getItem('user'));
console.log('Current user:', user);

// Add profile picture path (use the one from database)
user.profile_picture = 'profile_pictures/qRfSd5Rg63Q7hkPLnihFMqvUduAlPJnoFiM3PwQ5.jpg';

// Save back to localStorage
localStorage.setItem('user', JSON.stringify(user));

// Dispatch event to notify components
window.dispatchEvent(new Event('userUpdated'));

console.log('Updated user:', user);

// Refresh page
location.reload();
```

### Step 3: Verify Image URL
After page refresh, in console check:
```javascript
let user = JSON.parse(localStorage.getItem('user'));
console.log('Profile picture:', user.profile_picture);

// Test the storage URL
console.log('Full URL:', `http://localhost:8000/storage/${user.profile_picture}`);

// Try loading the image
let img = new Image();
img.onload = () => console.log('✓ Image loads successfully!');
img.onerror = () => console.log('✗ Image failed to load');
img.src = `http://localhost:8000/storage/${user.profile_picture}`;
```

### Step 4: Upload New Image
1. Go to My Profile
2. Click camera icon
3. Select an image
4. Watch console for logs:
   - "Profile update response:"
   - "Updating user with data:"
   - "AuthContext updateUser called with:"
   - "Sidebar detected user update:"

### Expected Console Output
```
Sidebar loaded user from localStorage: {id: 2, name: "...", profile_picture: "..."}
Profile picture path: profile_pictures/xxxxx.jpg
Profile picture URL will be: http://localhost:8000/storage/profile_pictures/xxxxx.jpg
```

## Debugging Checklist

### ✓ Backend Checks
```bash
# 1. Check database has profile_picture
php artisan tinker
User::first(['id', 'name', 'profile_picture'])

# 2. Check file exists
ls storage/app/public/profile_pictures/

# 3. Check storage link
ls public/storage
# Should show: profile_pictures -> ../storage/app/public/profile_pictures
```

### ✓ Frontend Checks
1. Open DevTools → Console
2. Should see logs from:
   - AuthContext.tsx: "AuthContext updateUser called with:"
   - app-sidebar.tsx: "Sidebar loaded user from localStorage:"
   - Profile.tsx: "Profile update response:"

3. Check localStorage:
   - Application → Local Storage → http://localhost:5173
   - Find "user" key
   - Should have profile_picture field

4. Network tab:
   - POST to /api/profile should return user with profile_picture
   - GET to /storage/profile_pictures/xxx.jpg should return 200

## Common Issues

### Issue: Image URL is wrong
**Check**: Console log should show correct URL format:
```
✓ http://localhost:8000/storage/profile_pictures/xxx.jpg
✗ http://localhost:8000/api/storage/profile_pictures/xxx.jpg  (WRONG - has /api/)
```

**Fix**: Use getStorageUrl() utility function

### Issue: localStorage doesn't have profile_picture
**Check**:
```javascript
JSON.parse(localStorage.getItem('user')).profile_picture
// Should return string, not undefined
```

**Fix**: Verify User interface in AuthContext has profile_picture field

### Issue: Sidebar doesn't update
**Check**: Console should show "Sidebar detected user update:" after save

**Fix**: Verify event listener is attached and userUpdated event is dispatched

### Issue: 404 on image
**Check**:
```bash
cd safematch-backend
ls public/storage/profile_pictures/
```

**Fix**: Run `php artisan storage:link`

## Manual Fix If Nothing Works

If the profile picture still doesn't work, try this manual reset:

### 1. Clear Everything
```javascript
// In browser console
localStorage.clear();
location.href = '/login';
```

### 2. Login Again

### 3. Manually Set Profile Picture
```javascript
// In browser console after login
let user = JSON.parse(localStorage.getItem('user'));
user.profile_picture = 'profile_pictures/YOUR_FILE_NAME.jpg';
localStorage.setItem('user', JSON.stringify(user));
window.dispatchEvent(new Event('userUpdated'));
location.reload();
```

### 4. If Image Still Doesn't Show
Check the image URL in DevTools:
- Right-click the broken image → Inspect
- Check the src attribute
- Copy URL and paste in new tab
- If 404: storage link is broken
- If file not found: database path is wrong

## Success Indicators

When working correctly, you should see:

✓ Console logs show user with profile_picture field
✓ Storage URL is `http://localhost:8000/storage/profile_pictures/xxx.jpg`
✓ Image appears in sidebar (bottom left)
✓ Image appears on Profile page
✓ Image persists after page refresh
✓ Network tab shows 200 OK for image requests
✓ No 404 errors in console
