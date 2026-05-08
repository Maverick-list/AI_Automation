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
existing_msg_ids = set()

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

def get_all_message_ids(driver):
    msg_ids = set()
    try:
        # Selector yang lebih luas untuk menangkap container pesan
        elements = driver.find_elements(By.XPATH, '//div[contains(@data-id, "false_") or contains(@data-id, "true_")]')
        for el in elements:
            id_attr = el.get_attribute("data-id")
            if id_attr:
                msg_ids.add(id_attr)
    except: pass
    return msg_ids

def main_test():
    global is_confirmed, existing_msg_ids
    print("🧪 === SIMULASI KONFIRMASI V9 (PATIENT SCANNER) === 🧪")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Menunggu WA Web termuat...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        
        # TUNGGU SAMPAI CHAT LAMA MUNCUL (Sabar)
        print("⏳ Menunggu histori chat muncul...")
        for _ in range(10):
            existing_msg_ids = get_all_message_ids(driver)
            if len(existing_msg_ids) > 0:
                break
            time.sleep(2)
        
        print(f"✅ Histori terdeteksi! Mencatat {len(existing_msg_ids)} pesan lama sebagai 'IGNORE LIST'.")

        # Mulai Alarm
        threading.Thread(target=alarm_worker, daemon=True).start()
        send_wa_message_handler(driver, "🚀 [V9 TEST] Mulai! Ketik 'aku terima' sekarang untuk mematikan.")
        
        last_spam_time = time.time()
        
        while not is_confirmed:
            try:
                current_elements = driver.find_elements(By.XPATH, '//div[contains(@data-id, "false_") or contains(@data-id, "true_")]')
                for el in current_elements:
                    msg_id = el.get_attribute("data-id")
                    
                    if msg_id and msg_id not in existing_msg_ids:
                        text = el.text.lower()
                        # Abaikan pesan bot
                        if "[v9 test]" in text or "☕" in text:
                            existing_msg_ids.add(msg_id)
                            continue
                        
                        if any(k in text for k in CONFIRM_KEYWORD):
                            is_confirmed = True
                            print(f"✅ KONFIRMASI VALID: {text}")
                            send_wa_message_handler(driver, "Konfirmasi anda kami terima. Mission Success V9!")
                            break
            except: pass
            
            if is_confirmed: break
            
            # Spam setiap 60 detik
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, "☕ [REMINDER V9] Ayok Bos, ketik 'aku terima'.")
                last_spam_time = time.time()
            time.sleep(0.5)
            
        print("✨ TEST V9 BERHASIL!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
