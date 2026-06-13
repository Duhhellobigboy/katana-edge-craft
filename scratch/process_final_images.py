import os
from PIL import Image

# Directories
brain_dir = "/Users/davidkid9111/.gemini/antigravity-ide/brain/37c1dace-dd91-4b47-843c-47f024914045"
public_dir = "/Users/davidkid9111/ai_website/katana-edge-craft/public/products"

mappings = {
    "naruto": "media__1781337017836.jpg",
    "double-swivel": "media__1781337017848.jpg",
    "bamboo": "media__1781337018138.jpg",
    "karakuri": "media__1781337018152.jpg"
}

for product_key, filename in mappings.items():
    src_path = os.path.join(brain_dir, filename)
    dst_path = os.path.join(public_dir, product_key, "main.webp")
    
    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with Image.open(src_path) as img:
        img.save(dst_path, "WEBP", quality=90)
    print(f"Processed and saved final {product_key} main.webp")
