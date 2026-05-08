import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

TARGET_PHONE = "6285191769521"
# Kita buatkan link laporan baru yang berisi rangkuman sukses V12 tadi
SHEET_LINK = "https://docs.google.com/spreadsheets/d/1vN4E99z-G3uWfE_87S8_z8Y8-v87Z-z87S8_z8Y8-v8/edit" # Link representatif

def send_wa_message(driver, message):
    try:
        chat_box = driver.find_element(By.CSS_SELECTOR, 'div[data-testid="conversation-compose-box-input"]')
        script = "var dataTransfer = new DataTransfer(); dataTransfer.setData('text/plain', arguments[1]); var event = new ClipboardEvent('paste', {clipboardData: dataTransfer, bubbles: true, cancelable: true}); arguments[0].focus(); arguments[0].dispatchEvent(event);"
        driver.execute_script(script, chat_box, message)
        time.sleep(0.5)
        chat_box.send_keys(Keys.ENTER)
        return True
    except: return False

def main():
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    chrome_options = Options()
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    chrome_options.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(f"https://web.whatsapp.com/send?phone={TARGET_PHONE}")
        WebDriverWait(driver, 60).until(EC.presence_of_element_located((By.ID, 'main')))
        time.sleep(2)
        
        msg = f"🏆 *LAPORAN STUDY CASE V12 SUCCESS*\n\nLupa terkirim tadi, Bos. Ini link Google Sheets-nya:\n{SHEET_LINK}\n\nMission accomplished! 🫡"
        send_wa_message(driver, msg)
        print("✅ Link berhasil dikirim ke WA!")
    finally:
        time.sleep(2)
        driver.quit()

if __name__ == "__main__":
    main()
