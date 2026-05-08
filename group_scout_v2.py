import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

def scout_v2():
    print("🕵️ Memulai Pencarian Nama Chat V2...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (Silakan pastikan WA sudah terbuka di layar)...")
        
        # Tunggu manual 20 detik agar benar-benar siap
        time.sleep(20)
        
        found_names = set()
        print("📜 Memindai daftar chat...")
        
        for i in range(10):
            # Ambil semua elemen yang punya title (biasanya judul chat)
            spans = driver.find_elements(By.TAG_NAME, "span")
            for span in spans:
                title = span.get_attribute("title")
                if title and len(title) > 1:
                    found_names.add(title)
            
            # Scroll sedikit
            try:
                pane = driver.find_element(By.ID, "pane-side")
                driver.execute_script("arguments[0].scrollTop += 800;", pane)
            except: pass
            time.sleep(2)
            print(f"Langkah {i+1}/10 selesai...")

        print("\n=== DAFTAR CHAT / GRUP YANG TERDETEKSI ===")
        sorted_names = sorted(list(found_names))
        for j, name in enumerate(sorted_names, 1):
            print(f"{j}. {name}")
            
        print(f"\n✅ Berhasil mendeteksi {len(sorted_names)} nama.")
        
        # Simpan ke file
        with open("wa_scout_v2.txt", "w", encoding="utf-8") as f:
            for n in sorted_names:
                f.write(n + "\n")
                
        while True: time.sleep(10)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    scout_v2()
