import os
from openai import OpenAI
from typing import List, Dict, Optional
import json
from .models import ExtractionResponse

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model_name = os.getenv("LLM_MODEL")
        
        if self.api_key:
            self.client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
            )
        else:
            self.client = None

    def _is_ready(self):
        return self.client is not None

    def answer_question(self, question: str, context_chunks: List[str], similarity_scores: List[float]) -> Dict:
        if not self._is_ready():
            return {"answer": "OpenRouter API key not configured.", "confidence": 0.0}

        context = "\n---\n".join(context_chunks)
        
        prompt = f"""
        You are an expert Logistics and Transportation Operations Specialist. 
        Your task is to answer questions about a shipment based ONLY on the provided document context.

        CRITICAL RULES:
        1. Base your answer STRICTLY on the text provided below. 
        2. If the answer is not present or you are unsure, say "Not found in document".
        3. Pay close attention to alphanumeric IDs, dates, and currency values.
        4. If the question asks for a specific ID (like Load ID), look for labels like 'Load #', 'BOL', or 'Tracking'.
        
        Provide your response in JSON format with two keys:
        - "answer": Your detailed answer based on context.
        - "confidence": A float between 0 and 1 representing how explicitly the answer was found in the text.

        CONTEXT:
        {context}
        
        QUESTION: {question}
        
        JSON Response:
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )
            res_data = json.loads(response.choices[0].message.content.strip())
            answer = res_data.get("answer", "Error generating answer.")
            llm_confidence = float(res_data.get("confidence", 0.0))
            
            # Hybrid confidence: 50% Retrieval Similarity, 50% LLM Self-Assessment
            final_confidence = self._calculate_hybrid_confidence(answer, llm_confidence, similarity_scores)
            
            return {"answer": answer, "confidence": final_confidence}
        except Exception as e:
            print(f"OpenRouter Error: {e}")
            return {"answer": f"Error: {str(e)}", "confidence": 0.0}

    def _calculate_hybrid_confidence(self, answer: str, llm_conf: float, similarity_scores: List[float]) -> float:
        # Heuristic retrieval score (lower distance is better)
        avg_dist = sum(similarity_scores) / len(similarity_scores) if similarity_scores else 1.0
        retrieval_score = max(0.0, 1.0 - (avg_dist / 1.5)) # Adjust scale for ChromaDB distances
        
        # Hard check for "not found"
        if "not found" in answer.lower():
            return 0.0
            
        # Combine scores
        hybrid_score = (llm_conf * 0.6) + (retrieval_score * 0.4)
        return round(min(1.0, hybrid_score), 2)

    def extract_structured_data(self, text: str) -> ExtractionResponse:
        if not self._is_ready():
            return ExtractionResponse()

        prompt = f"""
        Extract the following logistics data from the text below. 
        Return it strictly as a JSON object with these keys: 
        - shipment_id (also look for Load ID, BOL #, Tracking #)
        - shipper (name and address)
        - consignee (name and address)
        - pickup_datetime (date and time if available)
        - delivery_datetime (date and time if available)
        - equipment_type (e.g., 53' Dry Van, Reefer)
        - mode (e.g., Truckload, LTL)
        - rate (numerical value)
        - currency (e.g., USD, CAD)
        - weight (including units)
        - carrier_name (the transport company name)
        
        Use null if a value is strictly missing. Ensure all values are strings or numbers.
        
        TEXT:
        {text[:10000]}
        
        JSON:
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" } # OpenRouter supports JSON mode for many models
            )
            json_str = response.choices[0].message.content.strip()
            data = json.loads(json_str)
            return ExtractionResponse(**data)
        except Exception as e:
            print(f"Extraction error: {e}")
            return ExtractionResponse()
