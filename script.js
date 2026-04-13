// ============================================================
// 1. KONFIGURASI - GANTI LINK DI BAWAH INI
// ============================================================
// Masukkan link "Aplikasi Web" dari Google Apps Script (yang berakhiran /exec)
const URL_GAS = "https://script.google.com/macros/s/AKfycbyD-OI98MDS4Zw8sTlBAUTa-LuvHOEYDNmJmutFBoaJhEsH5QzKAy_r5cNZoPp6pOSz/exec"; 

let keranjang = [];
let ongkirSekarang = 0;

// ============================================================
// 2. NAVIGASI & MENU
// ============================================================
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function tampilkanHalaman(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    
    // Selalu tampilkan hero di halaman utama (promo)
    if(id === 'promo') {
        document.getElementById('hero').style.display = 'block';
    } else {
        document.getElementById('hero').style.display = 'none';
    }
    
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    
    // Tutup menu mobile setelah klik
    document.getElementById('navMenu').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Fitur Cari Produk Sederhana
function cariProduk() {
    let input = document.getElementById('navSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        let h3 = card.querySelector('h3');
        if (h3) {
            let text = h3.innerText.toLowerCase();
            card.style.display = text.includes(input) ? "" : "none";
        }
    });
}

// ============================================================
// 3. LOGIKA KERANJANG
// ============================================================
function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    updateNotifKeranjang();
    alert("✅ " + nama + " berhasil ditambah ke keranjang!");
}

function updateNotifKeranjang() {
    document.getElementById('cart-count').innerText = keranjang.length;
}

function hapusItem(index) {
    keranjang.splice(index, 1);
    updateNotifKeranjang();
    bukaModalKeranjang(); // Refresh tampilan modal
}

function tutupModal(id) {
    document.getElementById(id).style.display = 'none';
}

function bukaModalKeranjang() {
    const container = document.getElementById('daftar-item-keranjang');
    const textSubtotal = document.getElementById('text-subtotal');
    const textTotal = document.getElementById('text-total');
    
    container.innerHTML = "";
    let subtotal = 0;

    if (keranjang.length === 0) {
        container.innerHTML = "<p style='text-align:center;padding:20px;'>Keranjang Anda masih kosong.</p>";
        document.getElementById('area-pembayaran').style.display = 'none';
        document.getElementById('notif-ongkir').style.display = 'block';
        textSubtotal.innerText = "Rp 0";
        textTotal.innerText = "Rp 0";
        ongkirSekarang = 0;
        document.getElementById('text-ongkir').innerText = "Rp 0";
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #eee;">
                    <div style="text-align:left">
                        <div style="font-weight:600; font-size:0.9rem;">${item.nama}</div>
                        <div style="color:var(--primary); font-size:0.8rem;">Rp ${item.harga.toLocaleString('id-ID')}</div>
                    </div>
                    <i class="fas fa-trash-alt" onclick="hapusItem(${i})" style="color:#e74c3c; cursor:pointer; padding:5px;"></i>
                </div>`;
        });
        
        textSubtotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
        // Update total dengan ongkir yang ada (jika sudah pilih kota)
        textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

// ============================================================
// 4. HITUNG ONGKIR (VIA GOOGLE APPS SCRIPT)
// ============================================================
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    
    if (!idKota) {
        ongkirSekarang = 0;
        textOngkir.innerText = "Rp 0";
        return;
    }
    
    textOngkir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    
    // Memanggil Google Apps Script secara langsung (Browser akan handle redirect otomatis)
    const urlFinal = `${URL_GAS}?dest=${idKota}&weight=1000`;

    try {
        const response = await fetch(urlFinal);
        if (!response.ok) throw new Error('Gagal terhubung ke server');
        
        const data = await response.json(); 
        
        if (data.rajaongkir && data.rajaongkir.results[0].costs.length > 0) {
            // Ambil biaya layanan pertama dari JNE (biasanya OKE atau REG)
            ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
            
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            
            let subtotal = 0;
            keranjang.forEach(item => subtotal += item.harga);
            textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
            
            // Tampilkan pilihan pembayaran
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Tak tersedia";
            alert("Layanan JNE tidak tersedia untuk lokasi ini.");
        }
    } catch (e) {
        console.error("Error Ongkir:", e);
        textOngkir.innerText = "Gagal memuat";
        alert("Gagal mengambil data ongkir. Pastikan Google Script sudah di-deploy dengan benar (Access: Anyone).");
    }
}

// ============================================================
// 5. PEMBAYARAN & WHATSAPP
// ============================================================
function cekMetode() {
    const m = document.getElementById('metode-bayar').value;
    document.getElementById('info-rek').style.display = (m === 'Transfer') ? 'block' : 'none';
    document.getElementById('info-qris').style.display = (m === 'QRIS') ? 'block' : 'none';
}

function konfirmasiPesanan() {
    const nama = document.getElementById('nama-pembeli').value;
    const alamat = document.getElementById('alamat-pembeli').value;
    const kotaElem = document.getElementById('kota-tujuan');
    const kotaText = kotaElem.options[kotaElem.selectedIndex].text;
    const metode = document.getElementById('metode-bayar').value;
    
    if(!nama || !alamat || !kotaElem.value) {
        return alert("Mohon lengkapi Nama, Alamat, dan Lokasi Pengiriman!");
    }
    
    if(keranjang.length === 0) return alert("Keranjang masih kosong!");
    
    let detailProduk = "";
    let subtotal = 0;
    keranjang.forEach((item, index) => {
        detailProduk += `${index + 1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        subtotal += item.harga;
    });
    
    const totalSemua = subtotal + ongkirSekarang;
    
    const pesan = `Halo Sehat Farma, saya ingin memesan:%0A%0A` +
        `*DAFTAR PESANAN:*%0A${detailProduk}%0A` +
        `*PENGIRIMAN:*%0A` +
        `- Nama: ${nama}%0A` +
        `- Alamat: ${alamat}%0A` +
        `- Kota: ${kotaText}%0A%0A` +
        `*RINCIAN BIAYA:*%0A` +
        `- Subtotal: Rp ${subtotal.toLocaleString('id-ID')}%0A` +
        `- Ongkir (JNE): Rp ${ongkirSekarang.toLocaleString('id-ID')}%0A` +
        `- *Total Bayar: Rp ${totalSemua.toLocaleString('id-ID')}*%0A%0A` +
        `*Metode Bayar:* ${metode}`;
    
    window.open(`https://wa.me/6285731070315?text=${pesan}`);
}

// Fungsi pesan cepat dari halaman promo
function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Halo admin, saya ingin pesan produk promo: *${nama}*`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo Apoteker Sehat Farma, saya ingin konsultasi kesehatan...`);
}
