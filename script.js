// ============================================================
// 1. LINK GOOGLE SCRIPT (SUDAH TERPASANG)
// ============================================================
const URL_GAS = "https://script.google.com/macros/s/AKfycbwq125jV2vnloAHfb9NZYKEW1-V6zWnEsoexKXsXPkfQttFOIBAxzMixlh_A1buSirC/exec"; 

let keranjang = [];
let ongkirSekarang = 0;

// ============================================================
// 2. FUNGSI CEK ONGKIR (DIRECT FETCH - ANTI ERROR)
// ============================================================
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    
    if (!idKota) return;
    
    // Tampilkan status loading
    textOngkir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengecek...';
    
    const finalUrl = `${URL_GAS}?dest=${idKota}&weight=1000`;

    try {
        // Pemanggilan langsung ke Google Script Anda
        const response = await fetch(finalUrl);
        
        if (!response.ok) throw new Error('Gagal terhubung ke script');
        
        const data = await response.json(); 
        
        if (data.rajaongkir && data.rajaongkir.results[0].costs.length > 0) {
            // Ambil biaya pengiriman JNE (pilihan pertama)
            ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
            
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            
            // Hitung Total Bayar
            let subtotal = 0;
            keranjang.forEach(item => subtotal += item.harga);
            textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
            
            // Munculkan bagian pembayaran
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Gagal memuat";
            alert("Layanan JNE tidak tersedia untuk lokasi ini.");
        }
    } catch (e) {
        console.error("Error Detail:", e);
        textOngkir.innerText = "Error koneksi";
        alert("Gagal mengambil data ongkir. Pastikan saat Deploy tadi Anda memilih 'Siapa saja' atau 'Anyone'.");
    }
}

// ============================================================
// 3. FUNGSI NAVIGASI & MENU
// ============================================================
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function tampilkanHalaman(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    
    // Tampilkan Hero hanya di halaman utama (promo)
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
// 4. LOGIKA KERANJANG
// ============================================================
function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    document.getElementById('cart-count').innerText = keranjang.length;
    alert("✅ " + nama + " berhasil ditambah ke keranjang!");
}

function hapusItem(index) {
    keranjang.splice(index, 1);
    document.getElementById('cart-count').innerText = keranjang.length;
    bukaModalKeranjang();
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
        container.innerHTML = "<p style='text-align:center;padding:20px;'>Keranjang masih kosong</p>";
        document.getElementById('area-pembayaran').style.display = 'none';
        textSubtotal.innerText = "Rp 0";
        textTotal.innerText = "Rp 0";
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                    <span style="font-size:0.85rem;">${item.nama}</span>
                    <span style="font-weight:bold;">Rp ${item.harga.toLocaleString('id-ID')} 
                        <i class="fas fa-trash" onclick="hapusItem(${i})" style="color:red; cursor:pointer; margin-left:10px;"></i>
                    </span>
                </div>`;
        });
        textSubtotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
        textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
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
    const kota = kotaElem.options[kotaElem.selectedIndex].text;
    const metode = document.getElementById('metode-bayar').value;
    
    if(!nama || !alamat || !kotaElem.value) return alert("Mohon lengkapi Nama, Alamat, dan Lokasi!");
    
    let detail = "";
    let sub = 0;
    keranjang.forEach((item, index) => {
        detail += `${index+1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        sub += item.harga;
    });
    
    const totalSemua = sub + ongkirSekarang;
    const pesan = `Halo Sehat Farma,%0ASaya ingin memesan:%0A%0A${detail}%0A*Rincian Biaya:*%0A- Subtotal: Rp ${sub.toLocaleString('id-ID')}%0A- Ongkir: Rp ${ongkirSekarang.toLocaleString('id-ID')}%0A- *Total Bayar: Rp ${totalSemua.toLocaleString('id-ID')}*%0A%0A*Data Pengiriman:*%0A- Penerima: ${nama}%0A- Alamat: ${alamat} (${kota})%0A- Metode Bayar: ${metode}`;
    
    window.open(`https://wa.me/6285731070315?text=${pesan}`);
}

function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Halo admin Sehat Farma, saya ingin memesan produk promo: *${nama}*`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo Apoteker Sehat Farma, saya ingin konsultasi kesehatan...`);
}
