# Package and Years of Experience Display

## ✅ Changes Made

### 1. Added Years of Experience Field
**Backend**:
- Added `years_of_experience` column to `Experience` model
- Added `years_of_experience` to all experience schemas (Create, Update, Response)

**Frontend**:
- Added `years_of_experience` to `Experience` and `ExperienceCreateRequest` interfaces
- Added input field in experience form for years of experience

### 2. Fixed Package Display
**Updated all display locations** to:
- ✅ Only show package if `package_offered > 0` (not just if it exists)
- ✅ Show "Not disclosed" or hide if package is 0 or null
- ✅ Display package in format: `₹X.XL` (e.g., ₹12.5L)

### 3. Added Years of Experience Display
**Updated all display locations** to show years of experience:
- ✅ Dashboard experience cards
- ✅ Admin Panel experience list
- ✅ Admin Panel experience detail view
- ✅ Company Detail Page
- ✅ Company Accordion
- ✅ Format: "X Years" or "X Year" (singular/plural)

## 📋 Updated Files

### Backend:
1. `backend/app/db/models.py` - Added `years_of_experience` column
2. `backend/app/schemas/experience.py` - Added to all schemas

### Frontend:
1. `frontend/src/api/experiences.ts` - Added to interfaces
2. `frontend/src/pages/ExperienceForm.tsx` - Added input field
3. `frontend/src/pages/Dashboard.tsx` - Updated display
4. `frontend/src/pages/AdminPanel.tsx` - Updated display
5. `frontend/src/pages/CompanyDetailPage.tsx` - Updated display
6. `frontend/src/components/CompanyAccordion.tsx` - Updated display

## 🎯 Display Format

### Package:
- **If package > 0**: `₹12.5L` (green color)
- **If package = 0 or null**: Hidden or "Not disclosed"

### Years of Experience:
- **If years > 0**: `2.5 Years` or `1 Year` (blue color with calendar icon)
- **If years = 0 or null**: Hidden

## 📝 Form Field

In the experience form, users can now enter:
- **Package Offered (LPA)**: Number input (e.g., 12.5)
- **Years of Experience**: Number input (e.g., 2.5)

Both fields are optional but will be displayed if provided and > 0.

## 🚀 Next Steps

1. **Database Migration**: You'll need to add the `years_of_experience` column to your database:
   ```sql
   ALTER TABLE experiences ADD COLUMN years_of_experience FLOAT;
   ```

2. **Restart Backend**: Restart your backend server to pick up the model changes

3. **Test**: 
   - Fill in package and years of experience in the form
   - Submit an experience
   - Verify both are displayed correctly

## ✅ Benefits

- **Better Information**: Users can see both salary and experience level
- **Accurate Display**: Package only shows when > 0 (no more ₹0.0L)
- **Complete Profile**: Years of experience provides context for the interview
- **Consistent Format**: All displays follow the same format
