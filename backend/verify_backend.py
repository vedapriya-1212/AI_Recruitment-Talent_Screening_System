import os
import sys
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app
    print("Success: Imported FastAPI app successfully.")
except Exception as e:
    print(f"Error: Failed to import app: {e}")
    sys.exit(1)

client = TestClient(app)

def run_tests():
    print("\n--- Starting Backend Verification Tests ---")
    
    # 1. Test health check
    res = client.get("/")
    print(f"Health Check Status: {res.status_code}")
    assert res.status_code == 200, "Health check failed"
    assert "status" in res.json(), "Invalid health response"
    print("  Root health check passed.")

    # 2. Test registration validations (REG-002 to REG-011)
    validation_test_cases = [
        # REG-002: Empty First Name
        {
            "payload": {"first_name": "", "last_name": "Doe", "email": "reg002@test.com", "password": "Password@123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-002: Empty First Name"
        },
        # REG-003: Empty Last Name
        {
            "payload": {"first_name": "John", "last_name": "", "email": "reg003@test.com", "password": "Password@123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-003: Empty Last Name"
        },
        # REG-004: Empty Email
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "", "password": "Password@123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-004: Empty Email"
        },
        # REG-005: Empty Password
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "reg005@test.com", "password": "", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-005: Empty Password"
        },
        # REG-006: Invalid Email Format
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "invalid_email_format", "password": "Password@123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-006: Invalid Email Format"
        },
        # REG-007: Short Password (< 8 chars)
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "reg007@test.com", "password": "Pass@1", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-007: Short Password"
        },
        # REG-008: Password without Uppercase
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "reg008@test.com", "password": "password@123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-008: Password without Uppercase"
        },
        # REG-009: Password without Lowercase
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "reg009@test.com", "password": "PASSWORD@123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-009: Password without Lowercase"
        },
        # REG-010: Password without Number
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "reg010@test.com", "password": "Password@", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-010: Password without Number"
        },
        # REG-011: Password without Special Character
        {
            "payload": {"first_name": "John", "last_name": "Doe", "email": "reg011@test.com", "password": "Password123", "role": "candidate"},
            "expected_status": 400,
            "description": "REG-011: Password without Special Character"
        }
    ]

    for tc in validation_test_cases:
        res = client.post("/register", json=tc["payload"])
        print(f"Validation Test ({tc['description']}) Status: {res.status_code}, Response: {res.text}")
        assert res.status_code == tc["expected_status"], f"{tc['description']} failed. Expected {tc['expected_status']}, got {res.status_code}"
    print("  All registration validation test cases passed.")

    # 3. Test successful registration (REG-001)
    import random
    rand_id = random.randint(1000, 9999)
    email = f"test_candidate_{rand_id}@example.com"
    password = "SecuredPassword@123"
    
    reg_payload = {
        "first_name": "Test",
        "last_name": "Candidate",
        "email": email,
        "password": password,
        "role": "candidate"
    }
    res = client.post("/register", json=reg_payload)
    print(f"Register Status: {res.status_code}")
    assert res.status_code == 201, f"Registration failed: {res.text}"
    print("  User registration passed.")

    # 4. Test login
    login_payload = {
        "email": email,
        "password": password
    }
    res = client.post("/login", json=login_payload)
    print(f"Login Status: {res.status_code}")
    assert res.status_code == 200, f"Login failed: {res.text}"
    token_data = res.json()
    assert "access_token" in token_data, "Token missing in login response"
    token = token_data["access_token"]
    print("  User login passed.")

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Test dashboard
    res = client.get("/dashboard", headers=headers)
    print(f"Dashboard Metrics Status: {res.status_code}")
    assert res.status_code == 200, f"Dashboard failed: {res.text}"
    dash_data = res.json()
    assert "total_applications" in dash_data, "Invalid dashboard response"
    print("  Dashboard metrics passed.")

    # 5. Test jobs retrieval
    res = client.get("/jobs", headers=headers)
    print(f"List Jobs Status: {res.status_code}")
    assert res.status_code == 200, f"Jobs list failed: {res.text}"
    jobs = res.json()
    assert isinstance(jobs, list), "Jobs response is not a list"
    print(f"  List jobs passed. Retrieved {len(jobs)} jobs.")

    # 6. Test profile retrieve
    res = client.get("/profile", headers=headers)
    print(f"Get Profile Status: {res.status_code}")
    assert res.status_code == 200, f"Get profile failed: {res.text}"
    profile = res.json()
    assert profile["email"] == email, "Email mismatch in profile"
    print("  Get candidate profile passed.")

    # 7. Test profile update
    update_payload = {
        "phone": "+1-555-0999",
        "summary": "Verified Automation Test Profile summary.",
        "skills": ["Python", "FastAPI", "Supabase", "React"]
    }
    res = client.put("/profile", json=update_payload, headers=headers)
    print(f"Update Profile Status: {res.status_code}")
    assert res.status_code == 200, f"Update profile failed: {res.text}"
    profile_updated = res.json()
    assert profile_updated["phone"] == "+1-555-0999", "Phone update failed"
    assert "Python" in profile_updated["skills"], "Skills update failed"
    print("  Update candidate profile passed.")

    # 8. Test notifications list
    res = client.get("/notifications", headers=headers)
    print(f"Get Notifications Status: {res.status_code}")
    assert res.status_code == 200, f"Get notifications failed: {res.text}"
    print("  Get notifications list passed.")

    print("\n--- Backend Verification SUCCESS: All tests passed successfully! ---")

if __name__ == "__main__":
    # Install httpx if missing (TestClient dependency)
    try:
        import httpx
    except ImportError:
        print("Installing httpx dependency for TestClient...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "httpx"])
        
    run_tests()
