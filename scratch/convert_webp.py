import os
from PIL import Image

src_base = "/Users/davidkid9111/ai_website/katana-edge-craft/src/assets"
dst_base = "/Users/davidkid9111/ai_website/katana-edge-craft/public/products"

conversions = [
    # Micro Slit
    ("microslit/microslit-1.png", "micro-slit/main.webp"),
    ("microslit/microslit-2.png", "micro-slit/detail-1.webp"),
    ("microslit/microslit-3.png", "micro-slit/detail-2.webp"),
    ("microslit/microslit-4.png", "micro-slit/detail-3.webp"),
    # Fujisan
    ("fujisan/fujisan-1.png", "fujisan/main.webp"),
    ("fujisan/fujisan-2.png", "fujisan/detail-1.webp"),
    ("fujisan/fujisan-3.png", "fujisan/detail-2.webp"),
    ("fujisan/fujisan-4.png", "fujisan/detail-3.webp"),
]

print("Starting image conversion to WebP:")
for src_rel, dst_rel in conversions:
    src_path = os.path.join(src_base, src_rel)
    dst_path = os.path.join(dst_base, dst_rel)
    
    if os.path.exists(src_path):
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        try:
            with Image.open(src_path) as img:
                img.save(dst_path, "WEBP", quality=90)
                print(f"- Converted {src_rel} to {dst_rel} successfully.")
        except Exception as e:
            print(f"- Error converting {src_rel}: {e}")
    else:
        print(f"- Source file not found: {src_path}")

print("Image conversion complete.")
