import os
from PIL import Image

# Directories
brain_dir = "/Users/davidkid9111/.gemini/antigravity-ide/brain/37c1dace-dd91-4b47-843c-47f024914045"
public_dir = "/Users/davidkid9111/ai_website/katana-edge-craft/public/products"

# 1. Thunder (silver standard cutting shear)
thunder_src = os.path.join(brain_dir, "media__1781334632890.jpg")
thunder_dst = os.path.join(public_dir, "thunder", "main.webp")
os.makedirs(os.path.dirname(thunder_dst), exist_ok=True)
with Image.open(thunder_src) as img:
    img.save(thunder_dst, "WEBP", quality=90)
print("Saved Thunder main.webp")

# 2. 4-quadrant image
quad_src = os.path.join(brain_dir, "media__1781334764974.png")
with Image.open(quad_src) as img:
    w, h = img.size
    mid_x = w // 2
    mid_y = h // 2
    
    # Coordinates: (left, upper, right, lower)
    # Double Swivel (top-left)
    double_swivel_img = img.crop((0, 0, mid_x, mid_y))
    double_swivel_dst = os.path.join(public_dir, "double-swivel", "main.webp")
    os.makedirs(os.path.dirname(double_swivel_dst), exist_ok=True)
    double_swivel_img.save(double_swivel_dst, "WEBP", quality=90)
    print("Saved Double Swivel main.webp")
    
    # Naruto (top-right)
    naruto_img = img.crop((mid_x, 0, w, mid_y))
    naruto_dst = os.path.join(public_dir, "naruto", "main.webp")
    os.makedirs(os.path.dirname(naruto_dst), exist_ok=True)
    naruto_img.save(naruto_dst, "WEBP", quality=90)
    print("Saved Naruto main.webp")
    
    # Karakuri (bottom-left)
    karakuri_img = img.crop((0, mid_y, mid_x, h))
    karakuri_dst = os.path.join(public_dir, "karakuri", "main.webp")
    os.makedirs(os.path.dirname(karakuri_dst), exist_ok=True)
    karakuri_img.save(karakuri_dst, "WEBP", quality=90)
    print("Saved Karakuri main.webp")
    
    # Bamboo (bottom-right)
    bamboo_img = img.crop((mid_x, mid_y, w, h))
    bamboo_dst = os.path.join(public_dir, "bamboo", "main.webp")
    os.makedirs(os.path.dirname(bamboo_dst), exist_ok=True)
    bamboo_img.save(bamboo_dst, "WEBP", quality=90)
    print("Saved Bamboo main.webp")
