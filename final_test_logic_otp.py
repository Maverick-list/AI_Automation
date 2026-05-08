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
# Buat angka acak untuk memastikan konfirmasi benar-benar baru
VERIFY_CODE = str(random.randint(100, 999))
CONFIRM_KEYWORD = f"aku terima {VERIFY_CODE}"

is_confirmed = False

def alarm_worker():
    global is_confirmed
    print("🎵 ALARM SANTAI AKTIF...")
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
    print(f"🧪 === SIMULASI KONFIRMASI KODE UNIK ({VERIFY_CODE}) === 🧪")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Menunggu WA Web termuat...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        
        # Mulai Alarm
        threading.Thread(target=alarm_worker, daemon=True).start()
        
        # Kirim instruksi dengan KODE UNIK
        instruction = f"🚀 [VERIFY TEST] Silakan ketik: *{CONFIRM_KEYWORD}* untuk mematikan alarm."
        send_wa_message_handler(driver, instruction)
        
        last_spam_time = time.time()
        
        while not is_confirmed:
            try:
                # Scan SELURUH gelembung chat (paling agresif)
                all_text_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'aku terima')]")
                for el in all_text_elements:
                    text = el.text.lower()
                    # Abaikan pesan instruksi bot sendiri
                    if "[verify test]" in text or "⚠️" in text: continue
                    
                    # Cek apakah ada KODE UNIK di pesan user
                    if CONFIRM_KEYWORD.lower() in text:
                        is_confirmed = True
                        print(f"✅ KONFIRMASI VALID DENGAN KODE {VERIFY_CODE} TERDETEKSI!")
                        send_wa_message_handler(driver, f"Konfirmasi '{CONFIRM_KEYWORD}' diterima. Sistem aman!")
                        break
            except: pass
            
            if is_confirmed: break
            
            # Spam setiap 60 detik
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, f"☕ [REMINDER] Mohon ketik: *{CONFIRM_KEYWORD}*")
                last_spam_time = time.time()
            time.sleep(0.5)
            
        print(f"✨ TEST KODE {VERIFY_CODE} BERHASIL!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
