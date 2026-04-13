# Ultra Doc-Intelligence 🚢 🤖

[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/Mohitsharma1214/Ultra-Doc-Intelligence)
[![Vercel](https://img.shields.io/badge/Vercel-Hosted_UI-black?logo=vercel)](https://ultra-doc-intelligence-orpin.vercel.app/)

An institutional-grade logistics intelligence system designed for automated document analysis. This platform enables high-precision RAG-based Q&A, structured data extraction, and real-time confidence scoring for transportation and logistics documentation.

---

## 🔗 Project Links

*   **GitHub Repository**: [Mohitsharma1214/Ultra-Doc-Intelligence](https://github.com/Mohitsharma1214/Ultra-Doc-Intelligence)
*   **Hosted UI**: [ultra-doc-intelligence.vercel.app](https://ultra-doc-intelligence-orpin.vercel.app/)

---

## 🏗️ Architecture

The system utilizes a decoupled, high-performance architecture:

*   **Backend**: 
    *   **Framework**: FastAPI (Python) for asynchronous orchestration.
    *   **Vector Database**: **ChromaDB** with persistent storage for localized document context.
    *   **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` via Hugging Face Inference API (lightweight, zero-footprint).
    *   **LLM Core**: Large Language Models (e.g., Llama 3/Gemini) integrated via **OpenRouter** for robust reasoning.
*   **Frontend**: 
    *   **Framework**: React (Vite) + TypeScript.
    *   **Styling**: Premium Glassmorphism UI with Framer Motion animations and Lucide-React icons.

---

## 🔬 Core AI Strategies

### 1. Chunking Strategy
*   **Method**: `RecursiveCharacterTextSplitter`.
*   **Logic**: Splits text by paragraphs, then sentences, and finally characters to preserve semantic boundaries.
*   **Specs**: 
    *   `chunk_size`: 1000 characters.
    *   `chunk_overlap`: 200 characters.
*   **Rationale**: High overlap ensures that cross-chunk entities (like a freight rate appearing at a split) are captured in at least one full context window, maintaining extraction accuracy.

### 2. Retrieval Method
*   **Semantic Filtering**: Uses Cosine Similarity via ChromaDB.
*   **Strict Isolation**: Retrieval is strictly filtered by `document_id` in metadata to prevent cross-document context leakage.
*   **Top-K**: Retrieves the top 8 chunks to provide high density for complex logistics documents.

### 3. Guardrails Approach
*   **Prompt-Level**: "STRICTLY GROUNDED" rules force the LLM to refuse answers not explicitly found in text.
*   **Confident Refusal**: If the LLM returns "Not found," the system bypasses the UI and indicates no results.
*   **Hallucination Filter**: A runtime threshold of **0.35** is applied. If the calculated confidence is lower, the system returns a standard refusal message rather than a potentially incorrect answer.

### 4. Confidence Scoring Method (Hybrid)
We use a weighted hybrid algorithm to determine reliability:
*   **Retrieval Distance (40%)**: Normalized similarity score from the vector store.
*   **LLM Self-Assessment (60%)**: Internal model certainty based on textual evidence.
*   **Hard Logic**: Forced 0.0 confidence if "found" signatures are absent.

---

## 🛠️ Local Setup Instructions

### Backend (Python)
1.  **Clone & Enter**:
    ```bash
    git clone https://github.com/Mohitsharma1214/Ultra-Doc-Intelligence.git
    cd Ultra-Doc-Intelligence/backend
    ```
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Environment Setup**: Create a `.env` file:
    ```env
    OPENROUTER_API_KEY=your_api_key_here
    LLM_MODEL=google/gemini-flash-1.5
    HUGGINGFACEHUB_API_TOKEN=your_hf_token_here
    ```
4.  **Run**:
    ```bash
    python -m app.main
    ```

### Frontend (React)
1.  **Enter UI Dir**:
    ```bash
    cd ../ui
    ```
2.  **Install**:
    ```bash
    npm install
    ```
3.  **Dev Run**:
    ```bash
    npm run dev
    ```

---

## 📉 Failure Cases & Improvements

### Current Failure Cases
1.  **Non-OCR PDFs**: Documents that are pure images without text layers (scanned PDFs) will fail text extraction.
2.  **Overlapping IDs**: When multiple different Shipment IDs exist in the same document with conflicting labels.

### Future Improvement Ideas
1.  **OCR Layer**: Integrate Tesseract or AWS Textract to handle scanned documents.
2.  **Hybrid BM25**: Combine semantic search with keyword search for better alphanumeric ID matching.
3.  **Multi-Modal**: Use vision models to "see" document structure (tables, signatures) directly.
