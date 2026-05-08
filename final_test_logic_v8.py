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
    """Mengambil semua ID pesan unik yang ada di layar saat ini"""
    msg_ids = set()
    try:
        # Mencari elemen container pesan yang memiliki data-id
        elements = driver.find_elements(By.XPATH, '//div[contains(@data-id, "false_") or contains(@data-id, "true_")]')
        for el in elements:
            id_attr = el.get_attribute("data-id")
            if id_attr:
                msg_ids.add(id_attr)
    except: pass
    return msg_ids

def main_test():
    global is_confirmed, existing_msg_ids
    print("🧪 === SIMULASI KONFIRMASI ID-TRACKING (ULTRA ACCURATE) === 🧪")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Menunggu WA Web termuat...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        
        # 1. CATAT SEMUA ID PESAN LAMA
        print("📝 Mencatat ID pesan-pesan lama...")
        existing_msg_ids = get_all_message_ids(driver)
        print(f"Berhasil mencatat {len(existing_msg_ids)} pesan lama. Pesan ini tidak akan dihitung.")

        # 2. MULAI ALARM & SPAM
        threading.Thread(target=alarm_worker, daemon=True).start()
        send_wa_message_handler(driver, "🚀 [V8 TEST] Sistem deteksi ID dimulai. Ketik 'aku terima' sekarang.")
        
        last_spam_time = time.time()
        
        while not is_confirmed:
            try:
                # Ambil semua pesan di layar sekarang
                current_elements = driver.find_elements(By.XPATH, '//div[contains(@data-id, "false_") or contains(@data-id, "true_")]')
                
                for el in current_elements:
                    msg_id = el.get_attribute("data-id")
                    
                    # Jika ini adalah PESAN BARU (ID belum ada di catatan awal)
                    if msg_id and msg_id not in existing_msg_ids:
                        text = el.text.lower()
                        
                        # Abaikan pesan bot sendiri
                        if "[v8 test]" in text or "☕" in text: 
                            existing_msg_ids.add(msg_id) # Masukkan ke daftar agar tidak dicek lagi
                            continue
                        
                        # Cari keyword konfirmasi
                        if any(k in text for k in CONFIRM_KEYWORD):
                            is_confirmed = True
                            print(f"✅ KONFIRMASI VALID TERDETEKSI: {text}")
                            send_wa_message_handler(driver, "Konfirmasi anda kami terima. Deteksi ID berhasil!")
                            break
            except: pass
            
            if is_confirmed: break
            
            # Spam setiap 60 detik
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, "☕ [REMINDER] Ketik 'aku terima' ya Bos.")
                last_spam_time = time.time()
                
            time.sleep(0.5)
            
        print("✨ TEST ID-TRACKING BERHASIL!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
