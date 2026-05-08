import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

def take_diagnostic_screenshot():
    print("📸 Memulai Diagnosa Visual...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    
    try:
        driver = webdriver.Chrome(options=opts)
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu pemuatan (30 detik)...")
        time.sleep(30)
        
        path = os.path.join(os.getcwd(), "diagnostic_wa.png")
        driver.save_screenshot(path)
        print(f"✅ Screenshot diagnosa disimpan di: {path}")
        driver.quit()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    take_diagnostic_screenshot()
