import os
import chromadb
from typing import List, Dict
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from chromadb import EmbeddingFunction

class LCAdapter(EmbeddingFunction):
    def __init__(self, ef):
        self.ef = ef
    def __call__(self, input):
        return self.ef.embed_documents(input)
    def name(self):
        return "langchain_adapter"

class VectorStore:
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = os.path.join("/tmp", "db")
        self.client = chromadb.PersistentClient(path=db_path)
        # Using Hugging Face Inference API (lightweight, no torch/sentence-transformers)
        # Ensure HUGGINGFACEHUB_API_TOKEN is set in Vercel environment variables
        self.ef = LCAdapter(HuggingFaceEndpointEmbeddings(
            model="sentence-transformers/all-MiniLM-L6-v2",
            huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN")
        ))

    def create_collection(self, collection_name: str):
        return self.client.get_or_create_collection(name=collection_name, embedding_function=self.ef)

    def add_chunks(self, collection_name: str, chunks: List[str], doc_id: str):
        collection = self.create_collection(collection_name)
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [{"source": doc_id, "chunk_index": i} for i in range(len(chunks))]
        collection.add(
            documents=chunks,
            ids=ids,
            metadatas=metadatas
        )

    def query(self, collection_name: str, query_text: str, doc_id: str, n_results: int = 5) -> Dict:
        collection = self.create_collection(collection_name)
        return collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where={"source": doc_id}  # Strictly filter by the uploaded document ID
        )
