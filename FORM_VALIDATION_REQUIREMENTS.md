# 📋 Form Validation Requirements

## Summary
Add comprehensive input validation to ensure data quality and prevent errors across all forms in SafeMatch.

---

## 1. ✅ Add New User (COMPLETED)

**File**: `safematch-frontend/src/components/UserForm.tsx`

**Validation Rules:**
- ✅ Name: Required
- ✅ Email: Required, valid email format
- ✅ Password: Required (new users), minimum 8 characters
- ✅ Role: Locked to "Healthcare Personnel" only
- ✅ Contact Number: **Required, exactly 11 digits**
- ✅ Position: **Required**
- ✅ All fields marked with red asterisk (*) are required

**Backend Validation** (`UserController.php`):
```php
'contact_number' => 'required|digits:11',
'position' => 'required|string|max:255',
'role' => Rule::in(['healthcare_personnel']),
```

---

## 2. 🔧 Register New Mother

**File**: `safematch-frontend/src/components/MotherForm.tsx`

**Current State:**
- Full Name: Required ✓
- Date of Birth: Required ✓
- Contact Number: Optional
- Address: Optional
- Admission Date: Optional

**Needed Validation:**

### Frontend Updates:
1. **Contact Number:**
   - Make REQUIRED
   - Must be exactly 11 digits
   - Only numeric input allowed
   - Format: 09123456789

2. **Address:**
   - Make REQUIRED
   - Minimum 10 characters

3. **Admission Date:**
   - Make REQUIRED
   - Cannot be future date
   - Cannot be older than 1 year

4. **Date of Birth:**
   - Must be at least 15 years old (reasonable age for mothers)
   - Cannot be future date

### Code Changes Needed:

```typescript
// Add validation function
const validateForm = () => {
  const newErrors: any = {};
  
  if (!formData.full_name.trim()) {
    newErrors.full_name = ['Full name is required'];
  }
  
  if (!formData.date_of_birth) {
    newErrors.date_of_birth = ['Date of birth is required'];
  } else {
    const age = calculateAge(formData.date_of_birth);
    if (age < 15) {
      newErrors.date_of_birth = ['Mother must be at least 15 years old'];
    }
  }
  
  if (!formData.contact_number.trim()) {
    newErrors.contact_number = ['Contact number is required'];
  } else if (formData.contact_number.length !== 11) {
    newErrors.contact_number = ['Contact number must be exactly 11 digits'];
  } else if (!/^\d{11}$/.test(formData.contact_number)) {
    newErrors.contact_number = ['Contact number must contain only digits'];
  }
  
  if (!formData.address.trim()) {
    newErrors.address = ['Address is required'];
  } else if (formData.address.trim().length < 10) {
    newErrors.address = ['Address must be at least 10 characters'];
  }
  
  if (!formData.admission_date) {
    newErrors.admission_date = ['Admission date is required'];
  }
  
  return newErrors;
};

// Update handleChange for contact_number
if (name === 'contact_number') {
  const digitsOnly = value.replace(/\D/g, '');
  setFormData((prev) => ({
    ...prev,
    [name]: digitsOnly.slice(0, 11),
  }));
}
```

### Update Form Fields:
```typescript
{/* Contact Number */}
<label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-2">
  Contact Number <span className="text-red-500">*</span>
</label>
<input
  type="tel"
  id="contact_number"
  name="contact_number"
  value={formData.contact_number}
  onChange={handleChange}
  required
  maxLength={11}
  placeholder="09123456789 (11 digits)"
/>
<p className="mt-1 text-xs text-gray-500">Must be exactly 11 digits</p>

{/* Address */}
<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
  Address <span className="text-red-500">*</span>
</label>
<textarea
  id="address"
  name="address"
  value={formData.address}
  onChange={handleChange}
  required
  minLength={10}
  placeholder="Enter complete address (minimum 10 characters)"
/>

{/* Admission Date */}
<label htmlFor="admission_date" className="block text-sm font-medium text-gray-700 mb-2">
  Admission Date <span className="text-red-500">*</span>
</label>
<input
  type="date"
  id="admission_date"
  name="admission_date"
  value={formData.admission_date}
  onChange={handleChange}
  required
  max={new Date().toISOString().split('T')[0]}
/>
```

### Backend Validation (`MotherController.php`):
```php
$validated = $request->validate([
    'full_name' => 'required|string|max:255',
    'date_of_birth' => 'required|date|before:today|after:' . now()->subYears(80)->toDateString(),
    'contact_number' => 'required|digits:11',
    'address' => 'required|string|min:10',
    'admission_date' => 'required|date|before_or_equal:today|after:' . now()->subYear()->toDateString(),
    'admission_info' => 'nullable|string',
    'status' => 'in:active,discharged',
], [
    'contact_number.required' => 'Contact number is required',
    'contact_number.digits' => 'Contact number must be exactly 11 digits',
    'address.required' => 'Address is required',
    'address.min' => 'Address must be at least 10 characters',
    'admission_date.required' => 'Admission date is required',
]);
```

---

## 3. 🔧 Register Newborn

**File**: `safematch-frontend/src/components/NewbornForm.tsx`

**Needed Validation:**

1. **Mother Selection:** Required
2. **Full Name:** Optional (can be unnamed)
3. **Date of Birth:** 
   - Required
   - Cannot be future date
   - Cannot be older than 30 days (newborns only)
4. **Time of Birth:** Required
5. **Sex:** Required
6. **Weight:** 
   - Required
   - Must be between 0.5 and 10 kg (reasonable range)
   - Only numeric with 2 decimal places
7. **Length:** 
   - Required
   - Must be between 30 and 70 cm
   - Only numeric with 1 decimal place
8. **Head Circumference:**
   - Required
   - Must be between 25 and 45 cm
9. **APGAR Score:**
   - If provided, must be between 0 and 10
10. **Delivery Type:** Required
11. **Status:** Required

### Code Example:
```typescript
const validateForm = () => {
  const newErrors: any = {};
  
  if (!formData.mother_id) {
    newErrors.mother_id = ['Mother selection is required'];
  }
  
  if (!formData.date_of_birth) {
    newErrors.date_of_birth = ['Date of birth is required'];
  } else {
    const birthDate = new Date(formData.date_of_birth);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (birthDate > new Date()) {
      newErrors.date_of_birth = ['Birth date cannot be in the future'];
    } else if (birthDate < thirtyDaysAgo) {
      newErrors.date_of_birth = ['Birth date cannot be more than 30 days ago (newborns only)'];
    }
  }
  
  if (!formData.time_of_birth) {
    newErrors.time_of_birth = ['Time of birth is required'];
  }
  
  if (!formData.sex) {
    newErrors.sex = ['Sex is required'];
  }
  
  if (!formData.weight) {
    newErrors.weight = ['Weight is required'];
  } else {
    const weight = parseFloat(formData.weight);
    if (weight < 0.5 || weight > 10) {
      newErrors.weight = ['Weight must be between 0.5 and 10 kg'];
    }
  }
  
  if (!formData.length) {
    newErrors.length = ['Length is required'];
  } else {
    const length = parseFloat(formData.length);
    if (length < 30 || length > 70) {
      newErrors.length = ['Length must be between 30 and 70 cm'];
    }
  }
  
  if (!formData.head_circumference) {
    newErrors.head_circumference = ['Head circumference is required'];
  } else {
    const headCirc = parseFloat(formData.head_circumference);
    if (headCirc < 25 || headCirc > 45) {
      newErrors.head_circumference = ['Head circumference must be between 25 and 45 cm'];
    }
  }
  
  if (formData.apgar_score) {
    const apgar = parseInt(formData.apgar_score);
    if (apgar < 0 || apgar > 10) {
      newErrors.apgar_score = ['APGAR score must be between 0 and 10'];
    }
  }
  
  return newErrors;
};
```

### Backend Validation (`NewbornController.php`):
```php
$validated = $request->validate([
    'mother_id' => 'required|exists:mothers,id',
    'full_name' => 'nullable|string|max:255',
    'date_of_birth' => 'required|date|before_or_equal:today|after:' . now()->subDays(30)->toDateString(),
    'time_of_birth' => 'required',
    'sex' => 'required|in:male,female',
    'weight' => 'required|numeric|between:0.5,10',
    'length' => 'required|numeric|between:30,70',
    'head_circumference' => 'required|numeric|between:25,45',
    'apgar_score' => 'nullable|integer|between:0,10',
    'delivery_type' => 'required|in:normal,cesarean,assisted',
    'birth_complications' => 'nullable|string',
    'status' => 'required|in:active,discharged',
], [
    'weight.between' => 'Weight must be between 0.5 and 10 kg',
    'length.between' => 'Length must be between 30 and 70 cm',
    'head_circumference.between' => 'Head circumference must be between 25 and 45 cm',
    'date_of_birth.after' => 'Birth date cannot be more than 30 days ago',
]);
```

---

## 4. 🔧 Record New Screening

**File**: `safematch-frontend/src/components/ScreeningForm.tsx`

**Current Validation:** Already has good validation ✓

**Additional Validation Needed:**

1. **Date Performed:**
   - Cannot be before newborn's birth date
   - Cannot be future date

2. **Remarks:**
   - If status is "requires_followup", remarks should be required
   - If result is "failed", remarks should be required

### Code Example:
```typescript
const validateForm = () => {
  const newErrors: any = {};
  
  if (!formData.newborn_id) {
    newErrors.newborn_id = ['Newborn selection is required'];
  }
  
  if (!formData.screening_type_id) {
    newErrors.screening_type_id = ['Screening type is required'];
  }
  
  if (!formData.performed_date) {
    newErrors.performed_date = ['Date performed is required'];
  }
  
  // Require remarks for certain conditions
  if ((formData.status === 'requires_followup' || formData.result === 'failed') && !formData.remarks.trim()) {
    newErrors.remarks = ['Remarks are required when status is "requires followup" or result is "failed"'];
  }
  
  return newErrors;
};
```

---

## 5. 🔧 Manage Discharge Requirements

**File**: `safematch-frontend/src/components/DischargeRequirementsModal.tsx`

**Needed Validation:**

1. **Name:** 
   - Required
   - Minimum 3 characters
   - Maximum 100 characters

2. **Description:**
   - Required
   - Minimum 10 characters

3. **Requirement Type:** Required (maternal, newborn, both)

4. **Display Order:**
   - Must be a positive integer
   - Between 0 and 100

### Code Example:
```typescript
const validateForm = () => {
  const newErrors: any = {};
  
  if (!formData.name.trim()) {
    newErrors.name = ['Requirement name is required'];
  } else if (formData.name.trim().length < 3) {
    newErrors.name = ['Name must be at least 3 characters'];
  }
  
  if (!formData.description.trim()) {
    newErrors.description = ['Description is required'];
  } else if (formData.description.trim().length < 10) {
    newErrors.description = ['Description must be at least 10 characters'];
  }
  
  if (!formData.requirement_type) {
    newErrors.requirement_type = ['Requirement type is required'];
  }
  
  if (formData.display_order < 0 || formData.display_order > 100) {
    newErrors.display_order = ['Display order must be between 0 and 100'];
  }
  
  return newErrors;
};
```

### Backend Validation (`DischargeRequirementController.php`):
```php
$validated = $request->validate([
    'name' => 'required|string|min:3|max:100',
    'description' => 'required|string|min:10',
    'requirement_type' => 'required|in:maternal,newborn,both',
    'is_required' => 'boolean',
    'is_active' => 'boolean',
    'display_order' => 'integer|between:0,100',
], [
    'name.min' => 'Requirement name must be at least 3 characters',
    'description.min' => 'Description must be at least 10 characters',
]);
```

---

## Common Validation Patterns

### Phone Number (11 digits Philippines):
```typescript
// Frontend
const handleContactChange = (e) => {
  const digitsOnly = e.target.value.replace(/\D/g, '');
  setFormData(prev => ({
    ...prev,
    contact_number: digitsOnly.slice(0, 11)
  }));
};

// Validation
if (!/^\d{11}$/.test(formData.contact_number)) {
  errors.contact_number = ['Must be exactly 11 digits'];
}

// Backend
'contact_number' => 'required|digits:11'
```

### Date Range Validation:
```typescript
// Cannot be future
max={new Date().toISOString().split('T')[0]}

// Cannot be too old
min={new Date(Date.now() - 365*24*60*60*1000).toISOString().split('T')[0]}
```

### Numeric with Decimal:
```typescript
// Weight (2 decimals)
<input 
  type="number" 
  step="0.01" 
  min="0.5" 
  max="10"
  placeholder="e.g., 3.25"
/>

// Length (1 decimal)
<input 
  type="number" 
  step="0.1" 
  min="30" 
  max="70"
  placeholder="e.g., 50.5"
/>
```

---

## Implementation Priority

1. ✅ **User Form** - COMPLETED
2. 🔥 **Mother Form** - HIGH PRIORITY (patient data)
3. 🔥 **Newborn Form** - HIGH PRIORITY (patient data)
4. 📋 **Screening Form** - MEDIUM (add conditional validation)
5. 📋 **Discharge Requirements** - MEDIUM (admin data)

---

## Testing Checklist

For each form, test:
- [ ] Required fields cannot be empty
- [ ] Phone numbers must be 11 digits
- [ ] Dates cannot be in the future (where applicable)
- [ ] Numeric fields have min/max ranges
- [ ] Error messages display clearly
- [ ] Form cannot submit with errors
- [ ] Backend also validates (try bypassing frontend)
- [ ] Success messages appear after save
- [ ] Form clears/closes after successful save

---

## Benefits

1. **Data Quality** - Ensures accurate, complete information
2. **User Experience** - Clear guidance on what's needed
3. **Error Prevention** - Catch mistakes before they cause problems
4. **Consistency** - Same validation rules everywhere
5. **Security** - Backend validation prevents malicious data
