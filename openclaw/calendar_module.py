import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Hak akses ditingkatkan menjadi Full Calendar Access
SCOPES = ['https://www.googleapis.com/auth/calendar']

def get_calendar_service():
    """Menghubungkan ke Google Calendar API menggunakan OAuth2."""
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("❌ ERROR: File 'credentials.json' tidak ditemukan.")
                return None
                
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
            
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('calendar', 'v3', credentials=creds)
        print("✅ Berhasil terhubung ke Google Calendar API.")
        return service
    except Exception as e:
        print(f"❌ Gagal terhubung ke Google Calendar: {e}")
        return None

def fetch_events_by_date(service, target_date):
    """Mengambil jadwal acara untuk tanggal tertentu."""
    if not service:
        return []
    from datetime import datetime, time, timezone
    start_of_day = datetime.combine(target_date, time.min).astimezone(timezone.utc).isoformat()
    end_of_day = datetime.combine(target_date, time.max).astimezone(timezone.utc).isoformat()
    try:
        events_result = service.events().list(
            calendarId='primary', 
            timeMin=start_of_day,
            timeMax=end_of_day,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        return events_result.get('items', [])
    except Exception as e:
        print(f"Gagal mengambil event: {e}")
        return []

def add_calendar_event(service, summary, description, start_iso, end_iso):
    """Menambahkan event baru ke Google Calendar."""
    if not service:
        return None
    event = {
        'summary': summary,
        'description': description,
        'start': {'dateTime': start_iso, 'timeZone': 'Asia/Jakarta'},
        'end': {'dateTime': end_iso, 'timeZone': 'Asia/Jakarta'},
    }
    try:
        event = service.events().insert(calendarId='primary', body=event).execute()
        print(f"✅ Event berhasil dibuat: {event.get('htmlLink')}")
        return event
    except Exception as e:
        print(f"❌ Gagal membuat event: {e}")
        return None
