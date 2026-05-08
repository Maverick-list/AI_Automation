import datetime
import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

from openclaw import calendar_module, tasks_module, sheets_module

def run_live_demo():
    print("🎬 === OPENCLAW LIVE DEMO START === 🎬")
    
    # 1. Demo Google Tasks
    print("\n[DEMO 1] Menambah Tugas ke Google Tasks...")
    task_title = f"Demo: Beli Kopi (Otomatis) - {datetime.datetime.now().strftime('%H:%M')}"
    tasks_module.add_task(task_title, notes="Dibuat otomatis oleh sistem demo OpenClaw.")
    print(f"✅ Tugas berhasil dibuat!")

    # 2. Demo Google Sheets (Logging)
    print("\n[DEMO 2] Mencatat Aktivitas ke Google Sheets...")
    # Gunakan ID sheet log yang baru dibuat bot tadi (dari log terminal user)
    # Jika tidak tahu, kita buat baru saja untuk demo ini
    sheet_id = sheets_module.create_new_sheet(f"Live Demo Log - {datetime.datetime.now().strftime('%Y%m%d_%H%M')}")
    sheets_module.append_to_sheet(sheet_id, "Sheet1!A1", [[datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "LIVE DEMO", "Semua sistem berjalan normal"]])
    print(f"✅ Aktivitas dicatat di Sheet ID: {sheet_id}")

    # 3. Demo Google Calendar
    print("\n[DEMO 3] Menjadwalkan Meeting di Google Calendar...")
    cal_service = calendar_module.get_calendar_service()
    start_time = (datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)).isoformat()
    end_time = (datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=2)).isoformat()
    calendar_module.add_calendar_event(cal_service, "Live Demo: Rapat Evaluasi OpenClaw", "Diskusi hasil integrasi API.", start_time, end_time)
    print(f"✅ Jadwal rapat berhasil ditambahkan!")

    print("\n✨ === LIVE DEMO SELESAI === ✨")
    print("Semua API (Tasks, Sheets, Calendar) terbukti sinkron!")

if __name__ == "__main__":
    run_live_demo()
