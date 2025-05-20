from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import re
from urllib.parse import urlparse
import time
from datetime import datetime, timedelta
import random

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache implementation
# For production, consider using Redis or another persistent cache
TRANSCRIPT_CACHE = {}
CACHE_TTL = 3600  # Cache TTL in seconds (1 hour)

def clean_expired_cache_entries():
    """Remove expired cache entries"""
    now = time.time()
    expired_keys = [k for k, v in TRANSCRIPT_CACHE.items() if now - v['timestamp'] > CACHE_TTL]
    for key in expired_keys:
        del TRANSCRIPT_CACHE[key]

def extract_links(text):
    """Extract URLs from text."""
    # URL regex pattern
    pattern = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[\w/\-?&=%.#~]*'
    
    links = []
    for url in re.findall(pattern, text):
        # Validate URL structure
        try:
            parsed = urlparse(url)
            if parsed.netloc and parsed.scheme in ('http', 'https'):
                links.append(url)
        except:
            pass
    
    return list(set(links))  # Remove duplicates

@app.get("/transcript")
def get_transcript(video_id: str, lang: str = "en"):
    # Clean expired cache entries (periodically)
    if len(TRANSCRIPT_CACHE) > 0 and random.random() < 0.1:  # 10% chance on each request
        clean_expired_cache_entries()
    
    # Check if the transcript is in cache
    cache_key = f"{video_id}:{lang}"
    if cache_key in TRANSCRIPT_CACHE:
        print(f"Cache hit for video_id: {video_id}, lang: {lang}")
        return TRANSCRIPT_CACHE[cache_key]['data']
    
    try:
        print(f"Cache miss for video_id: {video_id}, lang: {lang}, fetching from YouTube")
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
        text = " ".join([entry["text"] for entry in transcript])
        
        # Extract links from transcript
        links = extract_links(text)
        
        # Prepare response data
        response_data = {
            "transcript": text,
            "links": links
        }
        
        # Store in cache
        TRANSCRIPT_CACHE[cache_key] = {
            'data': response_data,
            'timestamp': time.time()
        }
        
        return response_data
    except (TranscriptsDisabled, NoTranscriptFound):
        raise HTTPException(status_code=404, detail="Transcript not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))