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
# Kode Baru V12
CODE = str(random.randint(100, 999))
# Kata kunci yang benar-benar berbeda
SECRET_WORD = f"SETUJU {CODE}"

is_confirmed = False

def alarm_worker():
    global is_confirmed
    print(f"🎵 ALARM TEST V12 AKTIF (KODE: {SECRET_WORD})...")
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
    global is_confirmed, SECRET_WORD
    print(f"🧪 === SIMULASI KONFIRMASI V12 (STRICT MATCH) === 🧪")
    
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
        
        # Kirim instruksi yang SANGAT BERBEDA dengan kata kuncinya
        # Agar bot tidak menemukan kata kunci di dalam instruksinya sendiri secara utuh
        instruction = f"👉 [V12] Mohon ketik kata kunci rahasia berikut: *{SECRET_WORD}*"
        send_wa_message_handler(driver, instruction)
        
        last_spam_time = time.time()
        
        while not is_confirmed:
            try:
                # Cari bubble pesan masuk (In) - gelembung putih/kiri
                # Ini akan memastikan bot TIDAK membaca pesan keluar (hijau/kanan) miliknya sendiri
                bubbles = driver.find_elements(By.XPATH, '//div[contains(@class, "message-in")]')
                
                if bubbles:
                    for b in bubbles[-3:]:
                        text = b.text.strip()
                        
                        # STRICT MATCH: Harus sama persis dengan kode rahasia
                        if SECRET_WORD in text:
                            is_confirmed = True
                            print(f"✅ KONFIRMASI VALID DITEMUKAN: {text}")
                            send_wa_message_handler(driver, f"Konfirmasi {SECRET_WORD} diterima! AKHIRNYA BERHASIL.")
                            break
            except: pass
            
            if is_confirmed: break
            
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, f"☕ [V12 REMINDER] Ketik: *{SECRET_WORD}*")
                last_spam_time = time.time()
            time.sleep(0.5)
            
        print("✨ TEST V12 SELESAI!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
