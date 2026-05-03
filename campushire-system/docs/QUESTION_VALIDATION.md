# Question Validation Added

## ✅ Changes Made

### 1. Frontend Validation
**File**: `frontend/src/pages/ExperienceForm.tsx`

**Added validation in `addQuestion()` function**:
- ✅ Question cannot be empty
- ✅ Question must be at least 5 characters long
- ✅ Question must be less than 500 characters
- ✅ Answer must be less than 2000 characters (if provided)
- ✅ Shows success toast when question is added

**Added validation in `updateQuestionAnswer()` function**:
- ✅ Question cannot be empty when editing
- ✅ Question must be at least 5 characters long
- ✅ Question must be less than 500 characters
- ✅ Answer must be less than 2000 characters (if provided)
- ✅ Automatically trims whitespace from questions

### 2. Backend Validation
**File**: `backend/app/api/v1/experiences.py`

**Added validation and cleaning in `create_experience()` function**:
- ✅ Validates questions_asked structure (must be dict)
- ✅ Validates each question in the list
- ✅ For JSON format questions (question-answer pairs):
  - Validates question field exists and is not empty
  - Validates question length (5-500 characters)
  - Validates answer length (max 2000 characters if provided)
- ✅ For plain string questions:
  - Validates length (5-500 characters)
- ✅ Filters out invalid/empty questions
- ✅ Removes empty categories after cleaning

## 📋 Validation Rules

### Question Validation:
- **Minimum length**: 5 characters
- **Maximum length**: 500 characters
- **Required**: Yes (cannot be empty)
- **Format**: Can be JSON `{"question": "...", "answer": "..."}` or plain string

### Answer Validation:
- **Minimum length**: None (optional)
- **Maximum length**: 2000 characters (if provided)
- **Required**: No (optional field)

### Category Validation:
- Categories with no valid questions are removed
- Empty question lists are filtered out

## 🎯 How It Works

### When Adding a Question:
1. User enters question and optional answer
2. Frontend validates:
   - Question is not empty
   - Question is 5-500 characters
   - Answer is max 2000 characters (if provided)
3. If valid, question is added
4. If invalid, error toast is shown

### When Editing a Question:
1. User edits question or answer
2. Frontend validates on change:
   - Question must be 5-500 characters
   - Answer must be max 2000 characters (if provided)
3. If invalid, error toast is shown and change is rejected
4. If valid, question is updated

### When Submitting Experience:
1. Backend receives questions_asked
2. Backend validates and cleans:
   - Checks structure (dict with category -> list)
   - Validates each question
   - Filters out invalid questions
   - Removes empty categories
3. Only valid questions are saved

## ✅ Benefits

1. **Data Quality**: Ensures all questions are valid and meaningful
2. **User Feedback**: Immediate validation feedback in the UI
3. **Backend Safety**: Server-side validation prevents invalid data
4. **Consistent Format**: All questions follow the same validation rules
5. **Automatic Cleaning**: Invalid questions are filtered out automatically

## 🚀 User Experience

- **Real-time validation**: Users see errors immediately when entering invalid questions
- **Clear error messages**: Specific messages for each validation rule
- **Success feedback**: Toast notification when question is added successfully
- **Automatic trimming**: Whitespace is automatically removed from questions

## 📝 Example Valid Questions

✅ Valid:
- `"What is the time complexity of binary search?"` (plain string)
- `{"question": "Explain OOP concepts", "answer": "OOP has 4 pillars..."}` (JSON)

❌ Invalid:
- `"Hi"` (too short, < 5 characters)
- `""` (empty)
- `{"question": "", "answer": "..."}` (empty question field)
- Question with 501+ characters (too long)
