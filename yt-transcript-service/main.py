from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import re
from urllib.parse import urlparse

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=[lang])
        text = " ".join([entry["text"] for entry in transcript])
        
        # Extract links from transcript
        links = extract_links(text)
        
        return {
            "transcript": text,
            "links": links
        }
    except (TranscriptsDisabled, NoTranscriptFound):
        raise HTTPException(status_code=404, detail="Transcript not available")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))