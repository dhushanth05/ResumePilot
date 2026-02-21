#!/usr/bin/env python3
"""
Test script for the POST /jobs endpoint
This script demonstrates the API usage and validates the response format.
"""

import json
import requests
from typing import Dict, Any

# Test data
TEST_JOB = {
    "title": "Senior Backend Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "employment_type": "Full-time",
    "experience_level": "Senior Level",
    "work_mode": "Remote",
    "salary_range": "$150k - $200k",
    "tech_stack": ["Python", "Django", "PostgreSQL", "Docker", "AWS"],
    "description_text": """We are looking for a Senior Backend Engineer to join our team. 
    You will be responsible for designing and implementing scalable backend services, 
    working with Python and Django, managing PostgreSQL databases, and deploying applications 
    using Docker and AWS. The ideal candidate has 5+ years of experience in backend development 
    and is familiar with cloud technologies and microservices architecture."""
}

def test_create_job_description(base_url: str = "http://localhost:8000") -> Dict[str, Any]:
    """
    Test the POST /jobs endpoint
    
    Args:
        base_url: Base URL of the API
        
    Returns:
        Response data from the API
    """
    url = f"{base_url}/api/v1/jobs"
    headers = {
        "Content-Type": "application/json",
        # Note: In a real test, you would need to include authentication headers
        # "Authorization": "Bearer your_token_here"
    }
    
    try:
        print(f"Testing POST {url}")
        print(f"Request data: {json.dumps(TEST_JOB, indent=2)}")
        
        response = requests.post(url, json=TEST_JOB, headers=headers)
        
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"\n✅ Success! Response data:")
            print(json.dumps(data, indent=2))
            
            # Validate response structure
            required_fields = ["message", "job", "status_code"]
            for field in required_fields:
                if field not in data:
                    print(f"❌ Missing required field: {field}")
                else:
                    print(f"✅ Found required field: {field}")
            
            # Validate job object structure
            if "job" in data:
                job = data["job"]
                job_fields = ["id", "title", "company", "location", "tech_stack", "word_count", "created_at"]
                for field in job_fields:
                    if field in job:
                        print(f"✅ Job has field: {field}")
                    else:
                        print(f"❌ Job missing field: {field}")
            
            return data
            
        elif response.status_code == 401:
            print("❌ Authentication required. This is expected without proper auth headers.")
            print(f"Response: {response.text}")
            
        elif response.status_code == 422:
            print("❌ Validation error")
            print(f"Response: {response.text}")
            
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error. Make sure the API server is running.")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
    except json.JSONDecodeError:
        print("❌ Invalid JSON response")
        print(f"Raw response: {response.text}")
    
    return {}

def test_validation_errors(base_url: str = "http://localhost:8000") -> None:
    """Test various validation scenarios"""
    url = f"{base_url}/api/v1/jobs"
    headers = {"Content-Type": "application/json"}
    
    test_cases = [
        {
            "name": "Empty title",
            "data": {**TEST_JOB, "title": ""},
            "expected_error": "title"
        },
        {
            "name": "Short description",
            "data": {**TEST_JOB, "description_text": "Too short"},
            "expected_error": "description"
        },
        {
            "name": "Too many tech stack items",
            "data": {**TEST_JOB, "tech_stack": [f"tech{i}" for i in range(25)]},
            "expected_error": "tech stack"
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        try:
            response = requests.post(url, json=test_case["data"], headers=headers)
            if response.status_code == 422:
                print(f"✅ Validation error caught: {response.status_code}")
                print(f"Response: {response.text}")
            else:
                print(f"❌ Expected 422, got {response.status_code}")
        except Exception as e:
            print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    print("🚀 Testing POST /jobs endpoint")
    print("=" * 50)
    
    # Test successful creation (will fail without auth, but shows structure)
    test_create_job_description()
    
    print("\n" + "=" * 50)
    print("🧪 Testing validation scenarios")
    print("=" * 50)
    
    # Test validation errors
    test_validation_errors()
    
    print("\n✨ Test complete!")
    print("\n📝 Note: The API requires authentication. In a real application:")
    print("   1. Get a JWT token from POST /api/v1/auth/login")
    print("   2. Include it in the Authorization header: Bearer <token>")
    print("   3. The test above shows the expected structure and validation")
