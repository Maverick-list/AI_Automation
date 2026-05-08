import os
import sys
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

TARGET_GROUP = "Business project"

def spy_on_group():
    print(f"--- SPY MISSION: {TARGET_GROUP} ---")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)
    
    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web...")
        time.sleep(30)
        
        # Cari dan Klik via JS
        script = """
        function findAndOpen(name) {
            const spans = document.querySelectorAll('span[title]');
            for (let span of spans) {
                if (span.title === name) {
                    const row = span.closest('div[role="row"]') || span.closest('div[data-testid="cell-frame-container"]');
                    if (row) {
                        const mousedown = new MouseEvent('mousedown', {bubbles: true});
                        const mouseup = new MouseEvent('mouseup', {bubbles: true});
                        row.dispatchEvent(mousedown);
                        row.dispatchEvent(mouseup);
                        row.click();
                        return true;
                    }
                }
            }
            const pane = document.querySelector('#pane-side');
            if (pane) pane.scrollTop += 800;
            return false;
        }
        return findAndOpen(arguments[0]);
        """
        
        for _ in range(10):
            if driver.execute_script(script, TARGET_GROUP):
                print("🎯 Klik dilakukan. Menunggu transisi...")
                break
            time.sleep(2)

        time.sleep(10)
        path = os.path.join(os.getcwd(), "spy_result.png")
        driver.save_screenshot(path)
        print(f"✅ Foto bukti disimpan: {path}")
        driver.quit()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    spy_on_group()
