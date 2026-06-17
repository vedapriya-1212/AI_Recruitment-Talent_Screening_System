import os
import datetime
from datetime import timedelta
from jose import jwt
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from absolute path
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://bpljomioocweydydzctn.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

# Check if environment is configured for mock execution
is_mock_env = (
    not SUPABASE_KEY 
    or SUPABASE_KEY == "your_supabase_anon_key_here"
    or SUPABASE_KEY == "your-actual-anon-key-here"
    or "your_" in SUPABASE_KEY
)

# Global in-memory user store for mock mode
MOCK_USERS = {}

class MockTable:
    def __init__(self, table_name):
        self.table_name = table_name
        self.query_filters = []
        self.pending_insert = None
        self.pending_update = None
        self.pending_delete = False
        
    def select(self, columns):
        return self
        
    def eq(self, column, value):
        self.query_filters.append((column, value))
        return self
        
    def execute(self):
        global MOCK_USERS
        
        class MockResponse:
            def __init__(self, data):
                self.data = data
                
        # Handle insert
        if self.pending_insert is not None:
            data = self.pending_insert
            user_id = data.get("id")
            if not user_id:
                import uuid
                user_id = str(uuid.uuid4())
                data["id"] = user_id
            data["created_at"] = str(datetime.datetime.now())
            MOCK_USERS[user_id] = data
            self.pending_insert = None
            self.query_filters = []
            return MockResponse([data])
            
        # Handle update
        if self.pending_update is not None:
            updated_data = []
            for uid, user in list(MOCK_USERS.items()):
                match = True
                for col, val in self.query_filters:
                    if str(user.get(col)) != str(val):
                        match = False
                        break
                if match:
                    user.update(self.pending_update)
                    updated_data.append(user)
            self.pending_update = None
            self.query_filters = []
            return MockResponse(updated_data)
            
        # Handle delete
        if self.pending_delete:
            deleted_data = []
            for uid, user in list(MOCK_USERS.items()):
                match = True
                for col, val in self.query_filters:
                    if str(user.get(col)) != str(val):
                        match = False
                        break
                if match:
                    deleted_data.append(user)
                    del MOCK_USERS[uid]
            self.pending_delete = False
            self.query_filters = []
            return MockResponse(deleted_data)
            
        # Default select/query
        filtered_users = list(MOCK_USERS.values())
        for col, val in self.query_filters:
            filtered_users = [u for u in filtered_users if str(u.get(col)) == str(val)]
            
        self.query_filters = []
        return MockResponse(filtered_users)

    def insert(self, data):
        self.pending_insert = data
        return self

    def update(self, data):
        self.pending_update = data
        return self

    def delete(self):
        self.pending_delete = True
        return self

class MockAuth:
    def sign_up(self, credentials):
        email = credentials.get("email").strip().lower()
        
        for u in MOCK_USERS.values():
            if u.get("email") == email:
                raise Exception("Email already registered")
                
        import uuid
        user_id = str(uuid.uuid4())
        
        class MockAuthUser:
            def __init__(self, id, email):
                self.id = id
                self.email = email
                
        class MockAuthResponse:
            def __init__(self, user):
                self.user = user
                
        return MockAuthResponse(MockAuthUser(user_id, email))
        
    def sign_in_with_password(self, credentials):
        email = credentials.get("email").strip().lower()
        password = credentials.get("password")
        
        user = None
        for u in MOCK_USERS.values():
            if u.get("email") == email:
                user = u
                break
                
        if not user:
            raise Exception("Invalid email or password")
            
        SECRET_KEY = os.getenv("JWT_SECRET", "8e92f3922c07156ae2387192aef3724c968f9a2b8e3a24d55b0df10df8502f9c")
        token_data = {
            "sub": user["id"],
            "email": user["email"],
            "role": user["role"]
        }
        expire = datetime.datetime.utcnow() + timedelta(minutes=60)
        token_data.update({"exp": expire})
        access_token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
        
        class MockSession:
            def __init__(self, access_token):
                self.access_token = access_token
                
        class MockAuthUser:
            def __init__(self, id, email):
                self.id = id
                self.email = email
                
        class MockAuthResponse:
            def __init__(self, session, user):
                self.session = session
                self.user = user
                
        return MockAuthResponse(MockSession(access_token), MockAuthUser(user["id"], user["email"]))
        
    def get_user(self, token: str):
        SECRET_KEY = os.getenv("JWT_SECRET", "8e92f3922c07156ae2387192aef3724c968f9a2b8e3a24d55b0df10df8502f9c")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            email = payload.get("email")
            
            class MockAuthUser:
                def __init__(self, id, email):
                    self.id = id
                    self.email = email
                    
            class MockAuthResponse:
                def __init__(self, user):
                    self.user = user
                    
            return MockAuthResponse(MockAuthUser(user_id, email))
        except Exception as e:
            raise Exception(f"Invalid mock session: {str(e)}")

class MockSupabaseClient:
    def table(self, table_name):
        return MockTable(table_name)
        
    @property
    def auth(self):
        return MockAuth()

# Initialize Client
if is_mock_env:
    print("Warning: Real SUPABASE_KEY / SUPABASE_ANON_KEY is not configured.")
    print("Initializing Mock In-Memory Supabase Client for local execution...")
    supabase = MockSupabaseClient()
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase client successfully.")
    except Exception as e:
        print(f"Error creating real Supabase client: {e}.")
        print("Initializing Mock In-Memory Supabase Client as fallback...")
        supabase = MockSupabaseClient()
