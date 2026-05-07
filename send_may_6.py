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

import google.generativeai as genai
from dotenv import load_dotenv

from openclaw import calendar_module

sys.stdout.reconfigure(encoding='utf-8')

def generate_ai_summary(events):
    print("🤖 Meminta Gemini untuk merangkum jadwal 6 Mei 2026...")
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Kamu adalah asisten pribadi AI. Berikut adalah jadwal pengguna untuk hari Rabu, 6 Mei 2026:
    {events}
    
    Tolong tuliskan draf pesan WhatsApp untuk dikirimkan ke pengguna.
    Pesan harus ramah, ringkas, dan jelas menginformasikan apa saja event/task yang ada di hari Rabu tanggal 6 Mei 2026 tersebut.
    Jika jadwalnya kosong, beri tahu dengan kalimat yang ceria.
    Gunakan list dan emoji agar mudah dibaca.
    """
    
    response = model.generate_content(prompt)
    return response.text.strip()

def send_whatsapp_message(message, target_number):
    print("🌍 Membuka WhatsApp Web...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3") 
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(options=chrome_options)
    
    target_url = f"https://web.whatsapp.com/send?phone={target_number}"
    print(f"Mengarahkan ke {target_url}...")
    driver.get(target_url)
    
    print("⏳ Menunggu obrolan dimuat (mencari panel utama)...")
    
    wait = WebDriverWait(driver, 60)
    try:
        wait.until(EC.presence_of_element_located((By.ID, 'main')))
        print("✅ Chat ditemukan! Mengetik pesan...")
        
        time.sleep(3)
        from selenium.webdriver.common.action_chains import ActionChains
        actions = ActionChains(driver)
        
        for line in message.split('\n'):
            if line.strip():
                actions.send_keys(line)
            actions.key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT)
            
        actions.send_keys(Keys.ENTER)
        actions.perform()
        
        print("🚀 Pesan berhasil terkirim!")
        time.sleep(5)
        
    except Exception as e:
        print(f"❌ Terjadi kesalahan saat automasi WhatsApp: {e}")
    finally:
        driver.quit()

def main():
    print("=== Mengirim Jadwal 6 Mei 2026 via WhatsApp ===")
    
    target_phone = "6285191769521"
    
    print("\n[1/3] Mengambil data dari Google Calendar (Rabu, 6 Mei 2026)...")
    service = calendar_module.get_calendar_service()
    
    # Set tanggal target: 6 Mei 2026
    target_date = datetime.date(2026, 5, 6)
    events = calendar_module.fetch_events_by_date(service, target_date)
    
    event_list = []
    if not events:
        event_list.append("Tidak ada event/task yang dijadwalkan pada hari ini.")
    else:
        for e in events:
            start = e['start'].get('dateTime', e['start'].get('date'))
            event_list.append(f"{start}: {e['summary']}")
            
    print("\n[2/3] Memproses data dengan Gemini AI...")
    summary_msg = generate_ai_summary(event_list)
    print("\n--- Pesan yang akan dikirim ---")
    print(summary_msg)
    print("-------------------------------\n")
    
    print(f"[3/3] Menjalankan robot browser ke nomor {target_phone}...")
    send_whatsapp_message(summary_msg, target_phone)
    print("🎉 Selesai!")

if __name__ == "__main__":
    main()
