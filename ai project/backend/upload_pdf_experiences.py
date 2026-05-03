"""
Bulk upload script for pre-uploaded experiences from PDF
Uploads experiences via admin API
"""
import json
import requests
import sys
import time
from typing import List, Dict, Any

# Backend API URL
BASE_URL = "http://localhost:8000"
ADMIN_LOGIN_URL = f"{BASE_URL}/api/v1/admin/login"
ADMIN_CREATE_EXPERIENCE_URL = f"{BASE_URL}/api/v1/admin/experiences/create"

def login_as_admin(email: str, password: str) -> int:
    """Login as admin and return admin_id"""
    response = requests.post(ADMIN_LOGIN_URL, json={
        "email": email,
        "password": password
    })
    
    if response.status_code != 200:
        raise Exception(f"Admin login failed: {response.text}")
    
    data = response.json()
    return data.get("admin_id")

def upload_experience(experience: Dict[str, Any]) -> Dict[str, Any]:
    """Upload a single experience via admin API"""
    headers = {
        "Content-Type": "application/json"
    }
    
    # Remove is_preuploaded from request (will be handled by backend)
    upload_data = {k: v for k, v in experience.items() if k != 'is_preuploaded'}
    
    response = requests.post(ADMIN_CREATE_EXPERIENCE_URL, json=upload_data, headers=headers)
    
    if response.status_code not in [200, 201]:
        error_msg = response.text
        try:
            error_data = response.json()
            error_msg = error_data.get('detail', error_msg)
        except:
            pass
        raise Exception(f"Upload failed: {error_msg}")
    
    return response.json()

def upload_experiences_bulk(
    experiences: List[Dict[str, Any]],
    admin_email: str,
    admin_password: str,
    delay: float = 0.5
) -> Dict[str, Any]:
    """Upload multiple experiences"""
    print(f"Verifying admin credentials: {admin_email}")
    try:
        admin_id = login_as_admin(admin_email, admin_password)
        print(f"✅ Admin login successful (Admin ID: {admin_id})\n")
    except Exception as e:
        print(f"❌ Admin login failed: {e}")
        print("\nNote: Admin endpoints may not require authentication.")
        print("Attempting to upload without authentication...\n")
    
    results = {
        'success': [],
        'failed': [],
        'total': len(experiences)
    }
    
    for i, experience in enumerate(experiences, 1):
        company = experience.get('company_name', 'Unknown')
        role = experience.get('role', 'Unknown')
        
        print(f"[{i}/{len(experiences)}] Uploading: {company} - {role}...", end=" ")
        
        try:
            uploaded = upload_experience(experience)
            results['success'].append({
                'index': i,
                'company': company,
                'role': role,
                'id': uploaded.get('id')
            })
            print("✅ Success")
        except Exception as e:
            error_msg = str(e)
            results['failed'].append({
                'index': i,
                'company': company,
                'role': role,
                'error': error_msg
            })
            print(f"❌ Failed: {error_msg}")
        
        # Small delay to avoid overwhelming the server
        if i < len(experiences):
            time.sleep(delay)
    
    return results

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python upload_pdf_experiences.py <json_file> <admin_email> <admin_password>")
        print("\nExample:")
        print("  python upload_pdf_experiences.py parsed_experiences.json admin@campushire.ai password123")
        sys.exit(1)
    
    json_file = sys.argv[1]
    admin_email = sys.argv[2]
    admin_password = sys.argv[3]
    
    try:
        # Load experiences from JSON
        print(f"Loading experiences from: {json_file}")
        with open(json_file, 'r', encoding='utf-8') as f:
            experiences = json.load(f)
        
        print(f"Found {len(experiences)} experiences to upload\n")
        
        # Upload experiences
        results = upload_experiences_bulk(experiences, admin_email, admin_password)
        
        # Print summary
        print("\n" + "="*60)
        print("UPLOAD SUMMARY")
        print("="*60)
        print(f"Total: {results['total']}")
        print(f"✅ Successful: {len(results['success'])}")
        print(f"❌ Failed: {len(results['failed'])}")
        
        if results['failed']:
            print("\nFailed uploads:")
            for fail in results['failed']:
                print(f"  - {fail['company']} - {fail['role']}: {fail['error']}")
        
        # Save results
        results_file = json_file.replace('.json', '_upload_results.json')
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)
        print(f"\n📄 Results saved to: {results_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
