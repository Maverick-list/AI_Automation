import subprocess
import time
import sys
import datetime

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

# Path ke Python Laragon Anda
PYTHON_PATH = r"E:\laragon\bin\python\python-3.13\python.exe"
# Script yang akan dijaga
BOT_SCRIPT = "assistant_bot.py"

def run_bot():
    restart_count = 0
    print(f"🚀 [SUPERVISOR] Memulai sistem OpenClaw Abadi...")
    
    while True:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n🔄 [{now}] Menjalankan bot (Percobaan ke-{restart_count + 1})...")
        
        try:
            # Menjalankan bot dan menunggu sampai selesai/error
            process = subprocess.Popen([PYTHON_PATH, "-u", BOT_SCRIPT], shell=False)
            process.wait()
            
            # Jika sampai di sini, artinya bot berhenti (crash atau di-stop)
            if process.returncode != 0:
                print(f"⚠️ [{now}] Bot berhenti dengan error (Code: {process.returncode}).")
            else:
                print(f"ℹ️ [{now}] Bot berhenti secara normal.")
                
        except Exception as e:
            print(f"❌ [{now}] Terjadi kesalahan pada Supervisor: {e}")
        
        restart_count += 1
        print(f"⏳ Menunggu 10 detik sebelum me-restart otomatis...")
        time.sleep(10) # Jeda sebelum restart agar tidak spamming

if __name__ == "__main__":
    try:
        run_bot()
    except KeyboardInterrupt:
        print("\n🛑 Supervisor dihentikan secara manual oleh user.")
        sys.exit(0)
