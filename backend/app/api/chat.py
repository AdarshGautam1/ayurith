from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services.rag import process_chat

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    return process_chat(request)
