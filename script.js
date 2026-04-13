// ============================================================
// 1. LINK GOOGLE SCRIPT
// ============================================================
const URL_GAS = "https://script.google.com/macros/s/AKfycbyD-OI98MDS4Zw8sTlBAUTa-LuvHOEYDNmJmutFBoaJhEsH5QzKAy_r5cNZoPp6pOSz/exec"; 

let keranjang = [];
let ongkirSekarang = 0;

// ============================================================
// 2. FUNGSI CEK ONGKIR (ANTI-CORS & ANTI-CACHE)
// ============================================================
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    
    if (!idKota) return;
    
    textOngkir.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengecek...';
    
    // Kita tambahkan random number agar Google tidak mengirim hasil lama (cache)
    const urlAsli = `${URL_GAS}?dest=${idKota}&weight=1000&v=${Math.random()}`;
    const urlProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(urlAsli)}`;

    try {
        const response = await fetch(urlProxy);
        if (!response.ok) throw new Error('Proxy error');
        
        const proxyData = await response.json();
        // AllOrigins mengirim data dalam bentuk teks di properti 'contents'
        const data = JSON.parse(proxyData.contents); 
        
        if (data.rajaongkir && data.rajaongkir.results[0].costs.length > 0) {
            // Mengambil tarif JNE
            ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            
            let subtotal = 0;
            keranjang.forEach(item => subtotal += item.harga);
            textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
            
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Gagal memuat";
            console.log("Respon API:", data);
        }
    } catch (e) {
        console.error("Detail Error:", e);
        textOngkir.innerText = "Error koneksi";
    }
}

// ============================================================
// 3. FUNGSI LAINNYA
// ============================================================
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function tampilkanHalaman(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    
    // Halaman Promo/Utama
    if(id === 'promo' || id === 'home') {
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
    if(!nama || !alamat || !kotaElem.value) return alert("Lengkapi data!");
    
    let detail = "";
    let sub = 0;
    keranjang.forEach((item, index) => {
        detail += `${index+1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        sub += item.harga;
    });
    
    const pesan = `Halo Sehat Farma,%0ASaya ingin memesan:%0A%0A${detail}%0A*Total:* Rp ${(sub + ongkirSekarang).toLocaleString('id-ID')}%0A*Penerima:* ${nama}%0A*Alamat:* ${alamat} (${kota})`;
    window.open(`https://wa.me/6285731070315?text=${pesan}`);
}

function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Saya ingin pesan promo: ${nama}`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo admin, saya ingin konsultasi`);
}
