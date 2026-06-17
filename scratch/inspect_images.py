import os
from PIL import Image

image_paths = [
    "/Users/davidkid9111/ai_website/katana-edge-craft/src/assets/microslit/microslit-1.png",
    "/Users/davidkid9111/ai_website/katana-edge-craft/src/assets/fujisan/fujisan-1.png",
    "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/thunder/main.webp",
    "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/double-swivel/main.webp",
    "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/naruto/main.webp",
    "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/karakuri/main.webp",
    "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/bamboo/main.webp",
    "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/bamboo-thinning/main.webp"
]

print("Inspecting product images:")
for path in image_paths:
    if os.path.exists(path):
        try:
            with Image.open(path) as img:
                print(f"- File: {os.path.basename(path)} (Path: {os.path.relpath(path, '/Users/davidkid9111/ai_website/katana-edge-craft')})")
                print(f"  Format: {img.format}")
                print(f"  Size: {img.width}x{img.height} (Aspect Ratio: {img.width/img.height:.3f})")
        except Exception as e:
            print(f"- File: {os.path.basename(path)} (Error loading: {e})")
    else:
        print(f"- File: {os.path.basename(path)} (Not found)")
