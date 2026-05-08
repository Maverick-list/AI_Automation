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

def send_to_group_robust(group_name, message):
    print(f"🚀 [ROBUST MODE] Mengirim ke Grup: {group_name}")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    # Gunakan beberapa argumen tambahan untuk stabilitas di Chrome terbaru
    opts.add_argument("--disable-extensions")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (30 detik)...")
        time.sleep(30)
        
        # JURUS PAMUNGKAS: Cari dan Klik via JS (Tanpa interaksi fisik Selenium yang bikin crash)
        print(f"🕵️ Mencari dan mengklik '{group_name}' via JavaScript Internal...")
        
        script = """
        function openChat(name) {
            const spans = document.querySelectorAll('span[title]');
            for (let span of spans) {
                if (span.title === name) {
                    const row = span.closest('div[role="row"]') || span.closest('div[data-testid="cell-frame-container"]');
                    if (row) {
                        const mousedown = new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window});
                        row.dispatchEvent(mousedown);
                        row.click();
                        return true;
                    }
                }
            }
            return false;
        }
        return openChat(arguments[0]);
        """
        
        success = driver.execute_script(script, group_name)
        
        if success:
            print(f"✅ Berhasil membuka grup '{group_name}'!")
            time.sleep(5)
            
            # Kirim Pesan via JS Paste
            print("📤 Mengirim pesan...")
            paste_script = """
            const chatBox = document.querySelector('div[data-testid="conversation-compose-box-input"]');
            if (chatBox) {
                const dt = new DataTransfer();
                dt.setData('text/plain', arguments[0]);
                const pasteEvent = new ClipboardEvent('paste', {
                    clipboardData: dt,
                    bubbles: true,
                    cancelable: true
                });
                chatBox.focus();
                chatBox.dispatchEvent(pasteEvent);
                return true;
            }
            return false;
            """
            
            if driver.execute_script(paste_script, message):
                time.sleep(1)
                # Gunakan Keys.ENTER untuk mengirim
                driver.switch_to.active_element.send_keys(Keys.ENTER)
                print("✅ PESAN TERKIRIM KE GRUP! 🎯🥇")
            else:
                print("❌ Gagal menemukan kotak input pesan.")
        else:
            print(f"❌ Grup '{group_name}' tidak ditemukan di layar awal. Mencoba scroll otomatis...")
            # Tambahkan logika scroll jika perlu, tapi untuk grup aktif biasanya ada di atas.
            
        time.sleep(5)
        print("Misi Selesai.")

    except Exception as e:
        print(f"🚨 Terjadi kesalahan: {e}")
    finally:
        # driver.quit() # Biarkan terbuka agar Bos bisa cek
        pass

if __name__ == "__main__":
    # Test langsung
    msg = "🚀 *OpenClaw Robust V1:* Solusi Kirim Grup Berhasil Terdeteksi! 🦾🤖🥇"
    send_to_group_robust("Business project", msg)
