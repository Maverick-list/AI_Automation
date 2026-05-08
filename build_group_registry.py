"""
OpenClaw - WhatsApp Group Registry Builder
Mengambil SEMUA ID grup dari IndexedDB WhatsApp Web.
Hasilnya disimpan dalam file JSON sebagai "Buku Telepon Grup".
"""
import os
import sys
import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass


def build_group_registry():
    print("=== OpenClaw Group Registry Builder ===")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)

    try:
        driver.get("https://web.whatsapp.com")
        print("⏳ Menunggu WA Web memuat (35 detik)...")
        time.sleep(35)

        # --- Metode 1: IndexedDB (paling akurat) ---
        print("🔍 Membaca IndexedDB 'model-storage' -> 'chat'...")
        indexeddb_script = """
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('model-storage');
            request.onerror = () => reject('DB error');
            request.onsuccess = (event) => {
                const db = event.target.result;
                // Cek apakah object store 'chat' ada
                if (!db.objectStoreNames.contains('chat')) {
                    resolve([]);
                    return;
                }
                const tx = db.transaction(['chat'], 'readonly');
                const store = tx.objectStore('chat');
                const getAll = store.getAll();
                getAll.onsuccess = () => {
                    const groups = [];
                    for (const chat of getAll.result) {
                        // ID grup selalu berakhiran @g.us
                        const chatId = chat.id || chat.__x_id || '';
                        if (typeof chatId === 'string' && chatId.endsWith('@g.us')) {
                            groups.push({
                                jid: chatId,
                                name: chat.name || chat.formattedTitle || chat.contact?.name || '(unknown)',
                                isGroup: true
                            });
                        } else if (typeof chatId === 'object' && chatId.server === 'g.us') {
                            groups.push({
                                jid: chatId.user + '@g.us',
                                name: chat.name || chat.formattedTitle || '(unknown)',
                                isGroup: true
                            });
                        }
                    }
                    resolve(groups);
                };
                getAll.onerror = () => resolve([]);
            };
        });
        """

        groups = driver.execute_script(indexeddb_script)

        if not groups or len(groups) == 0:
            print("ℹ️ IndexedDB kosong atau format berbeda. Mencoba metode DOM...")
            # --- Metode 2: DOM Scan (fallback) ---
            dom_script = """
            let results = [];
            // Scroll dan ambil semua title dari sidebar
            const pane = document.querySelector('#pane-side');
            if (pane) {
                // Reset scroll ke atas
                pane.scrollTop = 0;
                await new Promise(r => setTimeout(r, 500));
                
                for (let i = 0; i < 30; i++) {
                    const spans = document.querySelectorAll('span[title]');
                    for (const span of spans) {
                        const title = span.title;
                        if (title && title.length > 1) {
                            // Cek apakah ini grup (biasanya ada ikon grup atau lebih dari 1 participant)
                            const row = span.closest('div[role="row"]');
                            if (row) {
                                const existingIdx = results.findIndex(r => r.name === title);
                                if (existingIdx === -1) {
                                    results.push({name: title, jid: 'dom-scan-' + results.length, isGroup: null});
                                }
                            }
                        }
                    }
                    pane.scrollTop += 800;
                    await new Promise(r => setTimeout(r, 300));
                }
            }
            return results;
            """
            groups = driver.execute_script(dom_script) or []

        # Simpan hasil
        registry_path = os.path.join(os.getcwd(), "wa_groups_registry.json")
        with open(registry_path, "w", encoding="utf-8") as f:
            json.dump(groups, f, ensure_ascii=False, indent=2)

        print(f"\n{'='*50}")
        print(f"📋 DAFTAR GRUP TERDETEKSI: {len(groups)} grup")
        print(f"{'='*50}")
        for i, g in enumerate(groups, 1):
            print(f"  {i}. {g.get('name', '?')} | JID: {g.get('jid', '?')}")
        print(f"{'='*50}")
        print(f"✅ Registry disimpan di: {registry_path}")

        driver.quit()

    except Exception as e:
        print(f"❌ Error: {e}")
        try:
            driver.quit()
        except:
            pass


if __name__ == "__main__":
    build_group_registry()
