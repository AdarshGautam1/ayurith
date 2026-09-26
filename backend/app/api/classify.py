from fastapi import APIRouter
from app.models.schemas import ClassifyRequest, ClassificationResult
from app.services.classifier import process_classification

router = APIRouter()

@router.post("/classify", response_model=ClassificationResult)
async def classify_endpoint(request: ClassifyRequest):
    return process_classification(request)
