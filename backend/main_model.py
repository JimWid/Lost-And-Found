from transformers import Blip2Processor, Blip2ForConditionalGeneration
from PIL import Image
import torch

# Loading the model and processor
device = "cuda" if torch.cuda.is_available() else "cpu"
processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b", use_fast=True)
model = Blip2ForConditionalGeneration.from_pretrained("Salesforce/blip2-opt-2.7b", dtype=torch.float16 if device == "cuda" else torch.float32)

model.to(device)