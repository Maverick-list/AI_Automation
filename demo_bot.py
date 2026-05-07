import os
import sys
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import google.generativeai as genai
from dotenv import load_dotenv

from openclaw import calendar_module

# Konfigurasi encoding stdout agar mendukung emoji di Windows
sys.stdout.reconfigure(encoding='utf-8')

def generate_ai_summary(events):
    print("🤖 Meminta Gemini untuk merangkum jadwal...")
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Kamu adalah asisten kalender pribadi. Berikut adalah jadwal pengguna hari ini:
    {events}
    
    Buatkan pesan singkat, ramah, dan memotivasi untuk dikirimkan melalui WhatsApp di pagi hari. 
    Gunakan format list yang rapi dengan emoji yang sesuai.
    Jangan terlalu panjang.
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
    
    # Gunakan direct link untuk membuka chat
    target_url = f"https://web.whatsapp.com/send?phone={target_number}"
    print(f"Mengarahkan ke {target_url}...")
    driver.get(target_url)
    
    print("⏳ Menunggu obrolan dimuat (mencari panel utama)...")
    
    wait = WebDriverWait(driver, 60)
    try:
        # Menunggu ID 'main' yang menandakan chat sudah terbuka sepenuhnya
        wait.until(EC.presence_of_element_located((By.ID, 'main')))
        print("✅ Chat ditemukan! Mengetik pesan...")
        
        # Jeda sejenak untuk memastikan kursor sudah fokus ke kotak teks secara otomatis
        time.sleep(3)
        
        from selenium.webdriver.common.action_chains import ActionChains
        actions = ActionChains(driver)
        
        # Kirim pesan baris demi baris menggunakan aksi kursor (sangat aman dari perubahan struktur web)
        for line in message.split('\n'):
            if line.strip():
                actions.send_keys(line)
            actions.key_down(Keys.SHIFT).send_keys(Keys.ENTER).key_up(Keys.SHIFT)
            
        # Hapus shift+enter terakhir dan kirim
        actions.send_keys(Keys.ENTER)
        actions.perform()
        
        print("🚀 Pesan berhasil terkirim!")
        
        # Tahan sebentar agar pesan benar-benar terkirim sebelum browser ditutup
        time.sleep(5)
        
    except Exception as e:
        print(f"❌ Terjadi kesalahan saat automasi WhatsApp: {e}")
    finally:
        driver.quit()

def main():
    print("=== Demo Automasi OpenClaw (Calendar -> Gemini -> WhatsApp) ===")
    
    # Nomor target dari pengguna
    target_phone = "6285191769521"
    
    # 1. Ambil Jadwal
    print("\n[1/3] Mengambil data dari Google Calendar...")
    service = calendar_module.get_calendar_service()
    events = calendar_module.fetch_today_events(service)
    
    if not events:
        print("Tidak ada jadwal hari ini. Demo dibatalkan.")
        return
        
    event_list = []
    for e in events:
        start = e['start'].get('dateTime', e['start'].get('date'))
        event_list.append(f"{start}: {e['summary']}")
        
    # 2. Proses AI
    print("\n[2/3] Memproses data dengan Gemini AI...")
    summary_msg = generate_ai_summary(event_list)
    print("\n--- Pesan yang akan dikirim ---")
    print(summary_msg)
    print("-------------------------------\n")
    
    # 3. Kirim via WA
    print(f"[3/3] Menjalankan robot browser ke nomor {target_phone}...")
    send_whatsapp_message(summary_msg, target_phone)
    print("🎉 Demo selesai!")

if __name__ == "__main__":
    main()
