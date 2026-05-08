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

def victory_v19():
    print(f"--- V19 VICTORY METHOD: {TARGET_GROUP} ---")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (30 detik)...")
        time.sleep(30)
        
        # 1. Klik tombol 'Chat Baru' (Icon Kotak Plus) via JS
        print("➕ Mencoba klik tombol 'Chat Baru'...")
        new_chat_script = """
        const btn = document.querySelector('button[aria-label="Chat baru"]') || document.querySelector('span[data-testid="newsletter-plus"]') || document.querySelector('div[title="Chat baru"]');
        if (btn) {
            btn.click();
            return true;
        }
        return false;
        """
        if not driver.execute_script(new_chat_script):
            print("❌ Gagal menemukan tombol 'Chat Baru'. Mencoba shortcut...")
            # Shortcut untuk chat baru biasanya Ctrl + Alt + N
            # Tapi kita pakai metode klik area pencarian saja sebagai fallback
            driver.execute_script("document.querySelector('div[contenteditable=\"true\"]').focus();")

        time.sleep(3)
        
        # 2. Ketik nama grup di kotak pencarian yang aktif
        print(f"⌨️ Mengetik nama grup: {TARGET_GROUP}")
        active_el = driver.switch_to.active_element
        active_el.send_keys(TARGET_GROUP)
        time.sleep(3)
        active_el.send_keys(Keys.ENTER)
        time.sleep(5)
        
        # 3. Kirim Pesan via JS Paste
        print("📤 Mengirim pesan konfirmasi...")
        paste_script = """
        async function sendFinal(text) {
            const selectors = ['div[contenteditable="true"]', 'footer div[role="textbox"]', 'div[data-testid="conversation-compose-box-input"]'];
            let chatBox = null;
            for (let i=0; i<20; i++) {
                for (let sel of selectors) {
                    let els = document.querySelectorAll(sel);
                    // Ambil yang di area chat (biasanya yang terakhir atau di dalam footer)
                    if (els.length > 0) chatBox = els[els.length - 1];
                    if (chatBox && chatBox.innerText.length < 500) break; 
                }
                if (chatBox) break;
                await new Promise(r => setTimeout(r, 500));
            }
            if (chatBox) {
                const dt = new DataTransfer();
                dt.setData('text/plain', text);
                chatBox.focus();
                chatBox.dispatchEvent(new ClipboardEvent('paste', {clipboardData: dt, bubbles: true}));
                return true;
            }
            return false;
        }
        return sendFinal(arguments[0]);
        """
        if driver.execute_script(paste_script, "🚀 *V19 VICTORY:* Solusi Grup Terpecahkan! Misi Selesai. 🥇"):
            time.sleep(1)
            driver.switch_to.active_element.send_keys(Keys.ENTER)
            print("✅ BERHASIL: PESAN TERKIRIM KE GRUP! 🏆🥇")
        else:
            print("❌ Gagal mengirim pesan di langkah terakhir.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    victory_v19()
