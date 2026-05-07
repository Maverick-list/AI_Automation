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

from openclaw import calendar_module

sys.stdout.reconfigure(encoding='utf-8')

def find_juara_vibe_event():
    service = calendar_module.get_calendar_service()
    if not service:
        print("❌ Gagal mendapatkan service Google Calendar.")
        return None

    print("🔍 Mencari event dengan tag #juaravibecoding...")
    # Cari event mulai dari hari ini (UTC)
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    try:
        events_result = service.events().list(
            calendarId='primary',
            q='#juaravibecoding',
            timeMin=now,
            maxResults=5,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        if not events:
            # Jika tidak ketemu di masa depan, coba cari semua event dengan query tersebut
            events_result = service.events().list(
                calendarId='primary',
                q='#juaravibecoding',
                maxResults=5,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            events = events_result.get('items', [])

        if events:
            return events[0]
    except Exception as e:
        print(f"❌ Error saat mencari event: {e}")
    
    return None

def generate_ai_message(event):
    print("🤖 Menyiapkan pesan menggunakan Gemini...")
    load_dotenv()
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    
    # Menggunakan gemini-2.5-flash sesuai yang tersedia di API user
    model_name = 'gemini-2.5-flash' 
    model = genai.GenerativeModel(model_name)
    
    summary = event.get('summary', '#juaravibecoding')
    start = event['start'].get('dateTime', event['start'].get('date'))
    description = event.get('description', 'Tidak ada deskripsi.')
    location = event.get('location', 'Tidak ditentukan.')
    
    prompt = f"""
    Kamu adalah asisten pribadi AI. Aku ingin mengirimkan detail event berikut ke grup WhatsApp:
    Event: {summary}
    Waktu: {start}
    Lokasi: {location}
    Deskripsi: {description}
    
    Tolong buatkan pesan WhatsApp yang keren, profesional, dan informatif untuk grup. 
    Gunakan emoji yang relevan dan format yang rapi (bullet points).
    Sampaikan bahwa ini adalah pengingat untuk event #juaravibecoding.
    Buat kesan yang menarik agar anggota grup tertarik untuk ikut!
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"⚠️ Gagal menggunakan Gemini, menggunakan template manual. Error: {e}")
        return f"📢 *PENGUMUMAN EVENT: {summary}*\n\n📅 *Waktu:* {start}\n📍 *Lokasi:* {location}\n📝 *Deskripsi:* {description}\n\nYuk ikutan teman-teman! #juaravibecoding"

def send_whatsapp_group_message(message, group_name):
    print(f"🌍 Membuka WhatsApp Web untuk mencari grup '{group_name}'...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3") 
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(options=chrome_options)
    
    driver.get("https://web.whatsapp.com")
    
    wait = WebDriverWait(driver, 120)
    try:
        # Tunggu sampai elemen pencarian muncul (berarti sudah login)
        print("⏳ Menunggu WhatsApp Web siap (mencari kotak pencarian)...")
        
        search_selectors = [
            (By.CSS_SELECTOR, 'div[data-testid="search-input"]'),
            (By.CSS_SELECTOR, 'div[contenteditable="true"][data-tab="3"]'),
            (By.CSS_SELECTOR, 'div[title="Cari atau mulai obrolan baru"]'),
            (By.XPATH, "//div[contains(text(), 'Cari atau mulai obrolan baru')]"),
            (By.XPATH, "//div[@contenteditable='true']")
        ]
        
        search_box = None
        for by, selector in search_selectors:
            try:
                search_box = wait.until(EC.presence_of_element_located((by, selector)))
                if search_box:
                    print(f"✅ Kotak pencarian ditemukan via: {selector}")
                    break
            except:
                continue
        
        if not search_box:
            raise Exception("Kotak pencarian tidak ditemukan dengan selector manapun.")
            
        # Mencari grup
        print(f"🔍 Mencari grup: {group_name}")
        search_box.click()
        time.sleep(2)
        # Hapus isi jika ada
        search_box.send_keys(Keys.CONTROL + "a")
        search_box.send_keys(Keys.BACKSPACE)
        time.sleep(1)
        search_box.send_keys(group_name)
        time.sleep(5) # Beri waktu hasil pencarian muncul
        
        # Klik pada grup hasil pencarian
        print(f"🖱️ Memilih grup '{group_name}' dari daftar...")
        group_xpath = f"//span[@title='{group_name}']"
        group_element = wait.until(EC.element_to_be_clickable((By.XPATH, group_xpath)))
        group_element.click()
        
        time.sleep(3)



        
        # Mencari kotak input pesan
        print("⏳ Menyiapkan kotak input pesan...")
        chat_box_selector = 'div[data-testid="conversation-compose-box-input"]'
        chat_box = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, chat_box_selector)))
        chat_box.click()
        
        # Paste pesan via JS (mendukung emoji)
        print("🤖 Mengetik pesan grup...")
        script = """
        var dataTransfer = new DataTransfer();
        dataTransfer.setData('text/plain', arguments[1]);
        var event = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true
        });
        arguments[0].focus();
        arguments[0].dispatchEvent(event);
        """
        driver.execute_script(script, chat_box, message)
        
        time.sleep(2)
        
        # Kirim
        print("🚀 Mengirim ke grup...")
        actions = ActionChains(driver)
        actions.send_keys(Keys.ENTER)
        actions.perform()
        
        # Tunggu sinkronisasi
        print("⏳ Menunggu konfirmasi pengiriman (20 detik)...")
        time.sleep(20)
        
        driver.save_screenshot('wa_group_confirmation.png')
        print("📸 Screenshot konfirmasi grup disimpan di wa_group_confirmation.png")
        
        print(f"🚀 Pesan berhasil dikirim ke grup '{group_name}'!")
        
    except Exception as e:
        print(f"❌ Terjadi kesalahan saat automasi grup: {e}")
        try:
            driver.save_screenshot('error_group_wa.png')
            print("📸 Screenshot kesalahan disimpan di error_group_wa.png")
        except:
            pass
    finally:
        driver.quit()

def main():
    print("=== OpenClaw: Kirim Event ke Grup WhatsApp ===")
    
    target_group = "PUBLIC RELATIONS"
    
    event = find_juara_vibe_event()
    
    if not event:
        print("❌ Event #juaravibecoding tidak ditemukan.")
        return

    print(f"✅ Event ditemukan: {event['summary']}")
    
    summary_msg = generate_ai_message(event)
    
    print("\n--- Preview Pesan Grup ---")
    print(summary_msg)
    print("--------------------------\n")
    
    send_whatsapp_group_message(summary_msg, target_group)
    print("🎉 Selesai!")

if __name__ == "__main__":
    main()
