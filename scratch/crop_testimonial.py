import os
from PIL import Image

def crop_black_borders(image_path, output_path, threshold=20):
    with Image.open(image_path) as img:
        # Convert to grayscale to find boundaries easily
        gray = img.convert("L")
        w, h = img.size
        
        # Find horizontal bounds
        left = 0
        for x in range(w):
            column = [gray.getpixel((x, y)) for y in range(h)]
            if any(val > threshold for val in column):
                left = x
                break
                
        right = w - 1
        for x in range(w - 1, -1, -1):
            column = [gray.getpixel((x, y)) for y in range(h)]
            if any(val > threshold for val in column):
                right = x
                break
                
        # Find vertical bounds
        top = 0
        for y in range(h):
            row = [gray.getpixel((x, y)) for x in range(left, right + 1)]
            if any(val > threshold for val in row):
                top = y
                break
                
        bottom = h - 1
        for y in range(h - 1, -1, -1):
            row = [gray.getpixel((x, y)) for x in range(left, right + 1)]
            if any(val > threshold for val in row):
                bottom = y
                break
        
        print(f"Original size: {w}x{h}")
        print(f"Detected crop box: (left: {left}, top: {top}, right: {right}, bottom: {bottom})")
        
        # Add a tiny margin back if needed, or crop exactly
        cropped = img.crop((left, top, right + 1, bottom + 1))
        cropped.save(output_path, "JPEG", quality=95)
        print(f"Saved cropped image to {output_path}")

# Run for the user's uploaded image
src_path = "/Users/davidkid9111/.gemini/antigravity-ide/brain/c09744e4-f553-4bf5-815e-4afe44d1692d/media__1781388156478.jpg"
dst_path = "/Users/davidkid9111/ai_website/katana-edge-craft/src/assets/testimonials/professional-3.jpg"

crop_black_borders(src_path, dst_path)
