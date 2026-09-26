from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    message: str

@router.get("/health", response_model=HealthResponse)
async def health_check():
    # Will add Chroma DB checks later
    return HealthResponse(status="ok", message="IP-SHAKTI backend is running")
