import os
import base64
import pandas as pd
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_cors import CORS

register_bp = Blueprint('register', __name__)
CORS(register_bp)


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
CSV_PATH = os.path.join(BASE_DIR, "face_dimensions_registry.csv")
FACES_DIR = os.path.join(BASE_DIR, "Faces")


try:
    os.makedirs(FACES_DIR, exist_ok=True)
except Exception as e:
    print("❌ Failed to create Faces directory:", e)

# Ensure CSV file exists with correct structure
if not os.path.exists(CSV_PATH):
    df = pd.DataFrame(columns=["Name", "EPF", "Image", "Time", "PassWord"])
    df.to_csv(CSV_PATH, index=False)

@register_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get("name")
    epf = data.get("epf")
    image_data = data.get("image")
    password = data.get("password")
    mode = data.get("mode")

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        if mode == "face":
            if not image_data:
                return jsonify({"message": "❌ Face image is required."}), 400

            # Save image
            image_filename = f"{name}_{epf}_{int(datetime.now().timestamp())}.jpg"
            image_path = os.path.join(FACES_DIR, image_filename)

            try:
                header, encoded = image_data.split(",", 1)
                image_bytes = base64.b64decode(encoded)
                with open(image_path, "wb") as f:
                    f.write(image_bytes)
            except Exception as e:
                return jsonify({"message": f"❌ Failed to process image. {str(e)}"}), 500

            new_entry = pd.DataFrame([{
                "Name": name,
                "EPF": epf,
                "Image": image_filename,
                "Time": now,
                "PassWord": "N/A"
            }])

        elif mode == "form":
            if not password:
                return jsonify({"message": "❌ Password is required in Form Only mode."}), 400

            new_entry = pd.DataFrame([{
                "Name": name,
                "EPF": epf,
                "Image": "N/A",
                "Time": now,
                "PassWord": password
            }])
        else:
            return jsonify({"message": "❌ Invalid mode."}), 400

        # Update CSV
        existing_data = pd.read_csv(CSV_PATH)
        updated_data = pd.concat([existing_data, new_entry], ignore_index=True)
        updated_data.to_csv(CSV_PATH, index=False)

        return jsonify({"message": "✅ Registered successfully!"}), 200

    except Exception as e:
        print("Error during registration:", e)
        return jsonify({"message": "❌ Registration failed due to server error."}), 500
