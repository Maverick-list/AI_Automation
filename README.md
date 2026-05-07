# OpenClaw 🤖🚀

OpenClaw adalah asisten pribadi berbasis AI yang mengintegrasikan Google Calendar, Gmail, dan WhatsApp untuk otomatisasi produktivitas harian. Proyek ini menggunakan **Gemini AI** untuk memproses bahasa alami dan **Selenium** untuk mengontrol WhatsApp Web secara otomatis.

## ✨ Fitur Utama

- **Otomatisasi Google Calendar**: Mencari, membaca, dan menambah jadwal secara otomatis melalui perintah teks WhatsApp.
- **Gmail Monitor**: Memantau email masuk dan mengirimkan ringkasannya langsung ke WhatsApp (mendukung filter khusus).
- **WhatsApp Bridge**: Mengirim pesan ke kontak individu maupun grup secara otomatis, lengkap dengan dukungan emoji melalui *JavaScript injection*.
- **AI-Powered**: Menggunakan model **Gemini 2.5 Flash** untuk merangkum jadwal, menganalisis email, dan menghasilkan draf pesan yang kreatif.

## 📂 Struktur Proyek

```text
OpenClaw/
├── openclaw/               # Modul Inti
│   ├── calendar_module.py  # Integrasi Google Calendar API
│   ├── gmail_module.py     # Integrasi Gmail API
│   └── whatsapp_module.py  # Setup awal WhatsApp Web
├── assistant_bot.py        # Script utama (Bot Monitoring Email & Chat)
├── send_juara_vibe_event.py # Script pengirim event kalender ke individu
├── send_juara_vibe_group.py # Script pengirim event kalender ke grup
├── requirements.txt        # Daftar dependensi Python
├── .env                    # Variabel lingkungan (API Keys) - [DIABAIKAN OLEH GIT]
└── .gitignore              # Daftar file yang diabaikan Git (Credentials & Sessions)
```

## 🚀 Cara Menjalankan

### 1. Prasyarat
- **Python 3.10+** (Direkomendasikan 3.13).
- **Google Cloud Console Project**: Aktifkan Google Calendar API & Gmail API.
- **Google Chrome**: Browser yang akan digunakan oleh Selenium.

### 2. Instalasi & Clone
Clone repository ini ke komputer Anda:
```bash
git clone https://github.com/YOUR_USERNAME/OpenClaw.git
cd OpenClaw
```

Instal semua dependensi yang diperlukan:
```bash
pip install -r requirements.txt
```

### 3. Konfigurasi Kredensial
1. Simpan file `credentials.json` Anda di direktori utama.
2. Buat file `.env` di direktori utama:
   ```env
   GEMINI_API_KEY=isi_dengan_api_key_gemini_anda
   ```

### 4. Setup WhatsApp
Jalankan modul ini satu kali untuk melakukan scan QR Code WhatsApp Web dan menyimpan sesi:
```bash
python -m openclaw.whatsapp_module
```
Sesi akan disimpan di folder `whatsapp_profile` sehingga Anda tidak perlu login ulang setiap kali menjalankan bot.

### 5. Menjalankan Bot Utama
Jalankan bot monitoring (Gmail + WhatsApp):
```bash
python assistant_bot.py
```

## 🛠️ Penggunaan Tambahan
- **Kirim Event #JuaraVibe**: Jalankan `python send_juara_vibe_event.py` untuk otomatisasi pengiriman jadwal spesifik ke nomor HP tertentu.

## 🛡️ Keamanan Data
File `credentials.json`, `token.json`, dan folder `whatsapp_profile` telah dimasukkan ke dalam `.gitignore` agar data pribadi dan sesi login Anda tidak terunggah ke publik.

---
*Dikembangkan dengan ❤️ untuk produktivitas yang lebih cerdas.*
