"""
Simple test script to verify backend setup

Run after starting the server:
    python test_api.py
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"
token = None


def print_section(title: str):
    """Print section header"""
    print(f"\n{'='*50}")
    print(f"  {title}")
    print('='*50)


def test_health_check():
    """Test if server is running"""
    print_section("Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/api/ping")
        if response.status_code == 200:
            print("✅ Server is running!")
            print(f"   Response: {response.json()}")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Is it running?")
        print("   Start server with: uvicorn app.main:app --reload")
        return False


def test_login():
    """Test login endpoint"""
    print_section("Testing Login")
    global token
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={
                "username": "admin",
                "password": "admin123"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            user_info = data.get("user_info", {})
            print("✅ Login successful!")
            print(f"   User: {user_info.get('username')}")
            print(f"   Role: {user_info.get('role')}")
            print(f"   Token: {token[:30]}...")
            return True
        else:
            print(f"❌ Login failed with status {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return False


def test_get_schemas():
    """Test getting form schemas"""
    print_section("Testing Form Schemas")
    
    if not token:
        print("❌ No token available. Login first.")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/schemas",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            schemas = data.get("schemas", {})
            print("✅ Schemas retrieved successfully!")
            print(f"   Available modules: {', '.join(schemas.keys())}")
            return True
        else:
            print(f"❌ Failed to get schemas: {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_create_survey():
    """Test creating a survey"""
    print_section("Testing Survey Creation")
    
    if not token:
        print("❌ No token available. Login first.")
        return False
    
    survey_data = {
        "survey_id": "TEST_SURVEY_001",
        "panchayat_id": "PANCH_001",
        "village_name": "Test Village",
        "basic_info": {
            "village_name": "Test Village",
            "population": 5000,
            "households": 800
        },
        "completion_percentage": 30,
        "is_complete": False
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/surveys",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            json=survey_data
        )
        
        if response.status_code == 201:
            data = response.json()
            print("✅ Survey created successfully!")
            print(f"   Survey ID: {data.get('survey_id')}")
            print(f"   Village: {data.get('village_name')}")
            print(f"   Completion: {data.get('completion_percentage')}%")
            return True
        else:
            print(f"❌ Failed to create survey: {response.status_code}")
            print(f"   Response: {response.json()}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_get_surveys():
    """Test getting surveys"""
    print_section("Testing Get Surveys")
    
    if not token:
        print("❌ No token available. Login first.")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/surveys",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            surveys = response.json()
            print("✅ Surveys retrieved successfully!")
            print(f"   Total surveys: {len(surveys)}")
            for survey in surveys[:3]:  # Show first 3
                print(f"   - {survey.get('survey_id')}: {survey.get('village_name')} ({survey.get('completion_percentage')}%)")
            return True
        else:
            print(f"❌ Failed to get surveys: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def test_sync_status():
    """Test sync status endpoint"""
    print_section("Testing Sync Status")
    
    if not token:
        print("❌ No token available. Login first.")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/sync/status",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Sync status retrieved!")
            print(f"   Total surveys: {data.get('total')}")
            print(f"   Synced: {data.get('synced')}")
            print(f"   Pending: {data.get('pending')}")
            print(f"   Conflicts: {data.get('conflict')}")
            print(f"   Sync percentage: {data.get('sync_percentage')}%")
            return True
        else:
            print(f"❌ Failed to get sync status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def run_all_tests():
    """Run all API tests"""
    print("\n" + "="*50)
    print("  🧪 Sampark API Test Suite")
    print("="*50)
    
    results = {
        "Health Check": test_health_check(),
    }
    
    if not results["Health Check"]:
        print("\n❌ Server not running. Cannot continue tests.")
        return
    
    results["Login"] = test_login()
    
    if results["Login"]:
        results["Get Schemas"] = test_get_schemas()
        results["Create Survey"] = test_create_survey()
        results["Get Surveys"] = test_get_surveys()
        results["Sync Status"] = test_sync_status()
    
    # Summary
    print_section("Test Summary")
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your backend is working perfectly!")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        print("   Make sure you ran: python seed_data.py")


if __name__ == "__main__":
    run_all_tests()
