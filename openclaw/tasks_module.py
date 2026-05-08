import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Scope untuk Google Tasks
SCOPES = ['https://www.googleapis.com/auth/tasks']

def get_tasks_service():
    creds = None
    # Token khusus untuk Tasks agar tidak bentrok
    if os.path.exists('token_tasks.json'):
        creds = Credentials.from_authorized_user_file('token_tasks.json', SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token_tasks.json', 'w') as token:
            token.write(creds.to_json())

    return build('tasks', 'v1', credentials=creds)

def add_task(title, notes=None, due=None):
    """
    Menambahkan tugas baru ke daftar 'My Tasks' utama.
    due format: '2026-05-07T12:00:00Z'
    """
    service = get_tasks_service()
    task = {
        'title': title,
        'notes': notes
    }
    if due:
        task['due'] = due

    result = service.tasks().insert(tasklist='@default', body=task).execute()
    return result

def list_tasks():
    service = get_tasks_service()
    results = service.tasks().list(tasklist='@default', maxResults=10).execute()
    return results.get('items', [])
