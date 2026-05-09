"""
Mave AI Internal Test
Memastikan asisten bisa membaca database dan menjawab dengan benar.
"""
from mave_ai_engine import ask_mave, get_product_info

def test_mave():
    print("🧪 Menguji Koneksi Database Produk...")
    products = get_product_info()
    if products:
        print(f"✅ Berhasil membaca {len(products)} produk dari Sheets.")
        for p in products:
            print(f"   - {p['nama']}: Rp{p['harga']} (Stok: {p['stok']})")
    else:
        print("❌ Gagal membaca produk.")
        return

    print("\n🤖 Menguji Logika Mave AI...")
    pertanyaan = "kak ayam gepreknya masih ada? harganya berapa ya?"
    jawaban = ask_mave(pertanyaan, "Customer #1")
    print(f"💬 Tanya: {pertanyaan}")
    print(f"🤖 Mave: {jawaban}")

    pertanyaan_salah = "kak jual laptop ga?"
    jawaban_salah = ask_mave(pertanyaan_salah, "Customer #2")
    print(f"\n💬 Tanya: {pertanyaan_salah}")
    print(f"🤖 Mave: {jawaban_salah}")

if __name__ == "__main__":
    test_mave()
