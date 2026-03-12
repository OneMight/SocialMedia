from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import cv2
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # В продакшене укажи конкретный адрес фронтенда
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-emotion")
async def analyze_emotion(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # DeepFace может принимать numpy array напрямую
        results = DeepFace.analyze(img_path=img, actions=['emotion'], enforce_detection=False)

        # Возвращаем результат первого найденного лица
        return {
            "status": "success",
            "dominant_emotion": results[0]['dominant_emotion'],
            "all_emotions": results[0]['emotion']
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)