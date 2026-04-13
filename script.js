let keranjang = [];
let ongkirSekarang = 0;

// ============================================================
// GANTI LINK DI BAWAH INI DENGAN LINK /EXEC KAMU SENDIRI
// ============================================================
const URL_GAS = "https://script.google.com/macros/s/AKfycbzPrndb7wzNOKPedWi8NWkC-5aX2HeMvpDK7WEciauJvlhQEW0GblZYwYJ4JiKV7I0-/exec"; 

function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

function tampilkanHalaman(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    document.getElementById('hero').style.display = 'block';
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    document.getElementById('cart-count').innerText = keranjang.length;
    alert(nama + " masuk keranjang!");
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
        container.innerHTML = "<p style='text-align:center;padding:20px;'>Keranjang kosong</p>";
        document.getElementById('area-pembayaran').style.display = 'none';
        textSubtotal.innerText = "Rp 0";
        textTotal.innerText = "Rp 0";
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `
                <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                    <span>${item.nama}</span>
                    <span>Rp ${item.harga.toLocaleString('id-ID')} <i class="fas fa-trash" onclick="hapusItem(${i})" style="color:red; cursor:pointer; margin-left:10px;"></i></span>
                </div>`;
        });
        textSubtotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
        textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    
    if (!idKota) return;
    
    textOngkir.innerText = "Mengecek tarif...";
    
    // Proxy AllOrigins untuk menghindari CORS
    const finalUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(URL_GAS + "?dest=" + idKota + "&weight=1000")}`;

    try {
        const response = await fetch(finalUrl);
        const proxyData = await response.json();
        const data = JSON.parse(proxyData.contents); 
        
        if (data.rajaongkir && data.rajaongkir.results[0].costs.length > 0) {
            ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            
            let subtotal = 0;
            keranjang.forEach(item => subtotal += item.harga);
            textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
            
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Gagal ambil data";
        }
    } catch (e) {
        console.error(e);
        textOngkir.innerText = "Error koneksi";
    }
}

function cekMetode() {
    const m = document.getElementById('metode-bayar').value;
    document.getElementById('info-rek').style.display = (m === 'Transfer') ? 'block' : 'none';
    document.getElementById('info-qris').style.display = (m === 'QRIS') ? 'block' : 'none';
}

function konfirmasiPesanan() {
    const nama = document.getElementById('nama-pembeli').value;
    const alamat = document.getElementById('alamat-pembeli').value;
    const kota = document.getElementById('kota-tujuan').options[document.getElementById('kota-tujuan').selectedIndex].text;
    
    if(!nama || !alamat) return alert("Lengkapi Nama dan Alamat!");
    
    let detail = "";
    let sub = 0;
    keranjang.forEach(item => {
        detail += "- " + item.nama + " (Rp " + item.harga.toLocaleString('id-ID') + ")%0A";
        sub += item.harga;
    });
    
    const pesan = `Halo Sehat Farma,%0ASaya ingin pesan:%0A${detail}%0A*Nama:* ${nama}%0A*Alamat:* ${alamat} (${kota})%0A*Subtotal:* Rp ${sub.toLocaleString('id-ID')}%0A*Ongkir:* Rp ${ongkirSekarang.toLocaleString('id-ID')}%0A*Total:* Rp ${(sub + ongkirSekarang).toLocaleString('id-ID')}`;
    window.open(`https://wa.me/6285731070315?text=${pesan}`);
}

function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Saya ingin pesan: ${nama}`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo admin, saya ingin konsultasi`);
}
