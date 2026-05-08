import base64
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Menambah scope untuk pengiriman email
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send'
]

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

def get_reply_to_thread(service, thread_id, sent_msg_id):
    """Mencari balasan di thread yang sama dengan email yang kita kirim.
    
    Args:
        service: Gmail API service
        thread_id: Thread ID dari email yang kita kirim
        sent_msg_id: Message ID dari email yang kita kirim (untuk diabaikan)
    
    Returns:
        dict dengan sender, subject, body jika ada balasan baru, None jika belum
    """
    if not service or not thread_id:
        return None
    try:
        thread = service.users().threads().get(userId='me', id=thread_id).execute()
        messages = thread.get('messages', [])
        
        # Cari pesan yang BUKAN dari kita (bukan sent_msg_id)
        for msg in messages:
            if msg['id'] == sent_msg_id:
                continue  # Skip email yang kita kirim sendiri
            
            payload = msg['payload']
            headers = payload['headers']
            
            sender = ""
            subject = ""
            for h in headers:
                if h['name'] == 'From':
                    sender = h['value']
                if h['name'] == 'Subject':
                    subject = h['value']
            
            # Ini adalah balasan dari orang lain
            full_body = get_email_body(payload)
            if not full_body:
                full_body = msg.get('snippet', '(Tidak ada isi teks)')
            
            return {
                "id": msg['id'],
                "sender": sender,
                "subject": subject,
                "body": full_body
            }
        
        return None  # Belum ada balasan
    except Exception as e:
        print(f"Gagal cek reply thread: {e}")
        return None

def send_email_with_attachment(service, to, subject, body, attachment_path=None):
    """Mengirim email dengan lampiran."""
    message = MIMEMultipart()
    message['to'] = to
    message['subject'] = subject
    message.attach(MIMEText(body))

    if attachment_path and os.path.exists(attachment_path):
        content_type = 'application/octet-stream'
        main_type, sub_type = content_type.split('/', 1)
        
        with open(attachment_path, 'rb') as f:
            part = MIMEBase(main_type, sub_type)
            part.set_payload(f.read())
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', 'attachment', filename=os.path.basename(attachment_path))
            message.attach(part)

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    try:
        sent_message = service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
        print(f"✅ Email berhasil dikirim ke {to}")
        return sent_message
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return None
