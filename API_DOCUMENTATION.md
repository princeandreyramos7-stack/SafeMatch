# SafeMatch API Documentation

Complete API reference for SafeMatch Healthcare Management System.

**Base URL:** `http://127.0.0.1:8000/api`

**Authentication:** All endpoints except `/login` require Bearer token authentication via Laravel Sanctum.

## Authentication

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "admin@safematch.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@safematch.com",
    "role": "administrator"
  },
  "token": "1|abc123..."
}
```

### Logout
```http
POST /logout
Authorization: Bearer {token}
```

### Get Current User
```http
GET /user
Authorization: Bearer {token}
```

---

## Mothers

### List Mothers
```http
GET /mothers?search=Maria&status=active&page=1&per_page=15
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` (optional) - Search by name, ID, or contact
- `status` (optional) - Filter by status: active, discharged, archived
- `page` (optional) - Page number (default: 1)
- `per_page` (optional) - Items per page (default: 15)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "mother_id": "M-20261112-0001",
      "full_name": "Maria Clara Santos",
      "date_of_birth": "1995-06-15",
      "contact_number": "09171234567",
      "address": "123 Main St, Manila",
      "admission_date": "2026-11-10T13:31:25.000000Z",
      "status": "active",
      "created_at": "2026-11-12T13:31:25.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 5,
    "per_page": 15
  }
}
```

### Create Mother
```http
POST /mothers
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "Maria Clara Santos",
  "date_of_birth": "1995-06-15",
  "contact_number": "09171234567",
  "address": "123 Main St, Manila, Philippines",
  "admission_date": "2026-11-10",
  "admission_info": "Normal pregnancy, full term"
}
```

### Get Mother Details
```http
GET /mothers/{id}
Authorization: Bearer {token}
```

### Update Mother
```http
PUT /mothers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "full_name": "Maria Clara Santos",
  "contact_number": "09171234567"
}
```

### Delete Mother
```http
DELETE /mothers/{id}
Authorization: Bearer {token}
```

### Get Mother Statistics
```http
GET /mothers/statistics
Authorization: Bearer {token}
```

---

## Newborns

### List Newborns
```http
GET /newborns?search=Baby&status=active&sex=male&page=1
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` (optional) - Search by name, ID
- `status` (optional) - Filter by status
- `sex` (optional) - Filter by sex: male, female
- `page` (optional) - Page number

### Create Newborn
```http
POST /newborns
Authorization: Bearer {token}
Content-Type: application/json

{
  "mother_id": 1,
  "full_name": "Baby Boy Santos",
  "date_time_of_birth": "2026-11-10 14:30:00",
  "sex": "male",
  "birth_weight": 3200,
  "birth_length": 51,
  "birth_head_circumference": 35,
  "delivery_info": "Normal spontaneous delivery"
}
```

### Get Available Mothers
```http
GET /newborns/available-mothers
Authorization: Bearer {token}
```

Returns list of mothers for newborn registration dropdown.

---

## QR Codes

### Generate QR Code
```http
POST /qr-codes/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "qrcodeable_type": "App\\Models\\Mother",
  "qrcodeable_id": 1
}
```

**Response:**
```json
{
  "qr_code": {
    "id": 1,
    "code": "M-20261112-ABC123",
    "image_path": "qrcodes/M-20261112-ABC123.svg",
    "status": "active"
  },
  "image_url": "http://127.0.0.1:8000/storage/qrcodes/M-20261112-ABC123.svg"
}
```

### Download QR Code
```http
GET /qr-codes/{id}/download
Authorization: Bearer {token}
```

Returns SVG file download.

### Get QR Image
```http
GET /qr-codes/{id}/image
Authorization: Bearer {token}
```

Returns SVG image for display.

### Revoke QR Code
```http
POST /qr-codes/revoke
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1
}
```

---

## QR Verification

### Verify Single QR Code
```http
POST /qr-verification/verify-single
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "M-20261112-ABC123",
  "token": "abc123def456..."
}
```

**Response:**
```json
{
  "verified": true,
  "qr_code": {
    "code": "M-20261112-ABC123",
    "status": "active"
  },
  "patient": {
    "type": "mother",
    "id": 1,
    "name": "Maria Clara Santos"
  }
}
```

### Verify Mother-Newborn Pairing
```http
POST /qr-verification/verify-pairing
Authorization: Bearer {token}
Content-Type: application/json

{
  "mother_code": "M-20261112-ABC123",
  "mother_token": "abc123...",
  "newborn_code": "NB-20261112-DEF456",
  "newborn_token": "def456..."
}
```

**Response:**
```json
{
  "match": true,
  "mother": {
    "id": 1,
    "name": "Maria Clara Santos"
  },
  "newborn": {
    "id": 1,
    "name": "Baby Boy Santos",
    "mother_id": 1
  },
  "message": "Mother-newborn pair verified successfully"
}
```

### Get Verification History
```http
GET /qr-verification/history?search=maria&page=1
Authorization: Bearer {token}
```

### Get Verification Statistics
```http
GET /qr-verification/statistics
Authorization: Bearer {token}
```

---

## Screenings

### List Screenings
```http
GET /screenings?search=&status=completed&page=1
Authorization: Bearer {token}
```

### Create Screening
```http
POST /screenings
Authorization: Bearer {token}
Content-Type: application/json

{
  "newborn_id": 1,
  "screening_type_id": 1,
  "performed_date": "2026-11-12",
  "status": "completed",
  "result": "Both ears responded normally",
  "remarks": "Test completed successfully"
}
```

### Get Screenings by Newborn
```http
GET /screenings/newborn/{newbornId}
Authorization: Bearer {token}
```

### Get Screening Completion Rate
```http
GET /screenings/newborn/{newbornId}/completion-rate
Authorization: Bearer {token}
```

### List Screening Types
```http
GET /screening-types
Authorization: Bearer {token}
```

### Create Screening Type
```http
POST /screening-types
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Hearing Screening",
  "description": "Newborn hearing test",
  "is_required": true
}
```

---

## Maternal Assessments

### List Assessments
```http
GET /maternal-assessments?status=completed&page=1
Authorization: Bearer {token}
```

### Create Assessment
```http
POST /maternal-assessments
Authorization: Bearer {token}
Content-Type: application/json

{
  "mother_id": 1,
  "assessment_type_id": 1,
  "assessment_date": "2026-11-12 10:00:00",
  "status": "completed",
  "findings": {
    "blood_pressure": "110/70 mmHg",
    "temperature": "36.8°C",
    "pulse": "78 bpm"
  },
  "remarks": "All vitals normal"
}
```

### Get Assessments by Mother
```http
GET /maternal-assessments/mother/{motherId}
Authorization: Bearer {token}
```

### Get Assessment Types
```http
GET /assessment-types
Authorization: Bearer {token}
```

---

## Discharge Management

### Get Discharge Statistics
```http
GET /discharge/statistics
Authorization: Bearer {token}
```

### Get Recent Discharge Decisions
```http
GET /discharge/recent?limit=10
Authorization: Bearer {token}
```

### Get Discharge Readiness
```http
GET /discharge/readiness/{motherId}/{newbornId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "mother_ready": true,
  "newborn_ready": false,
  "mother_requirements": [
    {
      "id": 1,
      "name": "Vital Signs Stable",
      "completed": true
    }
  ],
  "newborn_requirements": [
    {
      "id": 2,
      "name": "Newborn Screening Complete",
      "completed": false
    }
  ]
}
```

### Update Discharge Requirement
```http
POST /discharge/requirement
Authorization: Bearer {token}
Content-Type: application/json

{
  "requirement_id": 1,
  "patient_type": "mother",
  "patient_id": 1,
  "completed": true
}
```

### Create Discharge Decision
```http
POST /discharge/decision
Authorization: Bearer {token}
Content-Type: application/json

{
  "mother_id": 1,
  "newborn_id": 1,
  "decision": "approved",
  "decision_date": "2026-11-12",
  "notes": "All requirements met"
}
```

### List Discharge Requirements
```http
GET /discharge-requirements
Authorization: Bearer {token}
```

---

## Dashboard

### Get Dashboard Statistics
```http
GET /dashboard/statistics
Authorization: Bearer {token}
```

### Get Registration Trends
```http
GET /dashboard/registration-trends?days=7
Authorization: Bearer {token}
```

### Get Verification Trends
```http
GET /dashboard/verification-trends?days=7
Authorization: Bearer {token}
```

### Get Recent Activities
```http
GET /dashboard/recent-activities?limit=5
Authorization: Bearer {token}
```

### Get System Alerts
```http
GET /dashboard/alerts
Authorization: Bearer {token}
```

---

## Analytics & Reporting

### Get Analytics Overview
```http
GET /analytics/overview?start_date=2026-10-01&end_date=2026-11-12
Authorization: Bearer {token}
```

### Get Registration Trends
```http
GET /analytics/registration-trends?days=30
Authorization: Bearer {token}
```

### Get Screening Analytics
```http
GET /analytics/screening-analytics?start_date=2026-10-01&end_date=2026-11-12
Authorization: Bearer {token}
```

### Get Assessment Analytics
```http
GET /analytics/assessment-analytics?start_date=2026-10-01&end_date=2026-11-12
Authorization: Bearer {token}
```

### Export Data to CSV
```http
GET /analytics/export-csv?type=mothers&start_date=2026-10-01&end_date=2026-11-12
Authorization: Bearer {token}
```

**Export Types:**
- `overview` - Overview report
- `mothers` - Mothers data
- `newborns` - Newborns data
- `screenings` - Screenings data
- `assessments` - Assessments data
- `discharges` - Discharge data

Returns CSV file download.

---

## Notifications

### List Notifications
```http
GET /notifications?unread_only=true&page=1
Authorization: Bearer {token}
```

### Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "count": 5
}
```

### Mark Notification as Read
```http
POST /notifications/{id}/mark-read
Authorization: Bearer {token}
```

### Mark All Notifications as Read
```http
POST /notifications/mark-all-read
Authorization: Bearer {token}
```

### Delete Notification
```http
DELETE /notifications/{id}
Authorization: Bearer {token}
```

---

## User Management (Admin Only)

### List Users
```http
GET /users?search=&role=healthcare_personnel&page=1
Authorization: Bearer {token}
```

**Required Role:** administrator

### Create User
```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "healthcare_personnel",
  "position": "Nurse",
  "contact_number": "09123456789"
}
```

### Toggle User Status
```http
POST /users/{id}/toggle-status
Authorization: Bearer {token}
```

---

## Activity Logs

### List Activity Logs
```http
GET /activity-logs?search=&causer_id=1&page=1
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` (optional) - Search in description
- `causer_id` (optional) - Filter by user
- `page` (optional) - Page number

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "message": "This action is unauthorized."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found."
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

### 500 Server Error
```json
{
  "message": "Server Error"
}
```

---

## Rate Limiting

API requests are rate-limited to:
- 60 requests per minute for authenticated users
- 10 requests per minute for unauthenticated requests

---

## Pagination

List endpoints return paginated results:

```json
{
  "data": [...],
  "links": {
    "first": "http://api.example.com/resource?page=1",
    "last": "http://api.example.com/resource?page=10",
    "prev": null,
    "next": "http://api.example.com/resource?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 10,
    "per_page": 15,
    "to": 15,
    "total": 150
  }
}
```

---

## Testing with Postman/Insomnia

1. Import the API collection
2. Set base URL: `http://127.0.0.1:8000/api`
3. Login to get token
4. Add token to Authorization header: `Bearer {token}`
5. Make requests to protected endpoints

---

## WebSocket Events (Future Enhancement)

Currently not implemented. System uses HTTP polling for real-time updates.

---

**Last Updated:** November 2026  
**API Version:** 1.0.0
