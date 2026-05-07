import sys
# Konfigurasi encoding stdout agar mendukung emoji di Windows
sys.stdout.reconfigure(encoding='utf-8')

from openclaw import calendar_module, whatsapp_module

def main():
    print("=== Menjalankan Automasi OpenClaw ===")
    
    print("\n[1/2] Menghubungkan ke Google Calendar...")
    print("Catatan: Pastikan Anda sudah meletakkan 'credentials.json' di folder ini.")
    calendar_service = calendar_module.get_calendar_service()
    
    if calendar_service:
        events = calendar_module.fetch_today_events(calendar_service)
        if not events:
            print("ℹ️ Tidak ada jadwal hari ini.")
        else:
            print(f"📅 Ditemukan {len(events)} jadwal hari ini:")
            for event in events:
                start = event['start'].get('dateTime', event['start'].get('date'))
                print(f"  - {start}: {event['summary']}")
    else:
        print("⚠️ Melewati integrasi kalender (menunggu credentials.json).")

    print("\n[2/2] Menghubungkan ke WhatsApp...")
    whatsapp_module.connect_whatsapp()

if __name__ == "__main__":
    main()
