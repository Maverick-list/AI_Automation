import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

def scout_groups():
    print("🕵️ Memulai Pencarian Seluruh Grup WA...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (max 120s)...")
        WebDriverWait(driver, 120).until(EC.presence_of_element_located((By.XPATH, '//div[@data-tab="3"]')))
        
        # Coba klik filter "Groups" jika ada
        try:
            print("🔍 Mencoba memfilter daftar Grup...")
            # Filter button biasanya memiliki teks 'Groups' atau icon tertentu
            filters = driver.find_elements(By.XPATH, "//button[contains(., 'Groups')]")
            if filters:
                filters[0].click()
                time.sleep(2)
                print("✅ Filter 'Groups' aktif.")
        except:
            print("ℹ️ Tombol filter tidak ditemukan, memindai daftar manual.")

        # Scrolling untuk memuat semua chat
        print("📜 Melakukan scrolling untuk memuat daftar...")
        pane = driver.find_element(By.ID, "pane-side")
        found_groups = set()
        
        for _ in range(15): # Scroll 15 kali
            # Ambil semua judul chat yang terlihat
            elements = driver.find_elements(By.XPATH, '//span[@title]')
            for el in elements:
                title = el.get_attribute("title")
                if title and len(title) > 0:
                    found_groups.add(title)
            
            # Scroll ke bawah
            driver.execute_script("arguments[0].scrollTop += 1000;", pane)
            time.sleep(1.5)
        
        print("\n=== DAFTAR GRUP / CHAT DITEMUKAN ===")
        sorted_groups = sorted(list(found_groups))
        for i, name in enumerate(sorted_groups, 1):
            print(f"{i}. {name}")
        
        # Simpan ke file
        with open("wa_group_list.txt", "w", encoding="utf-8") as f:
            for name in sorted_groups:
                f.write(name + "\n")
        
        print(f"\n✅ Total {len(sorted_groups)} entri disimpan ke 'wa_group_list.txt'")
        print("Silakan cek daftar di atas, Bos. Beritahu saya mana yang 'Business project' asli.")
        
        # Jaga tetap terbuka agar Bos bisa lihat
        while True: time.sleep(10)

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        pass # Biarkan terbuka agar user bisa lihat browsernya

if __name__ == "__main__":
    scout_groups()
