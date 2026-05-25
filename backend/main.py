import os
import json
import logging
import asyncio
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY]):
    logger.error("Missing environment variables. Please check SUPABASE_URL, SUPABASE_KEY, and GEMINI_API_KEY.")

# Initialize clients
genai.configure(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="Rohit Kasaudhan Portfolio RAG Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatMessage(BaseModel):
    role: str  # 'user' or 'model' / 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

def get_query_embedding(text: str) -> list:
    """Generate a 768-dimensional embedding vector for the user query."""
    try:
        response = genai.embed_content(
            model="models/gemini-embedding-2",
            content=text,
            task_type="retrieval_query",
            output_dimensionality=768
        )
        return response['embedding']
    except Exception as e:
        logger.error(f"Error generating query embedding: {e}")
        return []

def search_context(query_embedding: list, limit: int = 4, threshold: float = 0.3) -> str:
    """Perform vector search on Supabase using pgvector matching."""
    if not query_embedding:
        return ""
    try:
        # Call the RPC match_documents
        response = supabase.rpc(
            "match_documents",
            {
                "query_embedding": query_embedding,
                "match_threshold": threshold,
                "match_count": limit
            }
        ).execute()
        
        results = response.data
        if not results:
            logger.info("No matching documents found above similarity threshold.")
            return ""
        
        # Combine matching chunks
        context_chunks = []
        for doc in results:
            context_chunks.append(doc.get("content", ""))
        
        return "\n\n---\n\n".join(context_chunks)
    except Exception as e:
        logger.error(f"Error executing vector search RPC: {e}")
        return ""

def build_prompt(query: str, context: str, history: List[ChatMessage] = None) -> str:
    """Build the final system and user prompt for Gemini RAG."""
    system_instruction = (
        "You are Pikachu, Rohit Kasaudhan's customized companion chatbot. "
        "Your goal is to answer questions about Rohit Kasaudhan (his background, projects, skills, education, contact info) "
        "based ONLY on the provided context below.\n\n"
        "Guidelines:\n"
        "1. Answer ONLY using the facts mentioned in the context. Do not make up or hallucinate any details.\n"
        "2. If the answer cannot be found in the context or is out-of-context, politely decline to answer (e.g. 'I'm sorry, I don't have that information about Rohit. Ask me about his projects or skills!').\n"
        "3. Match the current dark-mode theme - be friendly and energetic with occasional emojis (⚡, 🐾, 🔴, 💻).\n"
        "4. If requested to contact Rohit, provide ksdrohit28@gmail.com, https://github.com/Rohit-kasaudhan, or https://www.linkedin.com/in/rohit-kasaudhan/.\n"
        "5. Keep responses clean, direct, and strictly under 30 words.\n\n"
        f"Context:\n{context or 'No context available.'}\n\n"
    )
    
    # Format chat history
    formatted_history = ""
    if history:
        for msg in history:
            role_label = "User" if msg.role == "user" else "Pikachu"
            formatted_history += f"{role_label}: {msg.content}\n"
    
    prompt = (
        f"{system_instruction}"
        "Conversation History:\n"
        f"{formatted_history}"
        f"User: {query}\n"
        "Pikachu (answer based only on context):"
    )
    return prompt

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "FastAPI is running and ready."}

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Normal JSON RAG chat response endpoint."""
    query = request.message
    if not query.strip():
        raise HTTPException(status_code=400, detail="Empty query message.")
        
    logger.info(f"Received chat request: {query}")
    
    # 1. Generate query embedding
    embedding = get_query_embedding(query)
    
    # 2. Retrieve relevant context from vector database
    context = search_context(embedding)
    
    # 3. Build prompt
    prompt = build_prompt(query, context, request.history)
    
    # 4. Generate answer using Gemini
    try:
        model = genai.GenerativeModel("models/gemini-3.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        return {"response": text}
    except Exception as e:
        logger.error(f"Error calling Gemini completion API: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate completion response: {str(e)}")

@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest):
    """Streaming (SSE) RAG chat response endpoint."""
    query = request.message
    if not query.strip():
        raise HTTPException(status_code=400, detail="Empty query message.")
        
    logger.info(f"Received streaming chat request: {query}")
    
    # 1. Generate query embedding
    embedding = get_query_embedding(query)
    
    # 2. Retrieve context
    context = search_context(embedding)
    
    # 3. Build prompt
    prompt = build_prompt(query, context, request.history)
    
    # 4. Define async generator for streaming
    async def sse_generator():
        try:
            model = genai.GenerativeModel("models/gemini-3.5-flash")
            response = model.generate_content(prompt, stream=True)
            
            for chunk in response:
                if chunk.text:
                    # Output in server-sent events (SSE) format
                    data = {"text": chunk.text}
                    yield f"data: {json.dumps(data)}\n\n"
                    # Add a microscopic sleep to smooth out network bursts
                    await asyncio.sleep(0.01)
        except Exception as e:
            logger.error(f"Error in streaming generation generator: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            
    return StreamingResponse(sse_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
