import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

TARGET_GROUP = "Business project"

def connect_via_scan():
    print(f"🕵️ Mencoba koneksi ke '{TARGET_GROUP}' via Scan & Click...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (20 detik)...")
        time.sleep(20)
        
        found = False
        print("📜 Mencari grup di daftar chat...")
        
        for i in range(20): # Coba scroll 20 kali
            spans = driver.find_elements(By.XPATH, f"//span[@title='{TARGET_GROUP}']")
            if spans:
                print(f"🎯 Grup '{TARGET_GROUP}' DITEMUKAN!")
                # Klik elemen induknya agar aman
                driver.execute_script("arguments[0].click();", spans[0])
                time.sleep(3)
                
                # Cek apakah sudah masuk
                if driver.find_element(By.ID, 'main'):
                    print(f"✅ BERHASIL MASUK ke grup!")
                    
                    # Kirim pesan tes
                    chat_box = driver.find_element(By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]')
                    msg = "✨ *OpenClaw Connection Test:* Berhasil terhubung via Scan & Click! 🦾🤖🥇"
                    
                    script = "var dt=new DataTransfer();dt.setData('text/plain',arguments[1]);var e=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});arguments[0].focus();arguments[0].dispatchEvent(e);"
                    driver.execute_script(script, chat_box, msg)
                    time.sleep(1)
                    chat_box.send_keys(Keys.ENTER)
                    print("✅ Pesan tes terkirim!")
                    found = True
                    break
            
            # Scroll panel chat
            try:
                pane = driver.find_element(By.ID, "pane-side")
                driver.execute_script("arguments[0].scrollTop += 700;", pane)
            except: pass
            time.sleep(1.5)
            
        if not found:
            print(f"❌ Gagal menemukan '{TARGET_GROUP}' setelah 20 kali scroll.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        pass

if __name__ == "__main__":
    connect_via_scan()
