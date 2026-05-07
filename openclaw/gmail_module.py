import os.path
import base64
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

def get_gmail_service():
    """Menghubungkan ke Gmail API menggunakan OAuth2."""
    creds = None
    if os.path.exists('token_gmail.json'):
        creds = Credentials.from_authorized_user_file('token_gmail.json', SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists('credentials.json'):
                print("❌ ERROR: File 'credentials.json' tidak ditemukan.")
                return None
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token_gmail.json', 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('gmail', 'v1', credentials=creds)
        print("✅ Berhasil terhubung ke Gmail API.")
        return service
    except Exception as e:
        print(f"❌ Gagal terhubung ke Gmail: {e}")
        return None

def get_email_body(payload):
    """Fungsi pembantu untuk mengekstrak isi email dari payload Gmail yang kompleks."""
    if 'parts' in payload:
        for part in payload['parts']:
            if part['mimeType'] == 'text/plain':
                data = part['body'].get('data')
                if data:
                    return base64.urlsafe_b64decode(data).decode('utf-8')
            elif part['mimeType'] == 'text/html':
                # Jika tidak ada plain text, ambil HTML (opsional: bisa di-strip tag-nya)
                data = part['body'].get('data')
                if data:
                    return base64.urlsafe_b64decode(data).decode('utf-8')
            elif 'parts' in part:
                # Rekursif untuk nested parts
                body = get_email_body(part)
                if body:
                    return body
    else:
        data = payload.get('body', {}).get('data')
        if data:
            return base64.urlsafe_b64decode(data).decode('utf-8')
    return ""

def get_latest_unread_email(service, sender_filter=None):
    """Mengambil satu email terbaru, bisa difilter berdasarkan pengirim."""
    if not service:
        return None
    try:
        # Mencari kata 'goldnation'
        query = 'goldnation'
            
        results = service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])
        
        if not messages:
            return None
            
        msg_id = messages[0]['id']
        txt = service.users().messages().get(userId='me', id=msg_id).execute()
        
        payload = txt['payload']
        headers = payload['headers']
        
        # Ambil isi email lengkap
        full_body = get_email_body(payload)
        if not full_body:
            full_body = txt.get('snippet', '(Tidak ada isi teks)')
        
        subject = ""
        sender = ""
        for d in headers:
            if d['name'] == 'Subject':
                subject = d['value']
            if d['name'] == 'From':
                sender = d['value']
        
        return {
            "id": msg_id,
            "sender": sender, 
            "subject": subject, 
            "body": full_body
        }
    except Exception as e:
        print(f"Gagal mengambil email: {e}")
        return None
