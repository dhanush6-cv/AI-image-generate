# cartoon.py
import sys
import cv2
import numpy as np

def cartoonize(img_bgr):
    h, w = img_bgr.shape[:2]

    # --- 1) Smooth colors (cartoon base) ---
    # bilateral filter preserves edges better
    color = img_bgr.copy()
    for _ in range(3):
        color = cv2.bilateralFilter(color, d=9, sigmaColor=75, sigmaSpace=75)

    # --- 2) Strong clean edges (not black dots) ---
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.medianBlur(gray, 7)

    edges = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,
        9, 2
    )
    edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    # --- 3) Combine (cartoon look) ---
    cartoon = cv2.bitwise_and(color, edges)

    # --- 4) Slight sharpen + contrast for HD feel ---
    blur = cv2.GaussianBlur(cartoon, (0, 0), 1.2)
    cartoon = cv2.addWeighted(cartoon, 1.35, blur, -0.35, 0)

    return cartoon

def overlay_face_clear(original, cartoon):
    # Face detector (built-in OpenCV Haar)
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )

    gray = cv2.cvtColor(original, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.2, 6)

    if len(faces) == 0:
        return cartoon

    out = cartoon.copy()

    # pick biggest face
    faces = sorted(faces, key=lambda x: x[2] * x[3], reverse=True)
    x, y, fw, fh = faces[0]

    # expand a bit for hair/edges
    pad = int(0.18 * fw)
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(original.shape[1], x + fw + pad)
    y2 = min(original.shape[0], y + fh + pad)

    face_org = original[y1:y2, x1:x2]
    face_cart = cartoon[y1:y2, x1:x2]

    # Blend: keep face detail (70% original + 30% cartoon)
    blended = cv2.addWeighted(face_org, 0.70, face_cart, 0.30, 0)

    # Smooth mask edges (feather)
    mask = np.zeros((y2 - y1, x2 - x1), dtype=np.uint8)
    cv2.ellipse(
        mask,
        ((x2 - x1)//2, (y2 - y1)//2),
        ((x2 - x1)//2, (y2 - y1)//2),
        0, 0, 360, 255, -1
    )
    mask = cv2.GaussianBlur(mask, (31, 31), 0)

    mask3 = cv2.merge([mask, mask, mask]).astype(np.float32) / 255.0

    roi = out[y1:y2, x1:x2].astype(np.float32)
    blended = blended.astype(np.float32)

    roi = blended * mask3 + roi * (1 - mask3)
    out[y1:y2, x1:x2] = np.clip(roi, 0, 255).astype(np.uint8)

    return out

def main():
    if len(sys.argv) < 3:
        print("Usage: python cartoon.py input_path output_path")
        sys.exit(1)

    inp = sys.argv[1]
    outp = sys.argv[2]

    img = cv2.imread(inp)
    if img is None:
        print("Failed to read input image")
        sys.exit(2)

    # upscale a bit for output clarity
    h, w = img.shape[:2]
    scale = 1.6 if max(h, w) < 1200 else 1.2
    img_up = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    cart = cartoonize(img_up)
    final = overlay_face_clear(img_up, cart)

    cv2.imwrite(outp, final)

if __name__ == "__main__":
    main()