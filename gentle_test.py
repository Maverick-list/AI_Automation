import os
import sys
import time
import threading
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
CONFIRM_KEYWORD = ["aku terima"]

is_confirmed = False

def alarm_worker():
    global is_confirmed
    print("🎵 ALARM SANTAI AKTIF...")
    while not is_confirmed:
        winsound.Beep(2000, 400) # Bunyi lebih rendah
        time.sleep(2) # Jeda lebih lama (Santai)

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
    global is_confirmed
    print("🍵 === SIMULASI KONFIRMASI SANTAI (ANTI-STALE) === 🍵")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Memuat WhatsApp Web...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        
        # Hitung pesan yang ada sekarang untuk diabaikan
        initial_bubbles = driver.find_elements(By.XPATH, '//div[contains(@class, "copyable-text")]')
        initial_count = len(initial_bubbles)
        print(f"Pesan lama ({initial_count}) akan diabaikan.")

        # Mulai Alarm & Spam
        threading.Thread(target=alarm_worker, daemon=True).start()
        send_wa_message_handler(driver, "🚀 [GENTLE TEST] Simulasi dimulai. Ketik 'aku terima' kapan saja.")
        
        last_spam_time = time.time()
        
        while not is_confirmed:
            try:
                # Cek pesan BARU saja
                current_bubbles = driver.find_elements(By.XPATH, '//div[contains(@class, "copyable-text")]')
                if len(current_bubbles) > initial_count:
                    new_messages = current_bubbles[initial_count:]
                    for b in new_messages:
                        text = b.text.lower()
                        # Abaikan pesan spam bot
                        if "[gentle test]" in text or "☕" in text: continue
                        
                        if any(k in text for k in CONFIRM_KEYWORD):
                            is_confirmed = True
                            print(f"✅ KONFIRMASI DITERIMA: {text}")
                            send_wa_message_handler(driver, "Konfirmasi anda kami terima. Terima kasih atas kerja samanya.")
                            break
            except: pass
            
            if is_confirmed: break
            
            # Spam setiap 60 DETIK (SESUAI PERMINTAAN)
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, "☕ [REMINDER] Mohon ketik 'aku terima' jika tugas sudah selesai.")
                last_spam_time = time.time()
                
            time.sleep(0.5)
            
        print("✨ TEST SANTAI BERHASIL!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
