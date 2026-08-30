from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import hashlib
import time
import os

AUDIT_LOG_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../reports/audit_chain.log"))

class HashChainAuditMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.last_hash = "0000000000000000000000000000000000000000000000000000000000000000"
        
        # Ensure dir exists
        os.makedirs(os.path.dirname(AUDIT_LOG_FILE), exist_ok=True)
        # Load last hash if file exists
        if os.path.exists(AUDIT_LOG_FILE):
            with open(AUDIT_LOG_FILE, "r") as f:
                lines = f.readlines()
                if lines:
                    last_line = lines[-1]
                    try:
                        self.last_hash = last_line.split(" | ")[-1].strip()
                    except:
                        pass

    async def dispatch(self, request: Request, call_next):
        # We perform the call next first
        response = await call_next(request)
        
        # Only log API calls
        if request.url.path.startswith("/api/"):
            # Extract basic info
            timestamp = str(time.time())
            method = request.method
            path = request.url.path
            
            # Simple identity stub (would extract from JWT in real app via request.state if we injected it)
            user = request.client.host if request.client else "unknown"
            
            # Create payload block
            payload = f"{timestamp}|{method}|{path}|{user}|{self.last_hash}"
            
            # Hash the payload
            current_hash = hashlib.sha256(payload.encode()).hexdigest()
            self.last_hash = current_hash
            
            # Write to log
            log_entry = f"{timestamp} | {method} | {path} | {user} | {current_hash}\n"
            with open(AUDIT_LOG_FILE, "a") as f:
                f.write(log_entry)
                
        return response
