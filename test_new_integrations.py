import sys
try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

from openclaw import tasks_module, sheets_module, drive_module
import datetime

def test_all():
    print("🧪 Mengetes integrasi baru...")
    
    # 1. Test Google Tasks
    print("\n--- Testing Google Tasks ---")
    try:
        task = tasks_module.add_task(
            title="Test Task dari OpenClaw",
            notes="Ini adalah tugas percobaan untuk memastikan integrasi berhasil.",
            due=datetime.datetime.now(datetime.UTC).isoformat()
        )
        print(f"✅ Berhasil menambah tugas! ID: {task['id']}")
    except Exception as e:
        print(f"❌ Gagal di Google Tasks: {e}")

    # 2. Test Google Sheets (Create & Append)
    print("\n--- Testing Google Sheets ---")
    try:
        # Buat sheet log baru
        sheet_id = sheets_module.create_new_sheet(f"OpenClaw Logs - {datetime.date.today()}")
        print(f"✅ Berhasil membuat sheet baru! ID: {sheet_id}")
        
        # Tambah baris log
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sheets_module.append_to_sheet(sheet_id, "Sheet1!A1", [[now, "Test Integration", "SUCCESS"]])
        print("✅ Berhasil menambah baris log ke Sheets!")
    except Exception as e:
        print(f"❌ Gagal di Google Sheets: {e}")

if __name__ == "__main__":
    test_all()
