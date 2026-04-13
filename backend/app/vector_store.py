import chromadb
from chromadb.utils import embedding_functions
import os
from typing import List, Dict

class VectorStore:
    def __init__(self, db_path: str = "db"):
        self.client = chromadb.PersistentClient(path=db_path)
        # Using a standard local embedding function
        self.ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

    def create_collection(self, collection_name: str):
        try:
            return self.client.create_collection(name=collection_name, embedding_function=self.ef)
        except Exception:
            return self.client.get_collection(name=collection_name, embedding_function=self.ef)

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
