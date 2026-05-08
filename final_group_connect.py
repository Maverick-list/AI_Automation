import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

TARGET_GROUP = "Business project"

def final_connection_attempt():
    print(f"--- Mencoba Koneksi Grup: {TARGET_GROUP} ---")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (25 detik)...")
        time.sleep(25)
        
        # 1. Coba klik filter 'Grup' (biasanya ada di samping Favorit)
        print("🔍 Mencari filter 'Grup'...")
        try:
            # Mencari tombol filter yang mengandung kata 'Grup' atau 'Groups'
            filter_buttons = driver.find_elements(By.XPATH, "//button[contains(., 'Grup') or contains(., 'Groups')]")
            if filter_buttons:
                filter_buttons[0].click()
                print("✅ Filter 'Grup' diaktifkan.")
                time.sleep(3)
        except:
            print("ℹ️ Tombol filter tidak ditemukan, lanjut scan manual.")

        # 2. Scan daftar chat
        print(f"📜 Mencari '{TARGET_GROUP}' di daftar...")
        found = False
        for i in range(15):
            try:
                target_span = driver.find_element(By.XPATH, f"//span[@title='{TARGET_GROUP}']")
                # Cari div induk yang clickable
                parent_div = target_span.find_element(By.XPATH, "./ancestor::div[@role='row' or @data-testid='cell-frame-container']")
                print(f"🎯 KETEMU! Mengklik baris grup...")
                driver.execute_script("arguments[0].click();", parent_div)
                time.sleep(3)
                
                if driver.find_element(By.ID, 'main'):
                    print("✅ BERHASIL MASUK!")
                    
                    # Kirim pesan kemenangan
                    chat_box = driver.find_element(By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]')
                    msg = "🏆 *OpenClaw Final Victory:* Grup terdeteksi & terhubung sempurna! 🦾🤖🥇"
                    
                    script = "var dt=new DataTransfer();dt.setData('text/plain',arguments[1]);var e=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});arguments[0].focus();arguments[0].dispatchEvent(e);"
                    driver.execute_script(script, chat_box, msg)
                    time.sleep(1)
                    chat_box.send_keys(Keys.ENTER)
                    print("✅ Pesan terkirim!")
                    found = True
                    break
            except:
                pass
            
            # Scroll panel chat
            try:
                pane = driver.find_element(By.ID, "pane-side")
                driver.execute_script("arguments[0].scrollTop += 800;", pane)
            except: pass
            time.sleep(2)

        if not found:
            print(f"❌ Grup '{TARGET_GROUP}' tidak ditemukan di daftar.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        pass

if __name__ == "__main__":
    final_connection_attempt()
