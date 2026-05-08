import os
import sys
import time
import threading
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import winsound

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

TARGET_PHONE = "6285191769521"
# KODE BARU UNTUK V11 AGAR TIDAK BENTROK DENGAN PESAN LAMA
VERIFY_CODE = "951"
CONFIRM_KEYWORD = f"aku terima {VERIFY_CODE}"

is_confirmed = False

def alarm_worker():
    global is_confirmed
    print(f"🎵 ALARM TEST V11 AKTIF (KODE: {VERIFY_CODE})...")
    while not is_confirmed:
        winsound.Beep(2000, 400)
        time.sleep(2)

def send_wa_message_handler(driver, message):
    try:
        chat_box_selector = 'div[data-testid="conversation-compose-box-input"]'
        chat_box = driver.find_element(By.CSS_SELECTOR, chat_box_selector)
        script = "var dataTransfer = new DataTransfer(); dataTransfer.setData('text/plain', arguments[1]); var event = new ClipboardEvent('paste', {clipboardData: dataTransfer, bubbles: true, cancelable: true}); arguments[0].focus(); arguments[0].dispatchEvent(event);"
        driver.execute_script(script, chat_box, message)
        time.sleep(0.5)
        chat_box.send_keys(Keys.ENTER)
    except: pass

def main_test():
    global is_confirmed, VERIFY_CODE, CONFIRM_KEYWORD
    print(f"🧪 === SIMULASI KONFIRMASI V11 (KODE BARU: {VERIFY_CODE}) === 🧪")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Menunggu WA Web...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        
        # Mulai Alarm
        threading.Thread(target=alarm_worker, daemon=True).start()
        
        # Kirim instruksi KODE BARU
        instruction = f"🚀 [V11 FINAL] Silakan ketik: *{CONFIRM_KEYWORD}*"
        send_wa_message_handler(driver, instruction)
        
        last_spam_time = time.time()
        print(f"🕵️ Memantau gelembung pesan terakhir untuk kode {VERIFY_CODE}...")
        
        while not is_confirmed:
            try:
                # Ambil semua gelembung pesan
                bubbles = driver.find_elements(By.XPATH, '//div[contains(@class, "copyable-text")]')
                if bubbles:
                    # Cek 3 pesan PALING BAWAH
                    for b in bubbles[-3:]:
                        text = b.text.lower()
                        
                        # Hanya terima jika ada kode 951 dan bukan pesan bot
                        if CONFIRM_KEYWORD.lower() in text and "[v11]" not in text and "☕" not in text:
                            is_confirmed = True
                            print(f"✅ KONFIRMASI DITERIMA: {text}")
                            send_wa_message_handler(driver, f"Konfirmasi {VERIFY_CODE} diterima! Alarm MATI TOTAL.")
                            break
            except: pass
            
            if is_confirmed: break
            
            # Spam santai setiap 60 detik
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, f"☕ [V11 REMINDER] Ketik: *{CONFIRM_KEYWORD}*")
                last_spam_time = time.time()
                
            time.sleep(0.5)
            
        print(f"✨ TEST V11 BERHASIL DENGAN KODE {VERIFY_CODE}!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
