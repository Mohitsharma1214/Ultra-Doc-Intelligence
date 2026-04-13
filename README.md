# Ultra Doc-Intelligence PoC

A professional AI-powered system for logistics document processing and natural language interaction. This POC allows users to upload logistics documents (PDF, DOCX, TXT), perform RAG-based Q&A, and extract structured shipment data.

## Architecture

The system follows a modern decoupled architecture:
- **Backend**: FastAPI (Python) serving as the orchestration layer for document parsing, embedding generation, and LLM interaction.
- **Vector Storage**: ChromaDB (local persistence) for storing and retrieving document chunks.
- **Frontend**: React (Typescript) + Vite for a premium, responsive user interface with glassmorphism design.
- **AI Core**: 
  - **Embeddings**: `all-MiniLM-L6-v2` (SentenceTransformers) for efficient local similarity search.
  - **LLM**: Google Gemini 1.5 Flash for high-quality reasoning, grounded Q&A, and structured extraction.

## Core Strategies

### Chunking Strategy
- **Method**: Recursive Character Text Splitting.
- **Parameters**: 1000 characters per chunk with a 200-character overlap.
- **Rationale**: Recursive splitting preserves semantic structure (paragraphs, sentences) better than fixed-size splitting, while the overlap ensures context continuity across chunk boundaries, essential for extracting dates and rates that might span limits.

### Retrieval Method
- **Method**: Semantic Search using Cosine Similarity/L2 Distance.
- **Top-K**: The top 4 most relevant chunks are retrieved for every query to balance context richness and token efficiency.

### Guardrails Approach
- **Context Grounding**: The LLM is strictly prompted to answer ONLY from the provided context.
- **Negative Constraint**: Express instructions to return "Not found in document" if the information is missing.
- **Confidence Filter**: Answers with a heuristic confidence score below a threshold (or those explicitly stating "not found") are flagged to prevent hallucinations.

### Confidence Scoring Method
The confidence score is a multi-factor heuristic:
1. **Retrieval Similarity**: Based on the distance scores from ChromaDB. Lower distances translate to higher base confidence.
2. **Answer Coverage**: If the LLM indicates it cannot find the information, the confidence is set to 0.0.
3. **Normalization**: Scores are normalized to a 0-1 scale.

## Failure Cases
1. **Highly Complex Tables**: While Gemini 1.5 Flash is excellent at reasoning, extremely dense or poorly formatted OCR data in PDFs might lead to misaligned extraction of table headers.
2. **Missing Metadata**: If a document is scanned without OCR (image-only), text extraction may fail unless an OCR layer is added (not included in this base POC).

## Improvement Ideas
- **Hybrid Search**: Combine semantic search with BM25 keyword search for better retrieval of specific IDs like `SHIP-123456`.
- **Iterative Q&A**: Implement a multi-turn conversation memory.
- **OCR Integration**: Add Tesseract or AWS Textract for handling scanned image PDFs.
- **Self-Correction**: Use a second LLM pass to verify the extracted JSON against the source text.

## Setup & Running

### Prerequisites
- Python 3.9+
- Node.js & npm
- OpenRouter API Key (`OPENROUTER_API_KEY`)

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. Set environment variable: `export OPENROUTER_API_KEY='your_key'`
4. `python -m app.main`

### UI
1. `cd ui`
2. `npm install`
3. `npm run dev`
# Ultra-Doc-Intelligence
