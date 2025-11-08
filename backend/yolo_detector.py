from ultralytics import YOLO
from PIL import Image
import torch

yolo_model = YOLO('yolov8n.pt')

def detect_object(image: Image.Image, confidence_threshol: float = 0.65):

    results = yolo_model(image, verbose=False)

    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            confidence = float(box.conf[0])
            if confidence >= confidence_threshol:
                class_id = int(box.cls[0])
                class_name = result.names[class_id]
                detections.append({
                    "class_name": class_name,
                    "confidence": confidence,
                    "class_id": class_id
                })

    if detections:
        best_detection = max(detections, key=lambda x: x["confidence"])
        return {
            "detected": True,
            "class_name": best_detection["class_name"],
            "confidence": best_detection["confidence"],
            "all_detections": detections
        }
    else:
        return {
            "detected": False,
            "class_name": None,
            "confidence": 0.0,
            "all_detections": []
        }