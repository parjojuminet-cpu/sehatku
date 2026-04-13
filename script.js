// ============================================================
// 1. PASTE URL BARU HASIL DEPLOY TADI DI SINI
// ============================================================
const URL_GAS = "https://script.google.com/macros/s/AKfycbw4wG9QsY1bA8LCc8NacQvCqRehkWiaPfkqaKvATXXF95cKqzVBQC7cZxRIKB4IsWyy/exec"; 

let keranjang = [];
let ongkirSekarang = 0;

// ============================================================
// 2. FUNGSI CEK ONGKIR (DIRECT FETCH)
// ============================================================
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    
    if (!idKota) return;
    
    textOngkir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghubungkan...';
    
    // Panggil langsung ke Google Script
    const finalUrl = `${URL_GAS}?dest=${idKota}&weight=1000`;

    try {
        // Tanpa proxy, langsung fetch. Browser akan handle redirect Google.
        const response = await fetch(finalUrl);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json(); 
        
        if (data.rajaongkir && data.rajaongkir.results[0].costs.length > 0) {
            ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            
            let subtotal = 0;
            keranjang.forEach(item => subtotal += item.harga);
            textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
            
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Gagal memuat tarif";
        }
    } catch (e) {
        console.error("Error:", e);
        textOngkir.innerText = "Error koneksi";
        // Jika masih error CORS, ini pesan bantuannya:
        alert("Koneksi gagal. Pastikan saat Deploy di Google Script, 'Who has access' dipilih 'Anyone'.");
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
    if(id === 'promo') document.getElementById('hero').style.display = 'block';
    else document.getElementById('hero').style.display = 'none';
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    document.getElementById('navMenu').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    document.getElementById('cart-count').innerText = keranjang.length;
    alert("✅ " + nama + " masuk keranjang!");
}

function hapusItem(index) {
    keranjang.splice(index, 1);
    document.getElementById('cart-count').innerText = keranjang.length;
    bukaModalKeranjang();
}

function bukaModalKeranjang() {
    const container = document.getElementById('daftar-item-keranjang');
    const textSubtotal = document.getElementById('text-subtotal');
    const textTotal = document.getElementById('text-total');
    container.innerHTML = "";
    let subtotal = 0;

    if (keranjang.length === 0) {
        container.innerHTML = "<p style='text-align:center;padding:20px;'>Keranjang kosong</p>";
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

function tutupModal(id) {
    document.getElementById(id).style.display = 'none';
}

function konfirmasiPesanan() {
    const nama = document.getElementById('nama-pembeli').value;
    const alamat = document.getElementById('alamat-pembeli').value;
    if(!nama || !alamat) return alert("Lengkapi Nama dan Alamat!");
    
    let sub = 0; keranjang.forEach(i => sub += i.harga);
    const pesan = `Halo Sehat Farma, saya pesan produk total Rp ${(sub + ongkirSekarang).toLocaleString('id-ID')}. Nama: ${nama}, Alamat: ${alamat}`;
    window.open(`https://wa.me/6285731070315?text=${encodeURIComponent(pesan)}`);
}

function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Saya ingin pesan: ${nama}`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo admin, saya ingin konsultasi`);
}
