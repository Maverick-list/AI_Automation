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

def search_master():
    print(f"--- V18 SEARCH MASTER: {TARGET_GROUP} ---")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (25 detik)...")
        time.sleep(25)
        
        # Cari kotak pencarian berdasarkan placeholder yang terlihat di screenshot
        print("🔍 Mencari kotak pencarian...")
        search_box = None
        selectors = [
            '//div[@contenteditable="true"][@data-tab="3"]',
            '//div[@title="Kotak teks input pencarian"]',
            '//p[contains(@class, "selectable-text") and contains(@class, "copyable-text")]',
            '//div[contains(., "Cari atau mulai obrolan baru")]'
        ]
        
        for sel in selectors:
            try:
                search_box = driver.find_element(By.XPATH, sel)
                if search_box:
                    print(f"✅ Kotak pencarian ditemukan via: {sel}")
                    break
            except: continue
            
        if not search_box:
            # Fallback: Klik area atas kiri
            print("ℹ️ Mencoba klik manual area pencarian...")
            driver.execute_script("document.querySelector('div[contenteditable=\"true\"]').focus();")
            search_box = driver.switch_to.active_element

        search_box.click()
        time.sleep(1)
        search_box.send_keys(Keys.CONTROL + "a")
        search_box.send_keys(Keys.DELETE)
        search_box.send_keys(TARGET_GROUP)
        time.sleep(3)
        search_box.send_keys(Keys.ENTER)
        time.sleep(3)
        
        # Verifikasi
        try:
            chat_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]'))
            )
            print("✅ BERHASIL MASUK KE CHAT!")
            msg = "🎖️ *OpenClaw Search Master (V18):* Koneksi Grup Terverifikasi! 🦾🤖🥇"
            
            script = "var dt=new DataTransfer();dt.setData('text/plain',arguments[1]);var e=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});arguments[0].focus();arguments[0].dispatchEvent(e);"
            driver.execute_script(script, chat_input, msg)
            time.sleep(1)
            chat_input.send_keys(Keys.ENTER)
            print("✅ Pesan konfirmasi terkirim!")
            
        except:
            print("❌ Gagal masuk ke panel chat setelah pencarian.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    search_master()
