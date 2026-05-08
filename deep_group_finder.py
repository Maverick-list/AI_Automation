"""
OpenClaw - Deep Group Finder
Membaca SELURUH data dari IndexedDB dan mencari 'Business project'
dengan memeriksa SEMUA field yang mungkin menyimpan nama grup.
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

def deep_find():
    print("=== Deep Group Finder ===")
    profile_dir = os.path.join(os.getcwd(), "whatsapp_profile")
    opts = Options()
    opts.add_argument(f"user-data-dir={profile_dir}")
    opts.add_argument("--log-level=3")
    driver = webdriver.Chrome(options=opts)

    try:
        driver.get("https://web.whatsapp.com")
        print("Menunggu WA Web (35 detik)...")
        time.sleep(35)

        # Ambil SEMUA data mentah dari semua group chats
        script = """
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('model-storage');
            request.onerror = () => resolve({error: 'DB gagal dibuka'});
            request.onsuccess = (event) => {
                const db = event.target.result;
                const storeNames = Array.from(db.objectStoreNames);
                
                let allData = {storeNames: storeNames, groups: [], allChats: []};
                
                if (!storeNames.includes('chat')) {
                    resolve(allData);
                    return;
                }
                
                const tx = db.transaction(['chat'], 'readonly');
                const store = tx.objectStore('chat');
                const getAll = store.getAll();
                
                getAll.onsuccess = () => {
                    for (const chat of getAll.result) {
                        // Ambil ID
                        let chatId = '';
                        if (typeof chat.id === 'string') chatId = chat.id;
                        else if (chat.id && chat.id.user) chatId = chat.id.user + '@' + (chat.id.server || '');
                        else if (chat.id && chat.id._serialized) chatId = chat.id._serialized;
                        
                        // Hanya yang @g.us (grup)
                        if (chatId.includes('@g.us')) {
                            // Kumpulkan SEMUA kemungkinan field nama
                            let possibleNames = [];
                            const nameFields = ['name', 'formattedTitle', 'displayName', 'subject', 
                                               'title', 'pushname', 'verifiedName', 'shortName',
                                               'contact', 'groupMetadata'];
                            
                            for (const field of nameFields) {
                                if (chat[field]) {
                                    if (typeof chat[field] === 'string') {
                                        possibleNames.push(field + ': ' + chat[field]);
                                    } else if (typeof chat[field] === 'object') {
                                        // Coba ambil sub-field
                                        for (const sub of ['name', 'pushname', 'subject', 'displayName']) {
                                            if (chat[field][sub]) {
                                                possibleNames.push(field + '.' + sub + ': ' + chat[field][sub]);
                                            }
                                        }
                                    }
                                }
                            }
                            
                            allData.groups.push({
                                jid: chatId,
                                possibleNames: possibleNames,
                                rawKeys: Object.keys(chat).join(', ')
                            });
                        }
                        
                        // Untuk SEMUA chat, simpan ringkasan
                        allData.allChats.push({
                            id: chatId,
                            type: chatId.includes('@g.us') ? 'group' : 'personal'
                        });
                    }
                    resolve(allData);
                };
            };
        });
        """

        data = driver.execute_script(script)
        
        print(f"\nObject stores dalam DB: {data.get('storeNames', [])}")
        print(f"Total chat: {len(data.get('allChats', []))}")
        print(f"Total grup: {len(data.get('groups', []))}")
        
        # Simpan data mentah
        with open("deep_group_data.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Cari 'Business project'
        print("\n=== Mencari 'Business project' ===")
        found = False
        for g in data.get('groups', []):
            for name_entry in g.get('possibleNames', []):
                if 'business' in name_entry.lower() or 'project' in name_entry.lower():
                    print(f"  KETEMU! JID: {g['jid']}")
                    print(f"  Nama: {name_entry}")
                    print(f"  Keys: {g['rawKeys']}")
                    found = True
        
        if not found:
            print("  Tidak ditemukan di field nama standard.")
            print("  Mencoba dari group-metadata store...")
            
            # Coba baca dari group-metadata store
            meta_script = """
            return new Promise((resolve) => {
                const request = indexedDB.open('model-storage');
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const storeNames = Array.from(db.objectStoreNames);
                    
                    // Cari store yang mengandung 'group' atau 'metadata'
                    const groupStores = storeNames.filter(s => 
                        s.includes('group') || s.includes('metadata') || s.includes('contact')
                    );
                    
                    if (groupStores.length === 0) {
                        resolve({stores: storeNames, data: []});
                        return;
                    }
                    
                    let results = [];
                    let completed = 0;
                    
                    for (const storeName of groupStores) {
                        try {
                            const tx = db.transaction([storeName], 'readonly');
                            const store = tx.objectStore(storeName);
                            const getAll = store.getAll();
                            getAll.onsuccess = () => {
                                for (const item of getAll.result) {
                                    const str = JSON.stringify(item).toLowerCase();
                                    if (str.includes('business') || str.includes('project')) {
                                        results.push({
                                            store: storeName,
                                            data: item
                                        });
                                    }
                                }
                                completed++;
                                if (completed >= groupStores.length) {
                                    resolve({stores: groupStores, data: results});
                                }
                            };
                        } catch(e) {
                            completed++;
                        }
                    }
                };
            });
            """
            meta_data = driver.execute_script(meta_script)
            print(f"  Group-related stores: {meta_data.get('stores', [])}")
            
            if meta_data.get('data'):
                for item in meta_data['data']:
                    print(f"\n  DITEMUKAN di store '{item['store']}':")
                    print(f"  Data: {json.dumps(item['data'], ensure_ascii=False, indent=4)[:500]}")
            else:
                print("  Juga tidak ditemukan di metadata stores.")

        driver.quit()

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    deep_find()
