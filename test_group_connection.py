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

def test_connection():
    print(f"🚀 Mencoba menyambungkan ke grup: {TARGET_GROUP}...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web...")
        WebDriverWait(driver, 120).until(EC.presence_of_element_located((By.XPATH, '//div[@data-tab="3"]')))
        
        # Gunakan metode pencarian yang sudah terbukti di Scout V2
        search_box = driver.find_element(By.XPATH, '//div[@contenteditable="true"][@data-tab="3"]')
        search_box.click()
        search_box.send_keys(TARGET_GROUP)
        time.sleep(3)
        search_box.send_keys(Keys.ENTER)
        time.sleep(3)
        
        # Verifikasi apakah chat terbuka
        if driver.find_element(By.ID, 'main'):
            print(f"✅ BERHASIL MASUK ke grup: {TARGET_GROUP}")
            
            # Kirim pesan tes
            chat_box = driver.find_element(By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]')
            msg = "⚡ *OpenClaw Connection Test:* Sistem Terhubung & Siap Tempur! 🦾🤖"
            
            script = "var dt=new DataTransfer();dt.setData('text/plain',arguments[1]);var e=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});arguments[0].focus();arguments[0].dispatchEvent(e);"
            driver.execute_script(script, chat_box, msg)
            time.sleep(1)
            chat_box.send_keys(Keys.ENTER)
            
            print("✅ Pesan tes terkirim!")
        else:
            print("❌ Gagal membuka chat grup.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_connection()
