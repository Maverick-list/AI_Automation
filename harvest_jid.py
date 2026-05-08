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

def harvest_jid():
    print("🕵️ Memanen ID Grup (JID) - Misi Kilat 15 Detik...")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        time.sleep(15) # Waktu aman sebelum crash
        
        # Ambil semua chat yang punya ID
        # Baris chat biasanya punya data-id atau ID yang mengandung JID
        print("📜 Mengekstrak ID dari daftar chat...")
        
        script = """
        let results = [];
        let rows = document.querySelectorAll('div[role="row"]');
        rows.forEach(row => {
            let titleSpan = row.querySelector('span[title]');
            let id = row.querySelector('div[data-testid="cell-frame-container"]')?.parentElement?.parentElement?.getAttribute('data-id');
            // Coba cara lain cari ID
            if (!id) {
                let cell = row.querySelector('[data-testid^="list-item-"]');
                if (cell) id = cell.getAttribute('data-testid');
            }
            if (titleSpan && id) {
                results.push({name: titleSpan.title, jid: id});
            }
        });
        return results;
        """
        
        data = driver.execute_script(script)
        
        print("\n=== HASIL PANEN JID ===")
        with open("wa_jid_list.txt", "w", encoding="utf-8") as f:
            for item in data:
                line = f"{item['name']} | {item['jid']}"
                print(line)
                f.write(line + "\n")
        
        print(f"\n✅ Berhasil memanen {len(data)} ID.")
        driver.quit()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    harvest_jid()
