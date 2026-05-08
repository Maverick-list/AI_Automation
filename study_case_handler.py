"""
OpenClaw Study Case V18 - Group Edition (Business project)
Menggunakan JID langsung + document.execCommand untuk navigasi yang 100% stabil.
"""
import os
import sys
import time
import datetime
import threading
import random
from openclaw import calendar_module, gmail_module, tasks_module, sheets_module
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import winsound

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

# KONFIGURASI
TARGET_EMAIL = "maverickly07@gmail.com"
TARGET_GROUP = "Business project"
TARGET_JID = "120363420521187543@g.us"
SEND_TIME = "05:18"
CODE = str(random.randint(1000, 9999))
EVIDENCE_PATH = "project_evidence.png"

is_confirmed = False
alarm_active = False
email_notif_sent = False
baseline_count = 0


def alarm_worker():
    global is_confirmed, alarm_active
    while not is_confirmed:
        if alarm_active:
            winsound.Beep(2000, 400)
            time.sleep(2)
        else:
            time.sleep(1)


def open_group_by_jid(driver, jid, name):
    """Membuka grup menggunakan pemindaian JS agresif pada sidebar."""
    print(f"👻 Navigasi Siluman ke '{name}'...")
    
    # Hilangkan popup jika ada
    driver.execute_script("""
        const okBtn = Array.from(document.querySelectorAll('div[role="button"]')).find(b => b.innerText === 'OK');
        if (okBtn) okBtn.click();
    """)
    time.sleep(1)

    # Scroller & Finder Agresif
    found = driver.execute_script("""
        const targetName = arguments[0];
        const targetJid = arguments[1];
        
        async function scanAndClick() {
            const pane = document.querySelector('#pane-side');
            if (!pane) return false;
            
            for (let i = 0; i < 20; i++) {
                // 1. Cari berdasarkan Judul (paling umum)
                const spans = document.querySelectorAll('span[title]');
                for (let span of spans) {
                    if (span.title === targetName) {
                        const row = span.closest('div[role="row"]') || span.closest('div[data-testid="cell-frame-container"]');
                        if (row) {
                            row.click();
                            return true;
                        }
                    }
                }
                
                // 2. Scroll sedikit
                pane.scrollTop += 500;
                await new Promise(r => setTimeout(r, 500));
            }
            return false;
        }
        return scanAndClick();
    """, name, jid)
    
    if found:
        print("✅ Grup ditemukan dan diklik via Side-Scan!")
        return True
        
    # Last Resort: Paksa via URL (meski beresiko popup, siapa tahu kali ini tembus)
    print("⚠️ Side-Scan gagal, mencoba paksa via URL...")
    driver.get(f"https://web.whatsapp.com/send?phone={jid.split('@')[0]}")
    time.sleep(5)
    driver.execute_script("const b=Array.from(document.querySelectorAll('div[role=\"button\"]')).find(x=>x.innerText==='OK'); if(b)b.click();")
    return True


def send_wa_js(driver, message):
    """Kirim pesan via JS execCommand (React-safe)."""
    result = driver.execute_script("""
        // Cari chat input box
        const selectors = [
            'div[data-testid="conversation-compose-box-input"]',
            '#main footer div[contenteditable="true"]',
            'footer div[role="textbox"]'
        ];
        let chatBox = null;
        for (const sel of selectors) {
            chatBox = document.querySelector(sel);
            if (chatBox) break;
        }
        if (!chatBox) return false;

        chatBox.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        document.execCommand('insertText', false, arguments[0]);
        return true;
    """, message)

    if result:
        time.sleep(0.5)
        # Tekan Enter via Selenium (satu-satunya interaksi Selenium)
        driver.switch_to.active_element.send_keys(Keys.ENTER)
        return True
    return False


def count_code(driver, code):
    try:
        text = driver.execute_script("var p=document.querySelector('#main');return p?p.innerText:'';")
        return text.count(code)
    except:
        return 0


def log(sheet_id, step, detail, status):
    try:
        ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        sheets_module.append_to_sheet(sheet_id, 'Sheet1!A:D', [[ts, step, detail, status]])
    except:
        pass


def main():
    global is_confirmed, alarm_active, email_notif_sent, baseline_count
    print(f"=== OPENCLAW V18 GROUP EDITION (KODE {CODE}) ===")
    print(f"Target Grup: {TARGET_GROUP} ({TARGET_JID})")
    print(f"Target Email: {TARGET_EMAIL}")
    print(f"Waktu Kirim: {SEND_TIME}")

    cal_service = calendar_module.get_calendar_service()
    gmail_service = gmail_module.get_gmail_service()
    threading.Thread(target=alarm_worker, daemon=True).start()

    now = datetime.datetime.now()

    # Google Sheets
    sheet_id = sheets_module.create_new_sheet(f"GroupV18_{now.strftime('%H%M%S')}")
    sheet_link = f"https://docs.google.com/spreadsheets/d/{sheet_id}/edit"
    sheets_module.append_to_sheet(sheet_id, 'Sheet1!A:D', [['Timestamp', 'Langkah', 'Detail', 'Status']])
    log(sheet_id, 'Inisialisasi', f'Grup: {TARGET_GROUP}, Kode: {CODE}', 'OK')

    # Google Tasks
    due = now.replace(hour=int(SEND_TIME.split(':')[0]), minute=int(SEND_TIME.split(':')[1]), second=0)
    tasks_module.add_task(f"V18 Group: {TARGET_GROUP}", notes=f"Kode: {CODE}\nSheet: {sheet_link}", due=due.strftime('%Y-%m-%dT%H:%M:%SZ'))

    # Google Calendar
    cal_start = due.isoformat()
    cal_end = (due + datetime.timedelta(minutes=10)).isoformat()
    calendar_module.add_calendar_event(cal_service, f"[GROUP V18] {TARGET_GROUP}", f"Kode: {CODE}", cal_start, cal_end)

    log(sheet_id, 'Tasks + Calendar', 'Task & Event dibuat', 'OK')

    # WhatsApp
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)

    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (30 detik)...")
        time.sleep(30)

        # Navigasi ke grup
        result = open_group_by_jid(driver, TARGET_JID, TARGET_GROUP)
        if result:
            print(f"✅ Navigasi ke grup berhasil!")
            log(sheet_id, 'Navigasi Grup', f'{TARGET_GROUP} (JID)', 'OK')
        else:
            print("❌ Gagal navigasi ke grup.")
            log(sheet_id, 'Navigasi Grup', 'GAGAL', 'FAILED')

        time.sleep(3)
        driver.save_screenshot(EVIDENCE_PATH)

        # Tunggu waktu kirim
        print(f"⏳ Menunggu pukul {SEND_TIME}...")
        while datetime.datetime.now().strftime("%H:%M") < SEND_TIME:
            time.sleep(0.5)

        # KIRIM EMAIL
        print(f"📧 Mengirim Email ke {TARGET_EMAIL}...")
        subject = f"V18 Group Report - {TARGET_GROUP} (Code {CODE})"
        body = f"Halo Bos,\n\nIni laporan V18 dari grup {TARGET_GROUP}.\nKode Konfirmasi: {CODE}\n\nBest,\nOpenClaw"
        sent = gmail_module.send_email_with_attachment(gmail_service, TARGET_EMAIL, subject, body, EVIDENCE_PATH)
        sent_thread_id = sent.get('threadId', '') if sent else ''
        sent_msg_id = sent.get('id', '') if sent else ''
        log(sheet_id, 'Email Terkirim', f'Ke: {TARGET_EMAIL}', 'OK')
        print("✅ Email terkirim!")

        # Kirim instruksi ke grup
        if send_wa_js(driver, f"🚀 [V18 GROUP] Email terkirim ke {TARGET_EMAIL}!\nKonfirmasi: ketik {CODE}"):
            print(f"✅ Notifikasi instruksi terkirim ke grup {TARGET_GROUP}!")
        else:
            print("❌ GAGAL mengirim notifikasi ke grup. Mencoba paksa...")
            driver.execute_script("document.querySelector('div[contenteditable=\"true\"]').focus();")
            send_wa_js(driver, f"🚀 [V18 GROUP RE-SEND] Konfirmasi: ketik {CODE}")

        time.sleep(2)
        log(sheet_id, 'Notifikasi Grup', f'Kode {CODE} dikirim ke {TARGET_GROUP}', 'OK')

        baseline_count = count_code(driver, CODE)
        start_time = time.time()
        last_spam = time.time()

        print(f"🔄 Menunggu konfirmasi kode {CODE} dari grup...")
        while not is_confirmed:
            # 1. CEK BALASAN EMAIL
            if sent_thread_id and not email_notif_sent:
                try:
                    reply = gmail_module.get_reply_to_thread(gmail_service, sent_thread_id, sent_msg_id)
                    if reply:
                        rb = reply.get('body', '(kosong)')[:300]
                        rs = reply.get('sender', '?')
                        send_wa_js(driver, f"📧 *NOTIF EMAIL:*\nDari: {rs}\nIsi: {rb}")
                        email_notif_sent = True
                        log(sheet_id, 'Balasan Email', f'Dari: {rs}', 'OK')
                        time.sleep(1)
                        baseline_count = count_code(driver, CODE)
                except:
                    pass

            # 2. CEK WHATSAPP (Di dalam grup)
            cc = count_code(driver, CODE)
            if cc > baseline_count:
                is_confirmed = True
                send_wa_js(driver, f"✅ Konfirmasi {CODE} diterima! Alarm mati. 🏆 Mission V18 Group Success!")
                log(sheet_id, 'Konfirmasi Grup', f'Kode {CODE} terdeteksi', 'OK')
                break

            # 3. ESKALASI (Lebih sering: tiap 30 detik)
            elapsed = time.time() - start_time
            if elapsed > 10 and not is_confirmed and time.time() - last_spam > 30:
                print(f"⚠️ Mengirim pengingat kode {CODE} ke grup...")
                send_wa_js(driver, f"⚠️ *PENGINGAT:* Mohon konfirmasi misi dengan mengetik: *{CODE}*")
                time.sleep(1)
                baseline_count = count_code(driver, CODE)
                last_spam = time.time()

            if elapsed > 30 and not alarm_active:
                alarm_active = True
                print("🚨 ALARM AKTIF! Menunggu konfirmasi...")
                log(sheet_id, 'Alarm', 'Alarm aktif', 'ESCALATED')

            time.sleep(0.5)

        # FINALISASI
        send_wa_js(driver, f"🏆 *V18 GROUP SUCCESS*\nLog: {sheet_link}")
        log(sheet_id, 'Selesai', 'Misi V18 Group Edition Sukses', 'COMPLETED')
        print("✨ V18 GROUP EDITION SELESAI!")
        while True:
            time.sleep(10)

    except Exception as e:
        log(sheet_id, 'ERROR', str(e), 'FAILED')
        print(f"❌ Error: {e}")


if __name__ == "__main__":
    main()
