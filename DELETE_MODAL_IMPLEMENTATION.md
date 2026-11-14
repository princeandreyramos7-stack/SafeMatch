# Delete Confirmation Modal - Implementation Guide

## ✅ Already Completed

### 1. Created Reusable Component
**File**: `safematch-frontend/src/components/DeleteConfirmationModal.tsx`

Features:
- Beautiful modal design with warning icon
- Shows item details
- Custom warning messages
- Cancel and Delete buttons
- Smooth animations

### 2. Updated Pages

#### ✅ Users.tsx - DONE
- Added delete confirmation modal
- Shows user name and email before deletion

#### ✅ Mothers.tsx - DONE  
- Added delete confirmation modal
- Shows mother name and ID before deletion
- Warning about deleting associated data

---

## 🔄 Still Need to Update

Follow this pattern for each page:

### Step 1: Import the Component
```typescript
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
```

### Step 2: Add State Variables
```typescript
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deletingItem, setDeletingItem] = useState<ItemType | null>(null);
```

### Step 3: Update handleDelete Function
```typescript
// BEFORE:
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure...')) return;
  // delete logic
};

// AFTER:
const handleDelete = async (id: number) => {
  // delete logic (no confirm)
};

const confirmDelete = (item: ItemType) => {
  setDeletingItem(item);
  setShowDeleteModal(true);
};
```

### Step 4: Update Delete Button
```typescript
// BEFORE:
onClick={() => handleDelete(item.id)}

// AFTER:
onClick={() => confirmDelete(item)}
```

### Step 5: Add Modal Component
```typescript
{deletingItem && (
  <DeleteConfirmationModal
    isOpen={showDeleteModal}
    onClose={() => {
      setShowDeleteModal(false);
      setDeletingItem(null);
    }}
    onConfirm={() => handleDelete(deletingItem.id)}
    title="Delete [Item Type]"
    message="Are you sure you want to delete this [item type]?"
    itemName={deletingItem.name}
    itemDetails={`ID: ${deletingItem.id}`}
    warningMessage="Custom warning message here."
  />
)}
```

---

## Files to Update

### 3. Newborns.tsx
```typescript
// Import
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// State
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deletingNewborn, setDeletingNewborn] = useState<Newborn | null>(null);

// Functions
const handleDelete = async (newbornId: number) => {
  try {
    await axios.delete(`/newborns/${newbornId}`);
    toast.success('Newborn record deleted successfully');
    fetchNewborns();
  } catch (error: any) {
    toast.error(error.response?.data?.message || 'Failed to delete newborn record');
  }
};

const confirmDelete = (newborn: Newborn) => {
  setDeletingNewborn(newborn);
  setShowDeleteModal(true);
};

// Button
onClick={() => confirmDelete(newborn)}

// Modal
{deletingNewborn && (
  <DeleteConfirmationModal
    isOpen={showDeleteModal}
    onClose={() => {
      setShowDeleteModal(false);
      setDeletingNewborn(null);
    }}
    onConfirm={() => handleDelete(deletingNewborn.id)}
    title="Delete Newborn Record"
    message="Are you sure you want to delete this newborn record?"
    itemName={deletingNewborn.full_name || 'Unnamed'}
    itemDetails={`ID: ${deletingNewborn.newborn_id}`}
    warningMessage="This will permanently delete all associated screenings and assessments."
  />
)}
```

### 4. Screenings.tsx
```typescript
// Import
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

// State
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deletingScreening, setDeletingScreening] = useState<any>(null);

// Functions
const handleDelete = async (id: number) => {
  try {
    await axios.delete(`/screenings/${id}`);
    toast.success('Screening deleted successfully');
    fetchScreenings();
    fetchStatistics();
  } catch (error: any) {
    console.error('Error deleting screening:', error);
    toast.error(error.response?.data?.message || 'Failed to delete screening');
  }
};

const confirmDelete = (screening: any) => {
  setDeletingScreening(screening);
  setShowDeleteModal(true);
};

// Button
onClick={() => confirmDelete(screening)}

// Modal
{deletingScreening && (
  <DeleteConfirmationModal
    isOpen={showDeleteModal}
    onClose={() => {
      setShowDeleteModal(false);
      setDeletingScreening(null);
    }}
    onConfirm={() => handleDelete(deletingScreening.id)}
    title="Delete Screening Record"
    message="Are you sure you want to delete this screening record?"
    itemName={deletingScreening.screening_type?.name}
    itemDetails={`Newborn: ${deletingScreening.newborn?.full_name || 'Unnamed'}`}
  />
)}
```

### 5. MaternalAssessments.tsx
```typescript
// Similar pattern as above
title="Delete Assessment Record"
message="Are you sure you want to delete this assessment record?"
itemName={deletingAssessment.assessment_type?.name}
itemDetails={`Mother: ${deletingAssessment.mother?.full_name}`}
```

### 6. Notifications.tsx
```typescript
// Similar pattern
title="Delete Notification"
message="Are you sure you want to delete this notification?"
itemName={deletingNotification.title}
```

### 7. ScreeningTypesModal.tsx
```typescript
// Similar pattern
title="Delete Screening Type"
message="Are you sure you want to delete this screening type?"
itemName={deletingType.name}
warningMessage="This type is used in existing screening records. Deleting it may affect historical data."
```

### 8. AssessmentTypesModal.tsx
```typescript
// Similar pattern
title="Delete Assessment Type"
message="Are you sure you want to delete this assessment type?"
itemName={deletingType.name}
warningMessage="This type is used in existing assessment records. Deleting it may affect historical data."
```

### 9. DischargeRequirementsModal.tsx
```typescript
// Similar pattern
title="Delete Discharge Requirement"
message="Are you sure you want to delete this requirement?"
itemName={deletingRequirement.name}
warningMessage="This requirement is used in discharge records. Deleting it may affect historical data."
```

---

## Benefits of This Approach

1. ✅ **Consistent UX** - All delete actions look the same
2. ✅ **Better UI** - Professional modal instead of browser alert
3. ✅ **More Information** - Shows what's being deleted
4. ✅ **Warnings** - Clear consequences of deletion
5. ✅ **Mobile Friendly** - Responsive design
6. ✅ **Accessible** - Keyboard navigation and screen reader support
7. ✅ **Reusable** - One component for all delete actions

---

## Testing Checklist

For each updated page:
- [ ] Delete button opens modal
- [ ] Modal shows correct information
- [ ] Cancel button closes modal
- [ ] Delete button deletes item
- [ ] Success toast appears
- [ ] List refreshes after deletion
- [ ] Modal closes after deletion
- [ ] Works on mobile
- [ ] Keyboard navigation works (Escape to close)

---

## Quick Implementation Script

For any page, follow these 5 steps:

1. **Import**: Add `DeleteConfirmationModal` import
2. **State**: Add `showDeleteModal` and `deletingItem` states
3. **Functions**: Remove `confirm()`, add `confirmDelete()` function
4. **Button**: Change `handleDelete(id)` to `confirmDelete(item)`
5. **Modal**: Add `<DeleteConfirmationModal>` component at end

---

## Example Complete Implementation

See `Mothers.tsx` or `Users.tsx` for complete working examples.

---

## Summary

- ✅ **Component Created**: `DeleteConfirmationModal.tsx`
- ✅ **Users Page**: Implemented
- ✅ **Mothers Page**: Implemented
- ⏳ **7 More Pages**: Need implementation
- ⏳ **3 Modal Components**: Need implementation

Total: 2/12 done, 10 remaining
