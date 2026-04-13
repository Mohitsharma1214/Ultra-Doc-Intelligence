import os
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv() # Load variables from .env
from .models import QuestionRequest, QuestionResponse, ExtractionResponse, Message, ExtractionRequest
from .processor import DocumentProcessor
from .vector_store import VectorStore
from .llm_service import LLMService

app = FastAPI(title="Ultra Doc-Intelligence API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join("/tmp", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

processor = DocumentProcessor()
vector_store = VectorStore()
llm_service = LLMService()

@app.post("/upload", response_model=Message)
async def upload_document(file: UploadFile = File(...)):
    # Save file
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}{file_ext}")
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    
    # Process document
    try:
        text = processor.extract_text(file_path)
        chunks = processor.chunk_text(text)
        vector_store.add_chunks("docs", chunks, file_id)
        
        # Store metadata mapping (in-memory for POC)
        # In a real app, use a DB to link file_id to original name
        
        return Message(message="Document processed and indexed.", document_id=file_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask", response_model=QuestionResponse)
async def ask_question(request: QuestionRequest):
    # Retrieve relevant chunks - Filtered by document_id
    results = vector_store.query("docs", request.question, request.document_id)
    
    if not results['documents'][0]:
        return QuestionResponse(answer="No relevant context found.", sources=[], confidence_score=0.0)
    
    context_chunks = results['documents'][0]
    # In ChromaDB, distances are returned. Lower distance = higher similarity.
    distances = results['distances'][0] if 'distances' in results else [0.5] * len(context_chunks)
    
    # Generate answer
    qa_result = llm_service.answer_question(request.question, context_chunks, distances)
    
    # Hallucination Guardrail: Refuse to answer if confidence is too low
    threshold = 0.35
    if qa_result["confidence"] < threshold:
        return QuestionResponse(
            answer="I'm sorry, but I cannot find a sufficiently confident answer in the document for this question.",
            sources=context_chunks,
            confidence_score=qa_result["confidence"]
        )

    return QuestionResponse(
        answer=qa_result["answer"],
        sources=context_chunks,
        confidence_score=qa_result["confidence"]
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "environment": os.getenv("VERCEL_ENV", "local")}

@app.post("/extract", response_model=ExtractionResponse)
async def extract_data(request: ExtractionRequest):
    document_id = request.document_id
    try:
        collection = vector_store.create_collection("docs")
        results = collection.get(where={"source": document_id})
        
        if not results or not results['documents']:
            raise HTTPException(
                status_code=404, 
                detail=f"Document {document_id} not found in temporary storage. (Note: Vercel /tmp is ephemeral)"
            )
        
        full_text = "\n".join(results['documents'])
        return llm_service.extract_structured_data(full_text)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
