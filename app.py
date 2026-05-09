from flask import Flask, render_template, request, jsonify
import os
import sys
import subprocess
import threading
import datetime
from openclaw import gmail_module, calendar_module, tasks_module, sheets_module, drive_module
import google.generativeai as genai
from dotenv import load_dotenv
from flask_cors import CORS

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

load_dotenv()

app = Flask(__name__)
CORS(app) # Allow cross-origin requests from React

# --- API HELPERS ---
def get_system_health():
    health = {}
    load_dotenv() # Refresh dotenv
    api_key = os.getenv("GEMINI_API_KEY")

    # 1. Gemini
    try:
        if not api_key:
            health['gemini'] = "Missing Key"
        else:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-3.1-flash-lite')
            model.generate_content("ping")
            health['gemini'] = "Connected"
    except Exception as e: 
        print(f"Gemini Error: {e}")
        health['gemini'] = "Error"
    
    # 2. Gmail
    try:
        if os.path.exists('token_gmail.json'):
            gmail_module.get_gmail_service()
            health['gmail'] = "Connected"
        else:
            health['gmail'] = "No Token"
    except Exception as e: 
        print(f"Gmail Error: {e}")
        health['gmail'] = "Error"
    
    # 3. Calendar (Uses token.json)
    try:
        if os.path.exists('token.json'):
            calendar_module.get_calendar_service()
            health['calendar'] = "Connected"
        else:
            health['calendar'] = "No Token"
    except Exception as e: 
        print(f"Calendar Error: {e}")
        health['calendar'] = "Error"
    
    # 4. Tasks
    try:
        if os.path.exists('token_tasks.json'):
            tasks_module.get_tasks_service()
            health['tasks'] = "Connected"
        else:
            health['tasks'] = "No Token"
    except Exception as e: 
        print(f"Tasks Error: {e}")
        health['tasks'] = "Error"

    # 5. Sheets
    try:
        if os.path.exists('token_sheets.json'):
            sheets_module.get_sheets_service()
            health['sheets'] = "Connected"
        else:
            health['sheets'] = "No Token"
    except Exception as e: 
        print(f"Sheets Error: {e}")
        health['sheets'] = "Error"

    # 6. Drive
    try:
        if os.path.exists('token_drive.json'):
            drive_module.get_drive_service()
            health['drive'] = "Connected"
        else:
            health['drive'] = "No Token"
    except Exception as e: 
        print(f"Drive Error: {e}")
        health['drive'] = "Error"

    # 7. WhatsApp
    if os.path.exists('whatsapp_profile'):
        health['whatsapp'] = "Connected"
    else:
        health['whatsapp'] = "Missing Profile"

    return health

# --- ROUTES ---

@app.route('/')
def index():
    return render_template('dashboard_v2.html')

@app.route('/api/health')
def health():
    return jsonify(get_system_health())

@app.route('/api/gmail/inbox')
def get_inbox():
    try:
        service = gmail_module.get_gmail_service()
        results = service.users().messages().list(userId='me', maxResults=5).execute()
        messages = results.get('messages', [])
        return jsonify({"count": len(messages), "status": "OK"})
    except:
        return jsonify({"status": "Error"})

@app.route('/api/calendar/events')
def get_events():
    try:
        service = calendar_module.get_calendar_service()
        now = datetime.datetime.utcnow().isoformat() + 'Z'
        events_result = service.events().list(calendarId='primary', timeMin=now,
                                              maxResults=5, singleEvents=True,
                                              orderBy='startTime').execute()
        events = events_result.get('items', [])
        return jsonify(events)
    except:
        return jsonify([])

@app.route('/api/sheets/products')
def get_products():
    try:
        with open("fundraising_db_id.txt", "r") as f:
            db_id = f.read().strip()
        data = sheets_module.get_sheet_values(db_id, "Sheet1!A2:E20")
        return jsonify(data)
    except:
        return jsonify([])

# --- BOT CONTROL ---
current_process = None

@app.route('/api/bot/start', methods=['POST'])
def start_bot():
    global current_process
    if current_process is None or current_process.poll() is not None:
        current_process = subprocess.Popen(['E:\\laragon\\bin\\python\\python-3.13\\python.exe', '-u', 'study_case_2_main.py'], cwd='e:\\OpenClaw')
        return jsonify({"message": "Mave AI Launched"})
    return jsonify({"message": "Already Running"})

@app.route('/api/bot/stop', methods=['POST'])
def stop_bot():
    global current_process
    os.system("taskkill /F /IM python.exe /T")
    os.system("taskkill /F /IM chrome.exe /T")
    current_process = None
    return jsonify({"message": "System Terminated"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
