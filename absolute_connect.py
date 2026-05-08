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

def absolute_connection():
    print(f"--- ABSOLUTE CONNECTION: {TARGET_GROUP} ---")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (25 detik)...")
        time.sleep(25)
        
        found = False
        print(f"📜 Memindai daftar chat untuk '{TARGET_GROUP}'...")
        
        for i in range(20):
            try:
                # Cari span judul
                target_span = driver.find_element(By.XPATH, f"//span[@title='{TARGET_GROUP}']")
                # Cari baris induk (row)
                parent_row = target_span.find_element(By.XPATH, "./ancestor::div[@role='row' or @data-testid='cell-frame-container']")
                
                print(f"🎯 KETEMU! Mengirim sinyal KLIK AGRESIF...")
                # Gunakan MouseDown dan Click secara bersamaan
                driver.execute_script("""
                    var el = arguments[0];
                    var ev = new MouseEvent('mousedown', {bubbles: true, cancelable: true, view: window});
                    el.dispatchEvent(ev);
                    el.click();
                """, parent_row)
                
                time.sleep(5) # Beri waktu transisi
                
                # Cek keberhasilan via input box (lebih akurat daripada ID main)
                try:
                    chat_input = driver.find_element(By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]')
                    if chat_input:
                        print("✅ BERHASIL MASUK KE CHAT!")
                        msg = "🏆 *OpenClaw Connection Verified:* Grup Terhubung Sempurna! 🦾🤖🥇"
                        
                        script = "var dt=new DataTransfer();dt.setData('text/plain',arguments[1]);var e=new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true});arguments[0].focus();arguments[0].dispatchEvent(e);"
                        driver.execute_script(script, chat_input, msg)
                        time.sleep(1)
                        chat_input.send_keys(Keys.ENTER)
                        print("✅ Pesan konfirmasi terkirim!")
                        found = True
                        break
                except:
                    print("⌛ Menunggu panel chat terbuka...")
            except:
                pass
            
            # Scroll panel chat
            try:
                pane = driver.find_element(By.ID, "pane-side")
                driver.execute_script("arguments[0].scrollTop += 600;", pane)
            except: pass
            time.sleep(2)

        if not found:
            print(f"❌ Gagal menyambungkan ke '{TARGET_GROUP}'.")

        while True: time.sleep(10)

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    absolute_connection()
