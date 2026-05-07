
import datetime
from openclaw import calendar_module

def find_juara_vibe_event():
    service = calendar_module.get_calendar_service()
    if not service:
        print("Gagal mendapatkan service calendar.")
        return None

    # Cari event dengan query #juaravibecoding
    print("Mencari event #juaravibecoding...")
    now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
    events_result = service.events().list(
        calendarId='primary',
        q='#juaravibecoding',
        timeMin=now,
        maxResults=10,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    
    if not events:
        print("Event #juaravibecoding tidak ditemukan.")
        return None
    
    return events[0]

if __name__ == "__main__":
    event = find_juara_vibe_event()
    if event:
        print(f"Ditemukan: {event['summary']}")
        print(f"Mulai: {event['start'].get('dateTime', event['start'].get('date'))}")
        print(f"Deskripsi: {event.get('description', 'Tidak ada deskripsi')}")
    else:
        print("Event tidak ditemukan.")
