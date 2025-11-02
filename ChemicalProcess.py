from flask import Blueprint, request, jsonify, send_file, url_for
from flask_cors import CORS
import pandas as pd
import os
import serial
import serial.tools.list_ports
import threading
import time
import sys
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import platform
import subprocess

chemical_bp = Blueprint('chemicalprocess', __name__)
CORS(chemical_bp, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'sample_batches.csv')
DATA_LOG_CSV = os.path.join(BASE_DIR, 'chemical_weighting_details.csv')
EXCEL_PATH = os.path.join(BASE_DIR, 'chemical_weighting_details.xlsx')
ALARM_PATH = os.path.join(BASE_DIR, 'static', 'alarm.mp3')
REPORT_IMG_DIR = os.path.join(BASE_DIR, 'static', 'reports')
os.makedirs(REPORT_IMG_DIR, exist_ok=True)

latest_weight = 0.0
weight_lock = threading.Lock()
ser = None
serial_thread_started = False
COMMON_BAUDRATES = [9600]

def list_serial_ports():
    ports = serial.tools.list_ports.comports()
    return [port.device for port in ports]

def try_baud_rates(port):
    print(f"\n[Serial] Trying baud rates on {port}...")
    for baud in COMMON_BAUDRATES:
        try:
            print(f"  ⏳ Testing {baud}...")
            s = serial.Serial(port=port, baudrate=baud, bytesize=serial.EIGHTBITS,
                              parity=serial.PARITY_NONE, stopbits=serial.STOPBITS_ONE, timeout=0.1)
            s.reset_input_buffer()
            time.sleep(1)
            for _ in range(10):
                if s.in_waiting:
                    line = s.readline()
                    try:
                        decoded = line.decode('utf-8', errors='ignore').strip()
                        weight_val = parse_weight(decoded)
                        if weight_val is not None:
                            print(f"  ✅ Valid data at {baud}: {decoded}")
                            return s
                    except Exception as ex:
                        print(f"  ⚠️ Decode error: {ex}")
            s.close()
        except Exception as e:
            print(f"  ❌ Failed at {baud}: {e}")
    return None

def parse_weight(decoded_line):
    if 'kg' in decoded_line:
        for token in decoded_line.split():
            if 'kg' in token:
                try:
                    return float(token.replace('kg', '').replace('+', '').replace(',', '').strip())
                except:
                    continue
    return None

def read_serial_continuously():
    global ser, latest_weight
    print("[Serial Thread] Started.")
    while ser and ser.is_open:
        try:
            if ser.in_waiting:
                line = ser.readline()
                decoded = line.decode('utf-8', errors='ignore').strip()
                weight_val = parse_weight(decoded)
                if weight_val is not None:
                    with weight_lock:
                        latest_weight = weight_val
                    print(f"\r🟢 Weight: {weight_val:.2f} kg    ", end='')
                else:
                    print(f"\r⚠️ Invalid line: {decoded}     ", end='')
        except Exception as e:
            print(f"\n[Serial Thread] Error: {e}")
        time.sleep(0.01)

available_ports = list_serial_ports()
for port in available_ports:
    try:
        ser_try = try_baud_rates(port)
        if ser_try:
            ser = ser_try
            serial_thread_started = True
            threading.Thread(target=read_serial_continuously, daemon=True).start()
            print(f"[Serial] Connected on {port}")
            break
    except Exception as e:
        print(f"[Serial] Skipped {port}: {e}")
if not ser:
    print("[Serial] ❌ No suitable port found. Running without serial.")

@chemical_bp.route('/get_chemicals', methods=['POST'])
def get_chemicals():
    try:
        data = request.get_json()
        batch_number = str(data.get('batch_number', '')).strip()
        if not batch_number:
            return jsonify({'error': 'Batch Number is required'}), 400
        if not os.path.exists(CSV_PATH):
            return jsonify({'error': 'CSV file not found'}), 500
        df = pd.read_csv(CSV_PATH)
        df.columns = [col.strip() for col in df.columns]
        batch_data = df[df['Batch Number'].astype(str).str.strip() == batch_number]
        if batch_data.empty:
            return jsonify({'chemicals': []})
        chemicals = [{
            'name': row['Chemical Name'],
            'weight': float(row['Chemical Weight (kg)'])
        } for _, row in batch_data.iterrows()]
        return jsonify({'chemicals': chemicals})
    except Exception as e:
        return jsonify({'error': f'Failed to process chemicals: {str(e)}'}), 500

@chemical_bp.route('/get_weight', methods=['GET'])
def get_weight():
    try:
        with weight_lock:
            current_weight = round(latest_weight, 2)
        print(f"[API] /get_weight called -> Returning: {current_weight}")
        return jsonify({"weight": current_weight})
    except Exception as e:
        print(f"[API] Error reading weight: {e}")
        return jsonify({"weight": "error"}), 500

@chemical_bp.route('/ring_alarm', methods=['GET'])
def ring_alarm():
    try:
        if os.name == 'nt':
            os.startfile(ALARM_PATH)
        elif platform.system() == 'Darwin':
            subprocess.call(['afplay', ALARM_PATH])
        else:
            subprocess.call(['xdg-open', ALARM_PATH])
        return jsonify({'status': 'Alarm triggered'})
    except Exception as e:
        print(f"[Alarm] Error: {e}")
        return jsonify({'error': f'Failed to play alarm: {str(e)}'}), 500

@chemical_bp.route('/generate_report', methods=['POST'])
def generate_report():
    data = request.get_json()
    batch_number = data.get('batch_number', 'UNKNOWN')
    operator = data.get('operator', {})
    chemicals = data.get('chemicals', [])
    now = datetime.now()
    timestamp_str = now.strftime("%Y%m%d_%H%M%S")
    readable_time = now.strftime('%Y-%m-%d %H:%M:%S')
    filename = f'report_{batch_number}_{timestamp_str}.jpg'
    file_path = os.path.join(REPORT_IMG_DIR, filename)

    # Create image
    img = Image.new('RGB', (800, 1000), 'white')
    draw = ImageDraw.Draw(img)
    try:
        font_title = ImageFont.truetype('arial.ttf', 24)
        font = ImageFont.truetype('arial.ttf', 18)
    except:
        font_title = font = ImageFont.load_default()

    # Header
    y = 20
    draw.text((10, y), "Chemical Weighing Report", font=font_title, fill="black")
    y += 40
    draw.text((10, y), f"Batch Number: {batch_number}", font=font, fill="black")
    draw.text((500, y), f"Date & Time: {readable_time}", font=font, fill="black")
    y += 30
    draw.text((10, y), f"Operator: {operator.get('name', 'N/A')}", font=font, fill="black")
    draw.text((500, y), f"EPF: {operator.get('epf', 'N/A')}", font=font, fill="black")
    y += 30
    draw.line((10, y, 790, y), fill="gray", width=1)
    y += 10

    # Process chemical list
    excel_records = []

    for i, chem in enumerate(chemicals):
        name = chem.get('name', 'Unknown')
        original_weight = float(chem.get('weight', 0.0))

        # Robustly interpret flags
        was_skipped = str(chem.get('wasSkipped', 'false')).lower() == 'true'
        was_edited = str(chem.get('wasEdited', 'false')).lower() == 'true'

        edited_weight_raw = chem.get('editedWeight')
        try:
            edited_weight = float(edited_weight_raw) if edited_weight_raw not in [None, ''] else None
        except ValueError:
            edited_weight = None

        # Determine final weight
        if was_skipped:
            final_weight = 0.0
            note = "Skipped"
        elif was_edited and edited_weight is not None:
            final_weight = edited_weight
            note = "Edited"
        else:
            final_weight = original_weight
            note = ""

        # Draw report row
        draw.text((10, y), f"{i + 1}. {name}", font=font, fill="black")
        draw.text((400, y), f"{final_weight:.2f} kg", font=font, fill="black")
        if note:
            draw.text((600, y), note, font=font, fill="red")
        y += 25

        # Collect record for Excel
        excel_records.append({
            'Timestamp': readable_time,
            'Batch Number': batch_number,
            'Chemical Name': name,
            'Original Weight(kg)': original_weight,
            'Final Weight(kg)': final_weight,
            'Was Skipped': 'Yes' if was_skipped else 'No',
            'Was Edited': 'Yes' if was_edited else 'No',
            'Operator Name': operator.get('name', ''),
            'Operator EPF': operator.get('epf', '')
        })

    # Footer
    y += 30
    draw.text((10, y), "Operator Signature: _________________________", font=font, fill="black")
    y += 25
    draw.text((10, y), "Supervisor Signature: _______________________", font=font, fill="black")
    img.save(file_path)

    # Save to Excel
    try:
        df_excel = pd.DataFrame(excel_records)
        history_path = os.path.join(BASE_DIR, 'process_history.xlsx')

        if not os.path.exists(history_path):
            df_excel.to_excel(history_path, index=False)
        else:
            existing = pd.read_excel(history_path)
            combined = pd.concat([existing, df_excel], ignore_index=True)
            combined.to_excel(history_path, index=False)

        print(f"[Excel] Process history saved to: {history_path}")
    except Exception as e:
        print(f"[Excel Error] Failed to save process history: {e}")

    report_url = url_for('static', filename=f'reports/{filename}', _external=True)
    return jsonify({'report_url': report_url})




@chemical_bp.route('/submit_process', methods=['POST'])
def submit_process():
    try:
        data = request.get_json(force=True)
        batch_number = data.get('batch_number', 'UNKNOWN')
        operator = data.get('operator', {})
        chemicals = data.get('chemicals', [])
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        print(f"[DEBUG] Received chemicals: {chemicals}")

        if not chemicals:
           print("[ERROR] No chemical data received.")
           return jsonify({'status': 'error', 'message': 'No chemical data received'}), 400


        
        records = []
        for chem in chemicals:
            records.append({
                'Timestamp': timestamp,
                'Batch Number': batch_number,
                'Operator Name': operator.get('name', ''),
                'EPF': operator.get('epf', ''),
                'Chemical Name': chem.get('name', ''),
                'Weight (kg)': chem.get('weight', 0.0),
                'Was Edited': chem.get('wasEdited', False),
                'Was Skipped': chem.get('wasSkipped', False)
            })

        df_new = pd.DataFrame(records)
        print(f"[DEBUG] New DataFrame:\n{df_new}")

        if df_new.empty:
            return jsonify({'status': 'error', 'message': 'No chemicals to save'}), 400

    
        if not os.path.exists(DATA_LOG_CSV) or os.stat(DATA_LOG_CSV).st_size == 0:
            df_new.to_csv(DATA_LOG_CSV, index=False, encoding='utf-8-sig')
        else:
            try:
                df_existing = pd.read_csv(DATA_LOG_CSV, encoding='utf-8-sig')
            except Exception as e:
                print(f"[CSV READ ERROR] {e}, trying fallback encoding.")
                df_existing = pd.read_csv(DATA_LOG_CSV, encoding='latin1')

            df_combined = pd.concat([df_existing, df_new], ignore_index=True)
            df_combined.to_csv(DATA_LOG_CSV, index=False, encoding='utf-8-sig')

        print(f"[DEBUG] CSV written to: {DATA_LOG_CSV}")

    
        df_final = pd.read_csv(DATA_LOG_CSV, encoding='utf-8-sig')
        df_final.to_excel(EXCEL_PATH, index=False)
        print(f"[DEBUG] Excel written to: {EXCEL_PATH}")

        return jsonify({'status': 'success', 'message': 'Process data saved to CSV and Excel'})

    except Exception as e:
        print(f"[Submit Process] Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
