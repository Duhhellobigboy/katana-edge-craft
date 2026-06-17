import os
from PIL import Image

# Source paths
src_micro_slit = "/Users/davidkid9111/.gemini/antigravity-ide/brain/57164e4c-9770-492b-b34e-184bc83312c9/media__1781576580254.jpg"
src_fujisan = "/Users/davidkid9111/.gemini/antigravity-ide/brain/57164e4c-9770-492b-b34e-184bc83312c9/media__1781576621953.jpg"

# Destination paths
dst_micro_slit = "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/micro-slit/main.webp"
dst_fujisan = "/Users/davidkid9111/ai_website/katana-edge-craft/public/products/fujisan/main.webp"

def convert_to_webp(src, dst):
    if not os.path.exists(src):
        print(f"Source file not found: {src}")
        return False
    
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    try:
        with Image.open(src) as img:
            img.save(dst, "WEBP", quality=90)
            print(f"Successfully converted {src} to {dst}")
            return True
    except Exception as e:
        print(f"Error converting {src}: {e}")
        return False

if __name__ == "__main__":
    convert_to_webp(src_micro_slit, dst_micro_slit)
    convert_to_webp(src_fujisan, dst_fujisan)
