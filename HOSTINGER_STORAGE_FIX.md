# Fix 403 Forbidden Error for Profile Pictures on Hostinger

## Problem
Profile pictures return **403 Forbidden** error on Hostinger hosting.

## Root Cause
The `storage/app/public/profile_pictures` folder doesn't have proper permissions on the server, or the storage link is not correctly configured for production.

---

## Solution 1: Fix .htaccess for Storage Access

### Create/Update public/.htaccess
Make sure your `public/.htaccess` allows access to the storage folder:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Allow access to storage folder
<IfModule mod_rewrite.c>
    RewriteCond %{REQUEST_URI} ^/storage/
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>

# Prevent access to .env and other sensitive files
<FilesMatch "^\.">
    Order allow,deny
    Deny from all
</FilesMatch>
```

---

## Solution 2: Fix Storage Folder Permissions via SSH

### If you have SSH access to Hostinger:

```bash
# Connect via SSH
ssh u123456789@yourdomain.com

# Navigate to your Laravel directory
cd domains/yourdomain.com/public_html

# Fix storage permissions
chmod -R 755 storage
chmod -R 755 storage/app/public
chmod -R 755 storage/app/public/profile_pictures

# Fix ownership (replace username with your Hostinger username)
chown -R u123456789:u123456789 storage

# Recreate storage link
php artisan storage:link

# Check if link was created
ls -la public/storage
```

---

## Solution 3: Fix via Hostinger File Manager (No SSH)

### If you DON'T have SSH:

1. **Login to Hostinger Control Panel**
2. **Go to File Manager**
3. **Navigate to your Laravel directory**
4. **Right-click `storage` folder → Change Permissions**
   - Set to `755` (rwxr-xr-x)
   - Check "Apply to subdirectories"
5. **Navigate to `storage/app/public`**
6. **Right-click `profile_pictures` folder → Change Permissions**
   - Set to `755`
7. **Check if `public/storage` symlink exists**
   - If not, delete it and recreate via terminal or manually

---

## Solution 4: Create .htaccess in storage/app/public

Create a file: `storage/app/public/.htaccess`

```apache
<IfModule mod_rewrite.c>
    Options +FollowSymLinks
    RewriteEngine On
</IfModule>

<IfModule mod_headers.c>
    # Allow images to be loaded
    <FilesMatch "\.(jpg|jpeg|png|gif|svg|webp)$">
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>

# Allow directory listing (optional, for debugging)
Options +Indexes

# Or prevent directory listing (recommended for production)
# Options -Indexes
```

---

## Solution 5: Alternative - Store in Public Folder Directly

If permissions issues persist, you can store profile pictures directly in the `public` folder:

### Update UserController.php:

```php
// Change this line in updateProfile method:
$path = $request->file('profile_picture')->store('profile_pictures', 'public');

// To this:
$path = $request->file('profile_pictures')->move(
    public_path('uploads/profile_pictures'),
    $fileName
);
$validated['profile_picture'] = 'uploads/profile_pictures/' . $fileName;
```

### Update Frontend storage.ts:

```typescript
export function getStorageUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  const baseURL = axios.defaults.baseURL?.replace('/api', '') || 'http://localhost:8000';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If path starts with 'uploads', it's in public folder
  if (cleanPath.startsWith('uploads/')) {
    return `${baseURL}/${cleanPath}`;
  }
  
  // Otherwise it's in storage
  return `${baseURL}/storage/${cleanPath}`;
}
```

---

## Solution 6: Update .env for Production

Make sure your `.env` on Hostinger has correct URL:

```env
APP_URL=https://yourdomain.com
FILESYSTEM_DISK=public
```

---

## Verification Steps

### 1. Test Storage Link
Visit: `https://yourdomain.com/storage/profile_pictures/test.txt`
- Should NOT return 403
- Should return 404 (file not found) or show the file

### 2. Test Direct Access
Upload an image, then visit:
`https://yourdomain.com/storage/profile_pictures/[filename].jpg`
- Should display the image
- NOT 403 Forbidden

### 3. Check .htaccess
Make sure there's no `.htaccess` in `storage/app/public/` that denies access

---

## Quick Fix Commands (SSH Required)

```bash
# Connect to Hostinger
ssh u123456789@yourdomain.com

# Navigate to Laravel
cd domains/yourdomain.com/public_html

# Fix everything
chmod -R 755 storage
chown -R u123456789:u123456789 storage
rm public/storage
php artisan storage:link
php artisan config:clear
php artisan cache:clear

# Test
ls -la public/storage
ls -la storage/app/public/profile_pictures
```

---

## If Nothing Works: Contact Hostinger Support

Some Hostinger plans have additional security restrictions. You may need to:

1. **Contact Hostinger Support** and ask them to:
   - Enable symlink creation for your account
   - Check if there are server-level restrictions on `/storage/` access
   - Verify mod_rewrite is enabled

2. **Or upgrade to a plan that supports Laravel properly**
   - Business or higher plans have better Laravel support

---

## Recommended Solution for Hostinger

Based on common Hostinger issues, I recommend **Solution 5** (store in public folder):

### Steps:
1. Create `public/uploads/profile_pictures/` folder
2. Update backend to save files there
3. Update frontend to read from `/uploads/` instead of `/storage/`
4. No symlink needed, no permission issues!

This is the most reliable solution for shared hosting like Hostinger.

---

## Test After Applying Fix

```javascript
// In browser console:
let img = new Image();
img.onload = () => console.log('✅ Image accessible!');
img.onerror = () => console.log('❌ Still 403 or not found');
img.src = 'https://yourdomain.com/storage/profile_pictures/test.jpg';
```

---

Need help applying any of these solutions? Let me know which one you want to try!
