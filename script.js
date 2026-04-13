let keranjang = [];
let ongkirSekarang = 0;

// MASUKKAN URL GOOGLE SCRIPT KAMU DI SINI (Hanya link /exec nya saja)
const LINK_GAS = "https://script.google.com/macros/s/AKfycbyY6jnNsoK18rqllRVqw9QN8WtcYJ4XkkblG0Sly787CLMtOcXwVYrV7XBk6QpD_R2s/exec"; 

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

function bukaModalKeranjang() {
    const container = document.getElementById('daftar-item-keranjang');
    container.innerHTML = "";
    let subtotal = 0;

    if (keranjang.length === 0) {
        container.innerHTML = "<p style='text-align:center;padding:20px;'>Keranjang kosong</p>";
        document.getElementById('area-pembayaran').style.display = 'none';
        document.getElementById('text-subtotal').innerText = "Rp 0";
        document.getElementById('text-total').innerText = "Rp 0";
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <span>${item.nama}</span>
                <span>Rp ${item.harga.toLocaleString()}<i class="fas fa-trash" onclick="hapusItem(${i})" style="margin-left:10px; color:red; cursor:pointer;"></i></span>
            </div>`;
        });
        document.getElementById('text-subtotal').innerText = "Rp " + subtotal.toLocaleString('id-ID');
        hitungTotalAkhir(subtotal);
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

function hitungTotalAkhir(sub) {
    const total = sub + ongkirSekarang;
    document.getElementById('text-total').innerText = "Rp " + total.toLocaleString('id-ID');
}

async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    
    if (!idKota) return;
    
    textOngkir.innerText = "Mengecek...";
    
    try {
        // Menggunakan AllOrigins Proxy agar tidak kena CORS
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(LINK_GAS + "?dest=" + idKota + "&weight=1000")}`;
        const resp = await fetch(proxyUrl);
        const data = await resp.json();
        
        ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
        textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
        
        let subtotal = 0;
        keranjang.forEach(item => subtotal += item.harga);
        hitungTotalAkhir(subtotal);
        
        document.getElementById('area-pembayaran').style.display = 'block';
    } catch (e) {
        console.error(e);
        textOngkir.innerText = "Gagal cek ongkir";
    }
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
    const kota = document.getElementById('kota-tujuan').options[document.getElementById('kota-tujuan').selectedIndex].text;
    
    if(!nama || !alamat) return alert("Isi data lengkap!");
    
    let detail = "";
    let sub = 0;
    keranjang.forEach(item => { detail += "- " + item.nama + "%0A"; sub += item.harga; });
    
    const total = sub + ongkirSekarang;
    const pesan = `Halo Admin Sehat Farma,%0ASaya ingin pesan:%0A${detail}%0A*Nama:* ${nama}%0A*Alamat:* ${alamat} (${kota})%0A*Subtotal:* Rp ${sub.toLocaleString()}%0A*Ongkir:* Rp ${ongkirSekarang.toLocaleString()}%0A*Total Bayar:* Rp ${total.toLocaleString()}`;
    
    window.open(`https://wa.me/6285731070315?text=${pesan}`);
}
