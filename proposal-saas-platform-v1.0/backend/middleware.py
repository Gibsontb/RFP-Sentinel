
from fastapi import Request
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Simulate extracting tenant_id from headers or auth
        tenant_id = request.headers.get("X-Tenant-ID")
        if not tenant_id:
            return JSONResponse(status_code=400, content={"error": "Missing X-Tenant-ID header"})

        request.state.tenant_id = tenant_id
        response = await call_next(request)
        return response
