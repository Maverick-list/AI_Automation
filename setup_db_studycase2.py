"""
OpenClaw - Database Setup for Study Case 2
Membuat Spreadsheet Database Produk dan Keuangan.
"""
import os
import sys
from openclaw import sheets_module

try:
    sys.stdout.reconfigure(encoding='utf-8')
except:
    pass

def setup_fundraising_db():
    print("🚀 Menyiapkan Database Bisnis untuk Mave AI...")
    
    # 1. Buat Spreadsheet Baru
    spreadsheet_id = sheets_module.create_new_sheet("OpenClaw Fundraising DB")
    print(f"✅ Spreadsheet dibuat! ID: {spreadsheet_id}")
    
    # 2. Siapkan Header Halaman Produk (Sheet1 biasanya default)
    # Kita asumsikan Sheet1 adalah Produk
    product_header = [["Nama Produk", "Kategori", "Harga", "Stok", "Deskripsi"]]
    sheets_module.append_to_sheet(spreadsheet_id, "Sheet1!A1", product_header)
    
    # Tambahkan dummy data supaya Mave AI punya bahan awal
    dummy_products = [
        ["Nasi Ayam Geprek", "Makanan", "15000", "20", "Ayam goreng tepung dengan sambal korek pedas mantap"],
        ["Nasi Ayam Bakar", "Makanan", "18000", "15", "Ayam bakar bumbu kecap meresap sampai tulang"],
        ["Es Teh Manis", "Minuman", "5000", "50", "Es teh segar dengan gula asli"],
        ["Dimsum Mix", "Snack", "12000", "30", "Dimsum ayam dan udang isi 4 per porsi"]
    ]
    sheets_module.append_to_sheet(spreadsheet_id, "Sheet1!A2", dummy_products)
    print("✅ Database Produk diisi dummy data.")

    # 3. Buat Halaman Transaksi
    # Google Sheets API create_new_sheet hanya buat spreadsheet. 
    # Untuk buat sheet (tab) baru di dalam spreadsheet yang sama, kita perlu batchUpdate.
    # Namun untuk kemudahan awal, kita gunakan Spreadsheet ID yang sama dan asumsikan Bos akan buat tab 'Transaksi' manual 
    # atau kita pakai Sheet2 jika sudah ada.
    
    print(f"\n🔥 DATABASE SIAP, BOS!")
    print(f"Link Spreadsheet: https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit")
    print(f"SIMPAN ID INI: {spreadsheet_id}")
    
    # Simpan ID ke file lokal untuk dipakai Mave AI
    with open("fundraising_db_id.txt", "w") as f:
        f.write(spreadsheet_id)

if __name__ == "__main__":
    setup_fundraising_db()
