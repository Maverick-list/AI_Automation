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

def send_to_group_v2(group_name, message):
    print(f"🚀 [SILUMAN V2] Mengirim ke Grup: {group_name}")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (30 detik)...")
        time.sleep(30)
        
        found = False
        print(f"🕵️ Mencari '{group_name}' dengan Auto-Scroll JS...")
        
        for attempt in range(15):
            script = """
            function findAndOpen(name) {
                const spans = document.querySelectorAll('span[title]');
                for (let span of spans) {
                    if (span.title === name) {
                        const row = span.closest('div[role="row"]') || span.closest('div[data-testid="cell-frame-container"]');
                        if (row) {
                            const mousedown = new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window});
                            const mouseup = new MouseEvent('mouseup', {bubbles: true, cancelable: true, view: window});
                            row.dispatchEvent(mousedown);
                            row.dispatchEvent(mouseup);
                            row.click();
                            return true;
                        }
                    }
                }
                // Scroll panel jika tidak ketemu
                const pane = document.querySelector('#pane-side');
                if (pane) pane.scrollTop += 800;
                return false;
            }
            return findAndOpen(arguments[0]);
            """
            
            if driver.execute_script(script, group_name):
                print(f"✅ Grup '{group_name}' DITEMUKAN & TERBUKA!")
                found = True
                break
            
            print(f"Langkah {attempt+1}: Menelusuri lebih dalam...")
            time.sleep(2)
            
        if found:
            time.sleep(5)
            print("📤 Mengirim pesan via JS Paste...")
            # Kirim Pesan via JS Paste dengan Retry Loop
            print("📤 Mengirim pesan via JS Paste (dengan Retry)...")
            paste_script = """
            async function sendMessage(text) {
                const selectors = [
                    'div[data-testid="conversation-compose-box-input"]',
                    'div[contenteditable="true"]',
                    'footer div[role="textbox"]',
                    '#main footer div[contenteditable="true"]'
                ];
                
                for (let i = 0; i < 30; i++) { // Coba selama 15 detik (0.5s per loop)
                    let chatBox = null;
                    for (let sel of selectors) {
                        chatBox = document.querySelector(sel);
                        if (chatBox) break;
                    }
                    
                    if (chatBox) {
                        const dt = new DataTransfer();
                        dt.setData('text/plain', text);
                        const pasteEvent = new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true});
                        chatBox.focus();
                        chatBox.dispatchEvent(pasteEvent);
                        return true;
                    }
                    await new Promise(r => setTimeout(r, 500));
                }
                return false;
            }
            return sendMessage(arguments[0]);
            """
            if driver.execute_script(paste_script, message):
                time.sleep(1)
                driver.switch_to.active_element.send_keys(Keys.ENTER)
                print("✅ MISI SUKSES: PESAN TERKIRIM! 🏆🥇")
            else:
                print("❌ Gagal menemukan kotak input setelah menunggu 15 detik.")
        else:
            print(f"❌ Grup '{group_name}' benar-benar tidak ditemukan.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"🚨 Error: {e}")

if __name__ == "__main__":
    msg = "🚀 *OpenClaw Robust V2:* Solusi Kirim Grup (Auto-Scroll) Berhasil! 🦾🤖🥇"
    send_to_group_v2("Business project", msg)
