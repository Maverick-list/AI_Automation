"""
Mave AI Engine - The Brain of OpenClaw Fundraising Assistant
Menangani Chatbot Penjualan, Sounding Promosi, dan Pencatatan Transaksi.
"""
import os
import sys
import time
import datetime
import threading
import random
import google.generativeai as genai
from dotenv import load_dotenv
from openclaw import sheets_module
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
import winsound

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-3.1-flash-lite')

# KONFIGURASI UTAMA
with open("fundraising_db_id.txt", "r") as f:
    DB_ID = f.read().strip()

MY_NUMBER = "6285191769521" # Nomor Bos untuk aktivasi
IS_BOT_ACTIVE = False
ALARM_CONFIRMED = False

# --- LOGIKA DATABASE ---

def get_product_info():
    """Membaca stok dan harga dari Google Sheets."""
    try:
        data = sheets_module.get_sheet_values(DB_ID, "Sheet1!A2:E20")
        products = []
        for row in data:
            if len(row) >= 4:
                products.append({
                    "nama": row[0],
                    "kategori": row[1],
                    "harga": row[2],
                    "stok": row[3],
                    "deskripsi": row[4] if len(row) > 4 else ""
                })
        return products
    except Exception as e:
        print(f"Error reading DB: {e}")
        return []

def log_transaction(nama_produk, kategori, harga, pembeli):
    """Mencatat transaksi ke sheet transaksi (misal di Sheet2)."""
    try:
        ts = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        values = [[ts, nama_produk, kategori, harga, pembeli]]
        # Kita pakai Sheet1 dulu untuk demo, idealnya Sheet2
        sheets_module.append_to_sheet(DB_ID, "Sheet1!A30", values)
        return True
    except:
        return False

# --- LOGIKA AI (MAVE AI) ---

def ask_mave(user_message, customer_info):
    """Mave AI berpikir menggunakan Gemini dengan data produk terbaru."""
    products = get_product_info()
    db_context = "DATABASE PRODUK KAMI:\n"
    for p in products:
        db_context += f"- {p['nama']} ({p['kategori']}): Harga {p['harga']}, Stok {p['stok']}. Detail: {p['deskripsi']}\n"
    
    prompt = f"""
    Kamu adalah Mave AI, asisten penjualan ramah untuk mahasiswa kampus. 
    Tugasmu adalah menjawab pertanyaan pelanggan mengenai stok, harga, dan detail produk berdasarkan database di bawah ini.
    
    ATURAN:
    1. Gunakan bahasa gaul mahasiswa yang sopan (pake 'kak', 'oke', 'ready').
    2. Jika stok habis, tawarkan produk lain.
    3. Jika kamu tidak tahu jawabannya atau ragu, katakan: "[NEED_HUMAN_ASSISTANCE]"
    4. Jika pelanggan fiks membeli (misal: "oke saya pesan satu"), katakan: "[ORDER_CONFIRMED: NamaProduk]"
    
    {db_context}
    
    Pesan Pelanggan ({customer_info}): {user_message}
    Jawaban Mave AI:
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "[NEED_HUMAN_ASSISTANCE]"

# --- LOGIKA NOTIFIKASI & ALARM ---

def trigger_escalation():
    """Memicu dering alarm di laptop sampai dikonfirmasi."""
    global ALARM_CONFIRMED
    ALARM_CONFIRMED = False
    print("🚨 ESKALASI AKTIF! Membunyikan alarm...")
    
    # 1. Bunyi dering satu kali awal
    winsound.Beep(1000, 500)
    
    # 2. Tunggu konfirmasi hingga 10 kali dering
    for i in range(10):
        if ALARM_CONFIRMED: return
        print(f"🔔 Dering {i+1}/10...")
        winsound.Beep(1000, 500)
        time.sleep(5)
    
    # 3. Alarm Keras jika masih belum dikonfirmasi
    while not ALARM_CONFIRMED:
        print("📢 ALARM KERAS! Bos, ada pelanggan butuh bantuan!")
        winsound.Beep(2500, 1000)
        time.sleep(1)

# --- LOGIKA WHATSAPP (SELENIUM) ---

def send_wa_js(driver, message):
    """Kirim pesan via JS execCommand (React-safe)."""
    driver.execute_script("""
        const chatBox = document.querySelector('div[contenteditable="true"][data-tab="10"]') || document.querySelector('div[data-testid="conversation-compose-box-input"]');
        if (chatBox) {
            chatBox.focus();
            document.execCommand('insertText', false, arguments[0]);
        }
    """, message)
    time.sleep(0.5)
    driver.switch_to.active_element.send_keys(Keys.ENTER)

def sounding_worker(driver, groups, message, interval_min, total_duration_min):
    """Menangani sounding promosi otomatis ke grup."""
    end_time = datetime.datetime.now() + datetime.timedelta(minutes=total_duration_min)
    print(f"📢 Sounding dimulai. Interval: {interval_min} menit.")
    
    while datetime.datetime.now() < end_time:
        for group in groups:
            # Cari dan buka grup (Gunakan metode search yang kita punya)
            # ... (Logika navigasi grup di sini)
            print(f"📤 Mengirim sounding ke {group}...")
            # send_wa_js(driver, message)
            time.sleep(2)
        
        print(f"⏳ Istirahat {interval_min} menit...")
        time.sleep(interval_min * 60)
