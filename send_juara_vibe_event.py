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
    Kamu adalah asisten pribadi AI. Aku ingin mengirimkan detail event berikut ke WhatsApp:
    Event: {summary}
    Waktu: {start}
    Lokasi: {location}
    Deskripsi: {description}
    
    Tolong buatkan pesan WhatsApp yang keren, profesional, dan informatif. 
    Gunakan emoji yang relevan dan format yang rapi (bullet points).
    Sampaikan bahwa ini adalah pengingat untuk event #juaravibecoding.
    Jangan terlalu kaku, buat kesan yang semangat!
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"⚠️ Gagal menggunakan Gemini, menggunakan template manual. Error: {e}")
        return f"📢 *Pengingat Event: {summary}*\n\n📅 *Waktu:* {start}\n📍 *Lokasi:* {location}\n📝 *Deskripsi:* {description}\n\n#juaravibecoding"

def send_whatsapp_message(message, target_number):
    print(f"🌍 Membuka WhatsApp Web untuk nomor {target_number}...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3") 
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    driver = webdriver.Chrome(options=chrome_options)
    
    target_url = f"https://web.whatsapp.com/send?phone={target_number}"
    driver.get(target_url)
    
    # Menunggu sampai 120 detik agar user sempat scan QR jika diperlukan
    wait = WebDriverWait(driver, 120)
    try:
        # Menunggu sampai kotak chat muncul (mencari input text box di dalam #main)
        print("⏳ Menunggu WhatsApp Web siap dan chat terbuka...")
        # Pertama, pastikan #main ada (berarti sudah login)
        wait.until(EC.presence_of_element_located((By.ID, 'main')))
        
        # Kemudian, tunggu sampai text box input chat bisa diakses
        # Gunakan data-testid yang lebih spesifik untuk WhatsApp Web terbaru
        print("⏳ Mencari kotak input pesan...")
        chat_box_selector = 'div[data-testid="conversation-compose-box-input"]'
        
        try:
            chat_box = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, chat_box_selector)))
        except:
            # Fallback ke XPATH jika data-testid gagal
            chat_box_xpath = '//*[@id="main"]//div[@contenteditable="true"]'
            chat_box = wait.until(EC.element_to_be_clickable((By.XPATH, chat_box_xpath)))

        print("✅ Chat box ditemukan! Menyiapkan pesan...")
        chat_box.click()
        time.sleep(1)
        
        # Gunakan JavaScript untuk "paste" pesan agar mendukung emoji (BMP error fix)
        print("🤖 Mengetik pesan (termasuk emoji)...")
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
        
        # Ambil screenshot sebelum kirim untuk bukti ketikan
        driver.save_screenshot('wa_before_send.png')
        
        # Kirim dengan menekan Enter via ActionChains agar lebih natural
        from selenium.webdriver.common.action_chains import ActionChains
        actions = ActionChains(driver)
        actions.send_keys(Keys.ENTER)
        actions.perform()
        
        print("🚀 Enter telah ditekan. Menunggu sinkronisasi ke server (20 detik)...")
        
        # Tunggu lebih lama agar pesan benar-benar terkirim (status centang)
        time.sleep(20)
        
        # Ambil screenshot akhir sebagai bukti pengiriman sukses
        driver.save_screenshot('wa_final_confirmation.png')
        print("📸 Screenshot konfirmasi disimpan di wa_final_confirmation.png")
        
        print("🚀 Pesan #juaravibecoding berhasil dikirim dan disinkronkan!")
        time.sleep(2)




        
    except Exception as e:
        print(f"❌ Terjadi kesalahan saat automasi WhatsApp: {e}")
        try:
            driver.save_screenshot('error_wa.png')
            print("📸 Screenshot kesalahan disimpan di error_wa.png")
        except:
            pass
    finally:
        driver.quit()

def main():
    print("=== OpenClaw: Kirim Event #juaravibecoding ===")
    
    # Nomor target dari user
    target_phone = "62895331943599"
    
    event = find_juara_vibe_event()
    
    if not event:
        print("❌ Event #juaravibecoding tidak ditemukan di kalender Anda.")
        print("Pastikan ada event dengan judul yang mengandung '#juaravibecoding'.")
        return

    print(f"✅ Event ditemukan: {event['summary']}")
    
    summary_msg = generate_ai_message(event)
    
    print("\n--- Preview Pesan ---")
    print(summary_msg)
    print("---------------------\n")
    
    send_whatsapp_message(summary_msg, target_phone)
    print("🎉 Selesai!")

if __name__ == "__main__":
    main()
