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
# Kode Unik Baru untuk V10
VERIFY_CODE = str(random.randint(100, 999))
CONFIRM_KEYWORD = f"aku terima {VERIFY_CODE}"

is_confirmed = False
existing_ids = set()

def alarm_worker():
    global is_confirmed
    print(f"🎵 ALARM TEST V10 AKTIF (KODE: {VERIFY_CODE})...")
    while not is_confirmed:
        winsound.Beep(2000, 400)
        time.sleep(2)

def get_all_ids(driver):
    ids = set()
    try:
        # Mencari semua elemen yang memiliki data-id (standar WA Web untuk pesan)
        elements = driver.find_elements(By.XPATH, '//div[contains(@data-id, "false_") or contains(@data-id, "true_")]')
        for el in elements:
            id_attr = el.get_attribute("data-id")
            if id_attr: ids.add(id_attr)
    except: pass
    return ids

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
    global is_confirmed, VERIFY_CODE, CONFIRM_KEYWORD, existing_ids
    print(f"🧪 === SIMULASI KONFIRMASI V10 (ANTI-HALLUCINATION) === 🧪")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Menunggu WA Web termuat...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        
        # 1. TUNGGU HISTORI LOAD DAN CATAT ID LAMA
        print("📝 Mencatat histori chat agar tidak salah baca...")
        time.sleep(5) # Beri waktu agar bubble muncul
        existing_ids = get_all_ids(driver)
        print(f"Berhasil mencatat {len(existing_ids)} pesan lama.")

        # 2. MULAI ALARM
        threading.Thread(target=alarm_worker, daemon=True).start()
        
        # 3. KIRIM INSTRUKSI & CATAT ID INSTRUKSI TERSEBUT AGAR DIABAIKAN
        instruction = f"🚀 [V10 FINAL] Ketik: *{CONFIRM_KEYWORD}* untuk mematikan alarm."
        send_wa_message_handler(driver, instruction)
        time.sleep(2)
        
        # Update existing_ids lagi untuk memasukkan pesan instruksi yang baru dikirim
        existing_ids = existing_ids.union(get_all_ids(driver))
        
        last_spam_time = time.time()
        
        print(f"🕵️ Menunggu balasan baru dengan kode {VERIFY_CODE}...")
        
        while not is_confirmed:
            try:
                # Ambil semua pesan di layar
                current_elements = driver.find_elements(By.XPATH, '//div[contains(@data-id, "false_") or contains(@data-id, "true_")]')
                
                for el in current_elements:
                    msg_id = el.get_attribute("data-id")
                    
                    # HANYA PROSES PESAN DENGAN ID BARU
                    if msg_id and msg_id not in existing_ids:
                        text = el.text.lower()
                        
                        # Cari keyword + kode unik
                        if CONFIRM_KEYWORD.lower() in text:
                            is_confirmed = True
                            print(f"✅ KONFIRMASI VALID DITEMUKAN: {text}")
                            send_wa_message_handler(driver, f"Konfirmasi diterima! Anda berhasil menjinakkan asisten V10.")
                            break
                        else:
                            # Jika pesan baru tapi bukan konfirmasi, tetap masukkan ke existing agar tidak diproses ulang
                            existing_ids.add(msg_id)
            except: pass
            
            if is_confirmed: break
            
            # Spam santai setiap 60 detik
            if time.time() - last_spam_time > 60:
                send_wa_message_handler(driver, f"☕ [V10 REMINDER] Ayo ketik: *{CONFIRM_KEYWORD}*")
                last_spam_time = time.time()
                # Update ID lagi setelah spam agar tidak membaca spamnya sendiri
                time.sleep(2)
                existing_ids = existing_ids.union(get_all_ids(driver))
                
            time.sleep(0.5)
            
        print(f"✨ TEST V10 BERHASIL!")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main_test()
