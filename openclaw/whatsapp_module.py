import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def connect_whatsapp():
    """
    Membuka WhatsApp Web dan menyiapkan sesi agar tetap login (Tautkan Perangkat).
    Hanya perlu scan QR Code 1 kali.
    """
    print("⏳ Menyiapkan koneksi ke WhatsApp Web (Tautkan Perangkat)...")
    
    # Folder untuk menyimpan sesi agar tidak perlu scan QR berkali-kali
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    if not os.path.exists(profile_dir):
        os.makedirs(profile_dir)

    chrome_options = Options()
    # Menyimpan sesi (cookies/local storage) di folder khusus
    chrome_options.add_argument(f"user-data-dir={profile_dir}")
    
    # Nonaktifkan beberapa log yang mengganggu
    chrome_options.add_argument("--log-level=3") 
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    try:
        # Menggunakan built-in Selenium Manager untuk menjalankan Chrome
        driver = webdriver.Chrome(options=chrome_options)
        
        print("🌍 Membuka web.whatsapp.com...")
        driver.get("https://web.whatsapp.com")
        
        print("==================================================================")
        print("📲 INSTRUKSI 'TAUTKAN PERANGKAT':")
        print("1. Buka aplikasi WhatsApp di HP Anda.")
        print("2. Ketuk ikon titik tiga (Android) atau Pengaturan (iPhone).")
        print("3. Pilih 'Perangkat Tertaut' (Linked Devices).")
        print("4. Ketuk 'Tautkan Perangkat' dan scan QR Code di layar browser.")
        print("==================================================================")
        print("Menunggu Anda memindai QR Code... (Tekan Ctrl+C di terminal ini jika ingin keluar)")
        
        # Tahan browser agar tetap terbuka.
        while True:
            time.sleep(1)
            
    except Exception as e:
        print(f"❌ Gagal membuka WhatsApp Web: {e}")

if __name__ == "__main__":
    connect_whatsapp()
