// VARIABEL GLOBAL
let keranjang = [];

// ============================================================
// 1. FUNGSI NAVIGASI
// ============================================================
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function tampilkanHalaman(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    
    // Logika Hero dan Seksi
    if(id === 'promo') {
        document.getElementById('hero').style.display = 'block';
        document.getElementById('promo').style.display = 'block';
    } else {
        document.getElementById('hero').style.display = 'none';
        const target = document.getElementById(id);
        if(target) target.style.display = 'block';
    }
    
    document.getElementById('navMenu').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cariProduk() {
    let input = document.getElementById('navSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        let title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(input) ? "" : "none";
    });
}

// ============================================================
// 2. LOGIKA KERANJANG
// ============================================================
function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    document.getElementById('cart-count').innerText = keranjang.length;
    alert("✅ Berhasil: " + nama + " masuk ke keranjang.");
}

function hapusItem(index) {
    keranjang.splice(index, 1);
    document.getElementById('cart-count').innerText = keranjang.length;
    bukaModalKeranjang();
}

function bukaModalKeranjang() {
    const container = document.getElementById('daftar-item-keranjang');
    const textTotal = document.getElementById('text-total');
    
    container.innerHTML = "";
    let total = 0;

    if (keranjang.length === 0) {
        container.innerHTML = "<p style='text-align:center;padding:20px;'>Keranjang belanja masih kosong.</p>";
        textTotal.innerText = "Rp 0";
    } else {
        keranjang.forEach((item, i) => {
            total += item.harga;
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                    <div>
                        <div style="font-size:0.9rem; font-weight:600;">${item.nama}</div>
                        <div style="font-size:0.85rem; color:var(--primary);">Rp ${item.harga.toLocaleString('id-ID')}</div>
                    </div>
                    <i class="fas fa-trash" onclick="hapusItem(${i})" style="color:red; cursor:pointer; padding:5px;"></i>
                </div>`;
        });
        textTotal.innerText = "Rp " + total.toLocaleString('id-ID');
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

function tutupModal(id) {
    document.getElementById(id).style.display = 'none';
}

// ============================================================
// 3. PEMBAYARAN & WHATSAPP
// ============================================================
function cekMetode() {
    const m = document.getElementById('metode-bayar').value;
    document.getElementById('info-rek').style.display = (m === 'Transfer') ? 'block' : 'none';
    document.getElementById('info-qris').style.display = (m === 'QRIS') ? 'block' : 'none';
}

function konfirmasiPesanan() {
    const nama = document.getElementById('nama-pembeli').value;
    const noWA = document.getElementById('wa-pembeli').value;
    const kecamatan = document.getElementById('kecamatan-pembeli').value;
    const kabupaten = document.getElementById('kabupaten-pembeli').value;
    const alamat = document.getElementById('alamat-pembeli').value;
    const metode = document.getElementById('metode-bayar').value;
    
    if (keranjang.length === 0) return alert("Keranjang belanja masih kosong!");
    if (!nama || !noWA || !kecamatan || !kabupaten || !alamat) {
        return alert("Mohon lengkapi semua data untuk perhitungan ongkir oleh admin!");
    }
    
    let daftarPesanan = "";
    let totalHarga = 0;
    
    keranjang.forEach((item, index) => {
        daftarPesanan += `${index + 1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        totalHarga += item.harga;
    });
    
    // Teks Pesanan untuk Admin
    const teksWhatsApp = `Halo Admin Sehat Farma,%0ASaya mau pesan produk ini dan minta bantu *HITUNG ONGKIR*:%0A%0A${daftarPesanan}%0A*Total Produk: Rp ${totalHarga.toLocaleString('id-ID')}*%0A_(Belum Termasuk Ongkir)_%0A%0A*Data Pengiriman:*%0A- Nama: ${nama}%0A- No. WA: ${noWA}%0A- Kec/Kab: ${kecamatan}, ${kabupaten}%0A- Alamat: ${alamat}%0A- Metode Bayar: ${metode}%0A%0A*Note:* Saya tunggu konfirmasi total biaya + ongkos kirim serta info pembayaran/rekening dari Admin.`;
    
    // Link ke nomor WhatsApp Admin
    window.open(`https://wa.me/6285731070315?text=${teksWhatsApp}`);
}

// Anda bisa menghapus fungsi cekMetode() dari script.js karena sudah tidak dipakai.
function waPesan(namaProduk) {
    window.open(`https://wa.me/6285731070315?text=Halo admin Sehat Farma, saya mau pesan produk promo: *${namaProduk}*`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo Apoteker Sehat Farma, saya ingin konsultasi mengenai kesehatan/obat...`);
}
