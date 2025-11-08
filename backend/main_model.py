from transformers import Blip2Processor, Blip2ForConditionalGeneration
from PIL import Image
import torch
import logging

# Attempt to load the heavy BLIP2 model, but fail gracefully so the server can start
device = "cuda" if torch.cuda.is_available() else "cpu"
processor = None
model = None

try:
	processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-2.7b", use_fast=True)
	model = Blip2ForConditionalGeneration.from_pretrained(
		"Salesforce/blip2-opt-2.7b",
		dtype=torch.float16 if device == "cuda" else torch.float32,
	)
	model.to(device)
except Exception as e:
	logging.warning("BLIP2 model not loaded at import time: %s", e)
	# processor and model remain None; callers should handle this case and provide
	# placeholder behavior until the model is loaded or downloaded separately.