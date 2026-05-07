import os
import sys
import time
import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

import google.generativeai as genai
from dotenv import load_dotenv

from openclaw import calendar_module, gmail_module

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

TARGET_PHONE = "6285191769521"
SENDER_FILTER = "goldnation" # Filter khusus untuk Goldnation

def get_gemini_response(prompt):
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error AI: {e}"

def process_wa_to_calendar(text, cal_service):
    prompt = f"""
    Analisis pesan berikut: "{text}"
    Jika pesan ini berisi instruksi untuk menambahkan jadwal atau acara ke kalender, ekstrak informasi berikut dalam format JSON:
    {{
        "is_calendar_event": true,
        "summary": "nama acara",
        "start_iso": "YYYY-MM-DDTHH:MM:SS",
        "end_iso": "YYYY-MM-DDTHH:MM:SS"
    }}
    Waktu sekarang adalah {datetime.datetime.now().isoformat()}.
    Hanya kembalikan JSON.
    """
    response_text = get_gemini_response(prompt)
    try:
        import json
        clean_json = response_text.replace('```json', '').replace('```', '').strip()
        data = json.loads(clean_json)
        if data.get("is_calendar_event"):
            calendar_module.add_calendar_event(
                cal_service, 
                data['summary'], 
                "Ditambahkan via WhatsApp OpenClaw", 
                data['start_iso'], 
                data['end_iso']
            )
            return f"✅ Jadwal '{data['summary']}' berhasil ditambahkan ke kalender!"
    except:
        pass
    return None

def main():
    print("=== Memulai Asisten Pintar OpenClaw (Versi Filter Gmail) ===", flush=True)
    
    cal_service = calendar_module.get_calendar_service()
    gmail_service = gmail_module.get_gmail_service()
    
    print("Membuka WhatsApp Web...", flush=True)
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    
    driver = webdriver.Chrome(options=chrome_options)
    wait = WebDriverWait(driver, 120)
    
    driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
    wait.until(EC.presence_of_element_located((By.ID, 'main')))
    print("✅ WhatsApp Terhubung.", flush=True)

    last_wa_message = ""
    processed_email_ids = set() # Untuk mencegah duplikasi pengiriman email yang sama

    try:
        while True:
            # --- CEK GMAIL (Khusus Goldnation) ---
            print(f"🕒 Memeriksa email terbaru dari '{SENDER_FILTER}'...", flush=True)
            email = gmail_module.get_latest_unread_email(gmail_service, sender_filter=SENDER_FILTER)
            
            if email and email['id'] not in processed_email_ids:
                processed_email_ids.add(email['id'])
                
                # Buat pesan notifikasi
                msg = f"📩 *Email Baru dari {SENDER_FILTER}!*\n\n"
                msg += f"*Subjek:* {email['subject']}\n"
                msg += f"*Isi:* {email['body']}..." # Menampilkan snippet
                
                print(f"Mengirim notifikasi email: {email['subject']}", flush=True)
                
                actions = ActionChains(driver)
                for line in msg.split('\n'):
                    actions.send_keys(line).key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT)
                actions.send_keys(Keys.ENTER).perform()

            # --- CEK WHATSAPP (Input Kalender) ---
            try:
                messages = driver.find_elements(By.XPATH, '//div[contains(@class, "message-in")]//span[contains(@class, "selectable-text")]')
                if messages:
                    current_msg = messages[-1].text
                    if current_msg != last_wa_message:
                        last_wa_message = current_msg
                        print(f"Pesan WA baru: {current_msg}", flush=True)
                        result = process_wa_to_calendar(current_msg, cal_service)
                        if result:
                            ActionChains(driver).send_keys(result).send_keys(Keys.ENTER).perform()
            except:
                pass

            time.sleep(60) # Cek setiap 1 menit agar tidak terlalu sering

    except KeyboardInterrupt:
        print("\nBerhenti.", flush=True)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
