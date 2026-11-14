# Profile Picture Fix

## Issue
Profile picture was not persisting after page refresh.

## Root Cause
The `User` interface in `AuthContext.tsx` was missing the `profile_picture` field, so TypeScript was stripping it out when updating the user data.

## Solution Applied

### 1. Updated AuthContext User Interface
**File**: `safematch-frontend/src/contexts/AuthContext.tsx`

Added `profile_picture` field to the User interface:
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  contact_number?: string;
  position?: string;
  is_active: boolean;
  profile_picture?: string;  // ← ADDED THIS
}
```

### 2. Enhanced updateUser Method
Added console logging for debugging:
```typescript
const updateUser = (userData: User) => {
  console.log('AuthContext updateUser called with:', userData);
  setUser(userData);
  localStorage.setItem('user', JSON.stringify(userData));
  console.log('User updated in localStorage');
};
```

### 3. Backend Improvement
**File**: `safematch-backend/app/Http/Controllers/Api/UserController.php`

Changed `$user->fresh()` to `$user->refresh()` for immediate data refresh:
```php
$user->refresh();  // Instead of $user->fresh()

return response()->json([
    'message' => 'Profile updated successfully',
    'user' => $user,
]);
```

### 4. Frontend Debugging
**File**: `safematch-frontend/src/pages/Profile.tsx`

Added console logs to trace the data flow:
```typescript
console.log('Profile update response:', response.data);
console.log('Updating user with data:', response.data.user);
console.log('Setting new profile picture URL:', newImageUrl);
```

## How It Works Now

1. User selects a profile picture
2. Frontend validates file (image type, max 2MB)
3. File is uploaded via FormData to `/api/profile`
4. Backend stores file in `storage/app/public/profile_pictures/`
5. Backend returns updated user object with `profile_picture` path
6. Frontend calls `updateUser()` which updates both React state AND localStorage
7. Profile picture persists across page refreshes

## Testing Steps

1. **Upload Profile Picture**
   ```
   - Go to My Profile
   - Click camera icon
   - Select an image (< 2MB)
   - Click "Update Profile"
   - Should see success message
   ```

2. **Verify Persistence**
   ```
   - Refresh the page (F5)
   - Profile picture should still be visible
   - Check browser console for debug logs
   - Check localStorage: Application → Local Storage → user
   ```

3. **Check Database**
   ```bash
   cd safematch-backend
   php artisan tinker
   User::find(1)->profile_picture  # Should show path
   ```

4. **Check File Storage**
   ```
   Navigate to: safematch-backend/storage/app/public/profile_pictures/
   Image file should be there
   ```

## Debugging Checklist

If profile picture still doesn't persist:

### Frontend Checks
- [ ] Open Browser DevTools Console
- [ ] Look for "AuthContext updateUser called with:" log
- [ ] Verify `profile_picture` field is in the logged user object
- [ ] Check localStorage → user object has `profile_picture` field
- [ ] Check Network tab → `/api/profile` response includes `profile_picture`

### Backend Checks
```bash
# Check database
php artisan tinker --execute="echo User::find(YOUR_USER_ID)->profile_picture;"

# Check storage directory exists
ls storage/app/public/profile_pictures/

# Check storage link
ls -la public/storage  # Should point to ../storage/app/public
```

### Common Issues

**Issue**: Image uploads but doesn't show
- **Fix**: Clear browser cache, check image URL in network tab

**Issue**: Image shows but disappears on refresh
- **Fix**: Check localStorage user object, verify AuthContext User interface includes profile_picture

**Issue**: 404 on image URL
- **Fix**: Run `php artisan storage:link` in backend directory

**Issue**: Image path is relative not absolute
- **Fix**: Frontend should prepend `${axios.defaults.baseURL}/storage/` to the path

## File Locations

### Uploaded Images Stored At:
```
safematch-backend/storage/app/public/profile_pictures/[filename].jpg
```

### Accessible Via Public URL:
```
http://localhost:8000/storage/profile_pictures/[filename].jpg
```

### Database Field:
```
users.profile_picture = "profile_pictures/[filename].jpg"
```

## Migration Status
```bash
✅ 2026_11_14_091227_add_profile_picture_to_users_table [2] Ran
```

Column added: `profile_picture` VARCHAR(255) NULLABLE

---

**Status**: ✅ FIXED
**Date**: November 13, 2026
**Files Modified**: 3
- AuthContext.tsx (added profile_picture to User interface)
- Profile.tsx (added debug logging)
- UserController.php (changed fresh() to refresh())
