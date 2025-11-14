
CATEGORY_MAPPING = {
    # Electronics
    "Electronics": ["cell phone", "laptop", "keyboard", "mouse", "remote", "tv", "monitor"],
    
    # Accessories
    "Accessories": ["backpack", "handbag", "tie", "suitcase", "umbrella", "wallet", "sunglasses", "watch"],
    
    # Clothing
    "Clothing": ["shirt", "pants", "shoes", "hat", "jacket", "coat", "dress", "skirt"],
    
    # Sports Equipment
    "Sports Equipment": ["sports ball", "baseball bat", "baseball glove", "skateboard", "surfboard", 
                         "tennis racket", "frisbee", "skis", "snowboard"],
    
    # Books & Stationery
    "Utils": ["book", "scissors", "pen", "pencil"],
    
    # Personal Items
    "Personal": ["toothbrush", "hair drier", "bottle", "cup", "wine glass", "fork", "knife", "spoon"],
    
    # Keys & Cards
    "Keys/Cards": ["keys", "card"],
    
    # Other (default)
    "Other": []
}

def get_category_from_detection(class_name: str, confidence: float, threshold: float = 0.65) -> str:

    # If confidence is too low, return Other
    if confidence < threshold:
        return "Other"
    
    for category, items in CATEGORY_MAPPING.items():
        if class_name.lower() in [item.lower() for item in items]:
            return category
        
    return "Other"
