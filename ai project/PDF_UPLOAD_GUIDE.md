# PDF Experience Upload Guide

This guide explains how to upload multiple verified campus interview experiences from a PDF file to CampusHire AI.

## Overview

The system includes:
1. **PDF Parser** - Extracts structured data from PDF files
2. **Bulk Upload Script** - Uploads experiences via admin API
3. **Accordion UI** - Groups experiences by company with expandable cards
4. **Advanced Filtering** - Filter by role, branch, and interview difficulty
5. **Admin Toggle** - Show/hide pre-uploaded verified experiences

## Prerequisites

1. Python 3.8+ with required packages:
   ```bash
   pip install PyPDF2 pdfplumber requests
   ```

2. Backend server running on `http://localhost:8000`

3. Admin credentials (email and password)

4. PDF file with interview experiences

## Step 1: Run Database Migration

First, add the `is_preuploaded` column to the experiences table:

```bash
cd backend
python add_preuploaded_flag.py
```

## Step 2: Parse PDF File

Extract structured data from your PDF:

```bash
cd backend
python parse_pdf_experiences.py "path/to/CampusHire_Preuploaded_User_Experiences_v3.pdf" parsed_experiences.json
```

This will:
- Extract text from the PDF
- Parse experience sections
- Extract company, role, branch, package, rounds, questions, etc.
- Save structured data to `parsed_experiences.json`

**Note:** The parser uses pattern matching. You may need to adjust the regex patterns in `parse_pdf_experiences.py` based on your PDF structure.

## Step 3: Review Parsed Data

Check the generated JSON file to ensure data was extracted correctly:

```bash
# On Windows PowerShell
Get-Content parsed_experiences.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# On Linux/Mac
cat parsed_experiences.json | python -m json.tool
```

## Step 4: Upload Experiences

Upload all experiences to the database:

```bash
python upload_pdf_experiences.py parsed_experiences.json admin@campushire.ai your_admin_password
```

This will:
- Login as admin
- Upload each experience via admin API
- Mark experiences as pre-uploaded and verified
- Auto-approve and publish them
- Show progress and results

## Step 5: Verify Upload

1. Start the frontend: `cd frontend && npm run dev`
2. Login as admin
3. Go to Dashboard
4. You should see:
   - Company cards grouped by company name
   - Accordion UI with expandable company sections
   - Multiple user experiences within each company
   - Average package per company
   - Companies sorted by number of experiences (descending)

## Features

### Accordion Company Cards
- Click on a company card to expand and see all experiences
- Each experience shows:
  - Role, branch, package
  - Interview rounds count
  - Questions by category
  - Final result (Selected/Rejected)
  - "Verified" badge for pre-uploaded experiences

### Filtering
- **Search**: Filter by company name or role
- **Role**: Filter by job role (SDE, Analyst, Intern, etc.)
- **Branch**: Filter by branch (Computer Science, Electronics, etc.)
- **Difficulty**: Filter by interview difficulty (Easy, Medium, Hard)

### Admin Controls
- **Toggle Pre-uploaded**: Show/hide admin-verified experiences
- Only visible to admin users

### Statistics
- Average package per company
- Selection rate percentage
- Total number of experiences per company
- Number of selected candidates

## Data Structure

Each experience should include:
```json
{
  "company_name": "Company Name",
  "role": "Software Engineer",
  "package_offered": 1500000,
  "full_name": "Verified User",
  "linkedin_id": "N/A",
  "github_id": "N/A",
  "college_name": "College Name",
  "branch": "Computer Science",
  "bio": "Pre-uploaded verified experience",
  "interview_rounds": [
    {
      "round_name": "Round 1",
      "round_type": "Technical",
      "questions": ["Question 1?", "Question 2?"],
      "difficulty": "Medium"
    }
  ],
  "questions_asked": {
    "DSA": ["Question 1?", "Question 2?"],
    "Technical": ["Question 3?"]
  },
  "preparation_strategy": "Study DSA and system design...",
  "resources_followed": ["LeetCode", "GeeksforGeeks"],
  "final_result": "Selected",
  "is_anonymous": true,
  "is_preuploaded": true
}
```

## Troubleshooting

### PDF Parser Issues
- If extraction fails, check the PDF structure
- Adjust regex patterns in `parse_pdf_experiences.py`
- Try different PDF libraries (pdfplumber vs PyPDF2)

### Upload Errors
- Verify backend is running: `http://localhost:8000/health`
- Check admin credentials
- Review error messages in upload results JSON

### Missing Data
- Some fields may be optional
- Required fields: company_name, role, full_name, linkedin_id, github_id, college_name, branch, bio
- Backend will auto-populate missing fields with defaults

## Notes

- All pre-uploaded experiences are marked as:
  - `is_anonymous: true` (user information hidden)
  - `is_preuploaded: true` (admin verified)
  - `is_approved: true` (auto-approved)
  - `is_published: true` (visible to users)

- Experiences are grouped by company name
- Companies are sorted by total experience count (descending)
- Average package is calculated from all experiences with package data

## Support

For issues or questions, check:
- Backend logs: Check terminal running the backend server
- Frontend console: Check browser developer tools
- Database: Use SQLite browser to inspect `campushire.db`
