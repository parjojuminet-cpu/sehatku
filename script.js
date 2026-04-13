let keranjang = [];
let ongkirSekarang = 0;

// ==========================================
// 1. MASUKKAN URL GOOGLE SCRIPT KAMU DI SINI
// ==========================================
const URL_GAS = "https://script.google.com/macros/s/AKfycbzPrndb7wzNOKPedWi8NWkC-5aX2HeMvpDK7WEciauJvlhQEW0GblZYwYJ4JiKV7I0-/exec"; 

// MENU MOBILE
function toggleMenu() {
    document.getElementById('navMenu').classList.toggle('active');
}

// PINDAH HALAMAN
function tampilkanHalaman(id) {
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    document.getElementById('hero').style.display = 'block';
    const target = document.getElementById(id);
    if(target) target.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('navMenu').classList.remove('active');
}

// PENCARIAN
function cariProduk() {
    let input = document.getElementById('navSearchInput').value.toLowerCase();
    let cards = document.querySelectorAll('.card');
    let sections = document.querySelectorAll('section');
    if (input === "") { tampilkanHalaman('promo'); return; }
    sections.forEach(s => { if(s.id !== 'hero') s.style.display = 'block'; });
    cards.forEach(card => {
        let nama = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = nama.includes(input) ? "block" : "none";
    });
}

// TAMBAH KE KERANJANG
function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    document.getElementById('cart-count').innerText = keranjang.length;
    alert(nama + " berhasil ditambah!");
}

// HAPUS DARI KERANJANG
function hapusItem(index) {
    keranjang.splice(index, 1);
    document.getElementById('cart-count').innerText = keranjang.length;
    bukaModalKeranjang();
}

function tutupModal(id) {
    document.getElementById(id).style.display = 'none';
}

// BUKA KERANJANG & HITUNG SUB TOTAL
function bukaModalKeranjang() {
    const container = document.getElementById('daftar-item-keranjang');
    const textSubtotal = document.getElementById('text-subtotal');
    const textTotal = document.getElementById('text-total');
    
    container.innerHTML = "";
    let subtotal = 0;

    if (keranjang.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:30px;"><p style="color:#999;">Keranjang masih kosong</p></div>`;
        document.getElementById('total-container').style.display = 'none';
        document.getElementById('area-pembayaran').style.display = 'none';
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `
                <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
                    <div><b>${item.nama}</b><br><span style="color:red">Rp ${item.harga.toLocaleString('id-ID')}</span></div>
                    <i class="fas fa-trash-alt" style="color:#ff7675; cursor:pointer;" onclick="hapusItem(${i})"></i>
                </div>`;
        });
        document.getElementById('total-container').style.display = 'block';
        textSubtotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
        
        // Update Total (Subtotal + Ongkir yang sudah ada)
        const totalAkhir = subtotal + ongkirSekarang;
        textTotal.innerText = "Rp " + totalAkhir.toLocaleString('id-ID');
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

// HITUNG ONGKIR OTOMATIS (CORE FUNCTION)
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    
    if (!idKota) {
        ongkirSekarang = 0;
        document.getElementById('area-pembayaran').style.display = 'none';
        return;
    }

    textOngkir.innerText = "Mengecek tarif...";

    // Menggunakan AllOrigins Proxy supaya tidak kena blokir CORS oleh Google
    const finalUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(URL_GAS + "?dest=" + idKota + "&weight=1000")}`;

    try {
        const response = await fetch(finalUrl);
        const proxyData = await response.json();
        // Mengubah string contents menjadi objek JSON
        const data = JSON.parse(proxyData.contents); 

        if (data.rajaongkir && data.rajaongkir.results[0].costs.length > 0) {
            // Ambil biaya JNE Reguler (Indeks 0)
            ongkirSekarang = data.rajaongkir.results[0].costs[0].cost[0].value;
            
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            
            let subtotal = 0;
            keranjang.forEach(item => subtotal += item.harga);
            
            const totalBayar = subtotal + ongkirSekarang;
            textTotal.innerText = "Rp " + totalBayar.toLocaleString('id-ID');
            
            // Tampilkan tombol bayar & sembunyikan notif
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Tidak didukung";
            alert("Maaf, pengiriman ke lokasi ini belum tersedia.");
        }
    } catch (err) {
        console.error("Error Ongkir:", err);
        textOngkir.innerText = "Gagal memuat";
    }
}

// CEK METODE BAYAR
function cekMetode() {
    const m = document.getElementById('metode-bayar').value;
    document.getElementById('info-rek').style.display = (m === 'Transfer') ? 'block' : 'none';
    document.getElementById('info-qris').style.display = (m === 'QRIS') ? 'block' : 'none';
}

// KONFIRMASI KE WHATSAPP
function konfirmasiPesanan() {
    const nama = document.getElementById('nama-pembeli').value;
    const alamat = document.getElementById('alamat-pembeli').value;
    const metode = document.getElementById('metode-bayar').value;
    const kotaSelect = document.getElementById('kota-tujuan');
    const namaKota = kotaSelect.options[kotaSelect.selectedIndex].text;

    if (!nama || !alamat || !kotaSelect.value) {
        return alert("Mohon lengkapi Nama, Alamat, dan Lokasi!");
    }

    let list = "";
    let subtotal = 0;
    keranjang.forEach((item, i) => {
        list += `${i + 1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        subtotal += item.harga;
    });

    const totalFix = subtotal + ongkirSekarang;
    const nomorWA = "6285731070315"; // Nomor WA Kamu

    const teks = `*PESANAN BARU - SEHAT FARMA*%0A` +
                 `--------------------------------%0A` +
                 `*Nama:* ${nama}%0A` +
                 `*Alamat:* ${alamat}%0A` +
                 `*Kota:* ${namaKota}%0A` +
                 `*Metode:* ${metode}%0A%0A` +
                 `*Daftar Order:*%0A${list}%0A` +
                 `*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}%0A` +
                 `*Ongkir:* Rp ${ongkirSekarang.toLocaleString('id-ID')}%0A` +
                 `*TOTAL TRANSFER: Rp ${totalFix.toLocaleString('id-ID')}*%0A` +
                 `--------------------------------%0A` +
                 `Mohon segera diproses ya Min!`;
    
    window.open(`https://wa.me/${nomorWA}?text=${teks}`);
}

// FUNGSI KONSULTASI & PESAN BIASA
function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Saya ingin pesan: ${nama}`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo admin, saya ingin konsultasi`);
}
