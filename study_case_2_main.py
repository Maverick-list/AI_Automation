"""
Study Case 2 - Main Runner
Menjalankan WhatsApp Monitoring, Mave AI Chatbot, dan Sounding Engine.
"""
import os
import sys
import time
import datetime
import threading
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from mave_ai_engine import ask_mave, trigger_escalation, IS_BOT_ACTIVE, MY_NUMBER, log_transaction

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

def get_last_messages(driver):
    """Membaca pesan terakhir di layar chat aktif (Masuk/Keluar)."""
    try:
        messages = driver.execute_script("""
            const msgs = document.querySelectorAll('.copyable-text[data-pre-plain-text]');
            if (msgs.length === 0) return [];
            const last = msgs[msgs.length - 1];
            const text = last.innerText || "";
            const senderInfo = last.getAttribute('data-pre-plain-text') || "";
            return [{text, sender: senderInfo}];
        """)
        return messages
    except:
        return []

def send_wa_js(driver, message):
    """Kirim pesan via JS dan paksa Klik tombol Kirim."""
    driver.execute_script("""
        const chatBox = document.querySelector('div[contenteditable="true"][data-tab="10"]') || document.querySelector('div[data-testid="conversation-compose-box-input"]');
        if (chatBox) {
            chatBox.focus();
            document.execCommand('insertText', false, arguments[0]);
            
            // Tunggu sebentar lalu cari tombol send
            setTimeout(() => {
                const sendBtn = document.querySelector('span[data-testid="send"]') || document.querySelector('button[aria-label="Kirim"]');
                if (sendBtn) sendBtn.click();
            }, 500);
        }
    """, message)
    # Fallback: Tetap tekan Enter via Selenium
    time.sleep(1)
    try:
        driver.switch_to.active_element.send_keys(Keys.ENTER)
    except:
        pass

def main():
    global IS_BOT_ACTIVE
    print("=== MAVE AI FUNDRAISING ASSISTANT (ANTI-CLOSE MODE) ===")
    
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    
    # AGAR CHROME TIDAK TERCLOSE SAAT PYTHON BERHENTI
    opts.add_experimental_option("detach", True)
    opts.add_argument("--log-level=3")
    
    try:
        driver = webdriver.Chrome(options=opts)
    except Exception as e:
        print(f"❌ Gagal buka Chrome. Pastikan tidak ada jendela Chrome lain yang pakai profile ini! Error: {e}")
        return

    driver.get("https://web.whatsapp.com")
    print("⏳ Menunggu WA Web memuat (30 detik)...")
    time.sleep(30)
    
    last_processed_text = ""
    
    while True:
        try:
            msgs = get_last_messages(driver)
            if msgs:
                msg = msgs[0]
                if msg['text'] != last_processed_text:
                    text = msg['text'].strip()
                    sender = msg['sender']
                    last_processed_text = text
                
                print(f"📩 Pesan masuk: '{text}' dari {sender}")
                
                # 1. CEK AKTIVASI (Omni-Hearing Mode)
                if "Halo Mave, Aktifkan Chatbot" in text:
                    IS_BOT_ACTIVE = True
                    send_wa_js(driver, "✅ Mave AI Aktif! Siap melayani pelanggan, Bos.")
                    print("🤖 Mave AI ACTIVATED!")
                    continue
                
                # 2. CEK DEAKTIVASI
                if "Mave, Istirahat dulu" in text:
                    IS_BOT_ACTIVE = False
                    send_wa_js(driver, "😴 Oke Bos, Mave istirahat dulu ya.")
                    print("🤖 Mave AI DEACTIVATED.")
                    continue

                # 3. LOGIKA CHATBOT PENJUALAN
                if IS_BOT_ACTIVE:
                    # Jika bukan dari nomor Bos (artinya dari pelanggan)
                    if MY_NUMBER not in sender:
                        print("🤔 Mave sedang berpikir...")
                        jawaban = ask_mave(text, sender)
                        
                        if "[NEED_HUMAN_ASSISTANCE]" in jawaban:
                            send_wa_js(driver, "Mohon maaf kak, sebentar ya Mave tanyakan ke owner dulu... 🙏")
                            threading.Thread(target=trigger_escalation, daemon=True).start()
                        
                        elif "[ORDER_CONFIRMED:" in jawaban:
                            prod_name = jawaban.split(":")[1].replace("]", "").strip()
                            log_transaction(prod_name, "Makanan", "Auto", sender)
                            clean_jawaban = jawaban.split("[")[0].strip()
                            send_wa_js(driver, f"{clean_jawaban}\n\n✅ Pesanan telah dicatat oleh Mave!")
                        
                        else:
                            send_wa_js(driver, jawaban)
                            print(f"🤖 Jawaban Mave dikirim: {jawaban}")
        except Exception as e:
            print(f"⚠️ Warning (Loop): {e}")
            time.sleep(5)

        time.sleep(2)

if __name__ == "__main__":
    main()
