# main.py — FastAPI Backend for Smart Retail Checkout System
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import torch
import numpy as np
from ultralytics import YOLO
from PIL import Image
import io, os, random
from datetime import datetime
from collections import Counter
from prices import get_price, GST_RATE

app = FastAPI(
    title="Smart Retail Checkout API",
    description="Detects grocery items from images and generates bills",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "best.pt")
print(f"Loading model from: {MODEL_PATH}")

# Fix torch.load compatibility
if not hasattr(torch.load, '_patched'):
    _orig = torch.load
    def _patched(*a, **kw):
        kw['weights_only'] = False
        return _orig(*a, **kw)
    _patched._patched = True
    torch.load = _patched

try:
    model = YOLO(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.get("/")
def root():
    return {"message": "Smart Retail Checkout API is running!", "status": "ok", "model_loaded": model is not None}

@app.get("/health")
def health():
    return {"status": "healthy", "model": "loaded" if model else "not loaded"}

@app.post("/detect")
async def detect_items(
    file: UploadFile = File(...),
    confidence: float = Query(default=0.60, ge=0.10, le=0.90)
):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        results = model.predict(
            source=image,
            conf=confidence,
            iou=0.45,
            task='detect',
            verbose=False
        )

        result = results[0]
        detected_items = []

        if result.boxes is not None and len(result.boxes) > 0:
            class_names = model.names
            for box in result.boxes:
                cls_id = int(box.cls.cpu().numpy()[0])
                conf = float(box.conf.cpu().numpy()[0])
                name = class_names[cls_id]
                x1, y1, x2, y2 = box.xyxy.cpu().numpy()[0]
                detected_items.append({
                    "name": name,
                    "confidence": round(conf * 100, 1),
                    "bbox": {"x1": round(float(x1), 1), "y1": round(float(y1), 1),
                             "x2": round(float(x2), 1), "y2": round(float(y2), 1)}
                })

        item_counts = Counter([i["name"] for i in detected_items])
        bill_items = []
        subtotal = 0

        for name, qty in item_counts.items():
            price = get_price(name)
            amount = price * qty
            subtotal += amount
            bill_items.append({"name": name, "quantity": qty, "unit_price": price, "amount": amount})

        gst = round(subtotal * GST_RATE, 2)
        total = round(subtotal + gst, 2)

        return JSONResponse({
            "success": True,
            "bill_number": f"#{random.randint(1000, 9999)}",
            "date": datetime.now().strftime("%d-%m-%Y %H:%M"),
            "items_detected": len(detected_items),
            "detected_items": detected_items,
            "bill": {
                "items": bill_items,
                "subtotal": subtotal,
                "gst": gst,
                "gst_rate": f"{int(GST_RATE * 100)}%",
                "total": total
            }
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/classes")
def get_classes():
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    return {"total_classes": len(model.names), "classes": list(model.names.values())}
