from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
import psutil

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Damage Reporting ML API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins creates least friction for connection 4
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include the API router
from api.routes import router as api_router
app.include_router(api_router)

# Note: Models are loaded once when `api.routes` initializes `InferencePipeline`

@app.on_event("startup")
async def startup_event():
    process = psutil.Process(os.getpid())
    print(f"Startup memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")
    print("✅ ML Server started successfully")

if __name__ == "__main__":
    # Ensure Render dynamic port bindings or fallback safely
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

