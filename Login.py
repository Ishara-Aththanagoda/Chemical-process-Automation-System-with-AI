from flask import Blueprint, request, jsonify
import os
import cv2
import numpy as np
import pandas as pd
from flask_cors import CORS
from PIL import Image
import base64
from io import BytesIO
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

login_bp = Blueprint('login', __name__)
CORS(login_bp)

BASE_PATH = r"D:\AI,ML,DS Projects\Intern in South Asia Textile company\Chemical process V1\Backend"
FACES_DIR = os.path.join(BASE_PATH, "Faces")
REGISTRY_PATH = os.path.join(BASE_PATH, "face_dimensions_registry.csv")
HISTORY_PATH = os.path.join(BASE_PATH, "login_history.csv")
LOGIN_HISTORY_PATH = os.path.join(BASE_PATH, "qr_login_history.csv")


if not os.path.exists(HISTORY_PATH):
    pd.DataFrame(columns=["Timestamp", "LoginMethod", "Name", "EPF"]).to_csv(HISTORY_PATH, index=False)


known_encodings = []
known_image_names = []

def encode_face(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    resized = cv2.resize(gray, (100, 100))
    flattened = resized.flatten()
    norm = np.linalg.norm(flattened)
    return flattened if norm == 0 else flattened / norm

print("🔄 Loading registered face encodings...")

for filename in os.listdir(FACES_DIR):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        path = os.path.join(FACES_DIR, filename)
        image = cv2.imread(path)
        if image is not None:
            encoding = encode_face(image)
            known_encodings.append(encoding)
            known_image_names.append(filename)
        else:
            print(f"⚠️ Could not read image: {filename}")

df_registry = pd.read_csv(REGISTRY_PATH)
df_registry.rename(columns={"Image": "ImageName", "PassWord": "Password"}, inplace=True)
df_registry["EPF"] = df_registry["EPF"].astype(str).str.strip()
df_registry["Password"] = df_registry["Password"].astype(str).str.strip()

def get_user_info_by_image(image_name):
    match = df_registry[df_registry["ImageName"] == image_name]
    if not match.empty:
        row = match.iloc[0]
        return row["Name"], row["EPF"]
    return None, None

def verify_credentials(epf, password):
    df_registry = pd.read_csv(REGISTRY_PATH)
    df_registry.rename(columns={"Image": "ImageName", "PassWord": "Password"}, inplace=True)
    df_registry["EPF"] = df_registry["EPF"].astype(str)
    df_registry["Password"] = df_registry["Password"].astype(str)

    epf = epf.split('.')[0]
    password = password.split('.')[0]

    match = df_registry[df_registry["EPF"] == epf]
    if not match.empty:
        stored_password = str(match.iloc[0]["Password"]).split('.')[0]
        print(f"🔐 Comparing entered password [{password}] with stored password [{stored_password}]")
        if str(password) == stored_password:
            return match.iloc[0]["Name"]
    return None

def decode_base64_image(data_url):
    try:
        header, encoded = data_url.split(",", 1)
        img_data = base64.b64decode(encoded)
        img = Image.open(BytesIO(img_data))
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        print("❌ Failed to decode image:", e)
        return None

def log_login(method, name, epf):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    df = pd.DataFrame([[timestamp, method, name, epf]], columns=["Timestamp", "LoginMethod", "Name", "EPF"])
    df.to_csv(HISTORY_PATH, mode='a', index=False, header=False)


def log_login_history(name, epf, method):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    record = pd.DataFrame([[name, epf, method, timestamp]],
                          columns=["Name", "EPF", "Method", "Timestamp"])
    
    if os.path.exists(LOGIN_HISTORY_PATH):
        record.to_csv(LOGIN_HISTORY_PATH, mode='a', header=False, index=False)
    else:
        record.to_csv(LOGIN_HISTORY_PATH, mode='w', header=True, index=False)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    
    if "image" in data:
        image_data = data["image"]
        captured_image = decode_base64_image(image_data)
        if captured_image is None:
            return jsonify(success=False, message="❌ Invalid image data.")

        captured_encoding = encode_face(captured_image)
        similarities = cosine_similarity([captured_encoding], known_encodings)[0]
        best_match_index = np.argmax(similarities)
        best_score = similarities[best_match_index]

        print("🔍 Best similarity score:", best_score)

        if best_score > 0.85:
            matched_image = known_image_names[best_match_index]
            name, epf = get_user_info_by_image(matched_image)
            if name and epf:
                log_login("Face", name, epf)
                return jsonify(success=True, name=f"{name} ({epf})")
            else:
                return jsonify(success=False, message="❌ User info not found.")
        else:
            return jsonify(success=False, message="❌ Face not recognized. Try again or use credentials.")

    
    elif "epf" in data and "password" in data:
        epf = str(data["epf"]).strip()
        password = str(data["password"]).strip()
        print(f"🔐 Login attempt: EPF={epf}, Password={password}")
        name = verify_credentials(epf, password)
        if name:
            log_login("Credentials", name, epf)
            return jsonify(success=True, name=f"{name} ({epf})")
        else:
            return jsonify(success=False, message="❌ Invalid EPF or password.")
    else:
        return jsonify(success=False, message="❌ Incomplete login request.")



@login_bp.route('/log_qr_login', methods=['POST'])
def log_qr_login():
    data = request.get_json()
    name = data.get("name")
    epf = data.get("epf")
    method = data.get("method", "QR")

    if name and epf:
        log_login_history(name, epf, method)
        return jsonify(success=True, message="Login history recorded.")
    else:
        return jsonify(success=False, message="Invalid login data.")
