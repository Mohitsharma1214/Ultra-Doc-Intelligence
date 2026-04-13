from pydantic import BaseModel
from typing import List, Optional, Any

class QuestionRequest(BaseModel):
    document_id: str
    question: str

class ExtractionRequest(BaseModel):
    document_id: str

class QuestionResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence_score: float

class ExtractionResponse(BaseModel):
    shipment_id: Optional[Any] = None
    shipper: Optional[Any] = None
    consignee: Optional[Any] = None
    pickup_datetime: Optional[Any] = None
    delivery_datetime: Optional[Any] = None
    equipment_type: Optional[Any] = None
    mode: Optional[Any] = None
    rate: Optional[Any] = None
    currency: Optional[Any] = None
    weight: Optional[Any] = None
    carrier_name: Optional[Any] = None

class Message(BaseModel):
    message: str
    document_id: Optional[str] = None
