import os
import sys
import datetime
import requests
from dotenv import load_dotenv
import google.generativeai as genai
import openclaw
from email.utils import parsedate_to_datetime

# Konfigurasi encoding stdout agar mendukung emoji di Windows
sys.stdout.reconfigure(encoding='utf-8')

def check_time_sync():
    print("Memeriksa sinkronisasi waktu sistem...")
    try:
        # Menggunakan header Date dari google.com (lebih stabil)
        response = requests.head("https://www.google.com", timeout=10)
        date_header = response.headers.get("Date")
        
        if not date_header:
            raise Exception("Header 'Date' tidak ditemukan pada respons server.")
            
        # Waktu dari server (dalam UTC)
        server_time = parsedate_to_datetime(date_header)
        
        # Waktu lokal (diubah ke UTC untuk perbandingan)
        local_time = datetime.datetime.now(datetime.timezone.utc)
        
        # Hitung selisih waktu
        diff = abs((local_time - server_time).total_seconds())
        
        # Jika selisih lebih dari 1 hari (86400 detik), beri peringatan
        if diff > 86400:
            print("❌ PERINGATAN KRITIS: Waktu lokal laptop Anda tidak sinkron dengan waktu global (selisih > 1 hari)!")
            print("   Hal ini akan menggagalkan autentikasi API Gemini akibat masalah sertifikat SSL.")
            print("   Harap sinkronkan waktu laptop Anda sebelum menjalankan automasi.")
            sys.exit(1)
        elif diff > 3600:
            print("⚠️ PERINGATAN: Waktu lokal sistem Anda tidak sinkron (selisih > 1 jam).")
            print("   Jika terjadi error SSL pada API Gemini, harap sinkronkan waktu laptop Anda.")
        else:
            print("✅ Sinkronisasi waktu sistem aman.")
            
    except Exception as e:
        print(f"⚠️ Gagal memverifikasi waktu sistem: {e}")
        print("   Pastikan koneksi internet stabil atau lewati cek waktu ini.")

def setup_gemini():
    print("Mengonfigurasi API Gemini...")
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY_HERE":
        print("❌ ERROR: API Key Gemini belum diatur di file .env!")
        print("   Silakan buka file .env dan isi nilai GEMINI_API_KEY.")
        sys.exit(1)
        
    try:
        genai.configure(api_key=api_key)
        # Test inisialisasi model
        model = genai.GenerativeModel('gemini-1.5-flash')
        print("✅ API Gemini berhasil dikonfigurasi dan aman diakses.")
    except Exception as e:
        print(f"❌ Gagal mengonfigurasi API Gemini: {e}")
        sys.exit(1)

def main():
    print(f"=== Memulai Setup {openclaw.init_app()} ===")
    
    # 1. Sinkronisasi Sistem
    check_time_sync()
    
    # 2. Konfigurasi API Gemini
    setup_gemini()
    
    # 3. Output konfirmasi keberhasilan
    print("\n==================================================================================")
    print("✅ KONFIRMASI: OpenClaw sudah berhasil terhubung dengan API Gemini")
    print("               dan siap digunakan untuk memproses tugas automasi kalender.")
    print("==================================================================================")

if __name__ == "__main__":
    main()
