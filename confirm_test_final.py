import os
import sys
import time
import threading
import random
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import winsound

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

TARGET_PHONE = "6285191769521"
CODE = str(random.randint(1000, 9999))  # 4 digit agar lebih unik

is_confirmed = False

def alarm_worker():
    global is_confirmed
    while not is_confirmed:
        winsound.Beep(2000, 400)
        time.sleep(2)

def send_wa_message_handler(driver, message):
    try:
        chat_box = driver.find_element(By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]')
        script = """
        var dt = new DataTransfer();
        dt.setData('text/plain', arguments[1]);
        var evt = new ClipboardEvent('paste', {clipboardData: dt, bubbles: true, cancelable: true});
        arguments[0].focus();
        arguments[0].dispatchEvent(evt);
        """
        driver.execute_script(script, chat_box, message)
        time.sleep(0.5)
        chat_box.send_keys(Keys.ENTER)
    except:
        pass

def count_code_on_page(driver, code):
    """Menghitung berapa kali kode muncul di seluruh teks halaman via JavaScript"""
    try:
        # Ambil innerText dari panel chat saja (bukan seluruh halaman)
        text = driver.execute_script("""
            var panel = document.querySelector('#main');
            return panel ? panel.innerText : '';
        """)
        return text.count(code)
    except:
        return 0

def main():
    global is_confirmed
    print(f"🧪 === CONFIRM TEST (KODE: {CODE}) ===")

    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)

    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        print("⏳ Menunggu WA Web...")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        time.sleep(3)  # Beri waktu chat history load

        # Kirim instruksi
        send_wa_message_handler(driver, f"Ketik kode berikut untuk mematikan alarm: {CODE}")
        time.sleep(2)

        # Hitung berapa kali kode sudah ada di halaman SETELAH instruksi terkirim
        baseline_count = count_code_on_page(driver, CODE)
        print(f"Baseline: kode '{CODE}' muncul {baseline_count}x di halaman.")
        print(f"Alarm menyala. Menunggu Anda mengetik '{CODE}'...")

        # Mulai alarm
        threading.Thread(target=alarm_worker, daemon=True).start()

        last_spam = time.time()

        while not is_confirmed:
            current_count = count_code_on_page(driver, CODE)

            if current_count > baseline_count:
                is_confirmed = True
                print(f"✅ KODE '{CODE}' terdeteksi! (muncul {current_count}x, baseline {baseline_count}x)")
                send_wa_message_handler(driver, "Konfirmasi anda kami terima. Alarm dimatikan.")
                break

            # Spam setiap 60 detik
            if time.time() - last_spam > 60:
                send_wa_message_handler(driver, f"Reminder: ketik {CODE}")
                time.sleep(2)
                # Update baseline setelah spam karena spam juga mengandung kode
                baseline_count = count_code_on_page(driver, CODE)
                last_spam = time.time()

            time.sleep(0.5)

        print("✨ BERHASIL! Alarm mati.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main()
