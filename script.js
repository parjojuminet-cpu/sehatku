let keranjang = [];
let ongkirSekarang = 0;
// MASUKKAN URL GOOGLE SCRIPT KAMU DI SINI
const URL_MESIN_ONGKIR = "https://script.google.com/macros/s/AKfycbwGVQdvxCXNasPgMTEUIM9W9Co-tkXxpoyNmM0n4zfPjnBRvyHpHugqwfpEiXPTTvP5/exec"; 

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
    document.getElementById('navMenu').classList.remove('active');
}

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

function tambahKeranjang(nama, harga) {
    keranjang.push({ nama: nama, harga: harga });
    document.getElementById('cart-count').innerText = keranjang.length;
    alert(nama + " berhasil ditambah ke keranjang!");
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
    const totalCon = document.getElementById('total-container');
    const textSubtotal = document.getElementById('text-subtotal');
    const textTotal = document.getElementById('text-total');
    
    container.innerHTML = "";
    let subtotal = 0;

    if (keranjang.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 20px;"><i class="fas fa-shopping-basket" style="font-size:3rem; color:#eee;"></i><p style="color:#999; margin-top:10px;">Keranjang kosong</p></div>`;
        totalCon.style.display = 'none';
        document.getElementById('area-pembayaran').style.display = 'none';
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `
                <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid #f8f9fa;">
                    <div><b style="display:block; font-size:0.9rem; color:#2c3e50;">${item.nama}</b><span style="color:var(--primary); font-weight:800; font-size:0.85rem;">Rp ${item.harga.toLocaleString('id-ID')}</span></div>
                    <i class="fas fa-trash-alt" style="color:#ff7675; cursor:pointer; padding:10px;" onclick="hapusItem(${i})"></i>
                </div>`;
        });
        totalCon.style.display = 'block';
        textSubtotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
        updateTampilanTotal(subtotal);
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

// FUNGSI CEK ONGKIR OTOMATIS
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    
    if (!idKota) {
        ongkirSekarang = 0;
        document.getElementById('area-pembayaran').style.display = 'none';
        document.getElementById('notif-ongkir').style.display = 'block';
        bukaModalKeranjang();
        return;
    }

    textOngkir.innerText = "Memuat...";
    
    try {
        // Ambil berat total (asumsi per item 100gr)
        let berat = keranjang.length * 100; 
        const respon = await fetch(`${URL_MESIN_ONGKIR}?dest=${idKota}&weight=${berat}`);
        const hasil = await respon.json();
        
        // Ambil harga JNE Reguler (dari RajaOngkir)
        ongkirSekarang = hasil.rajaongkir.results[0].costs[0].cost[0].value;
        
        textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
        document.getElementById('area-pembayaran').style.display = 'block';
        document.getElementById('notif-ongkir').style.display = 'none';
        
        let subtotal = 0;
        keranjang.forEach(item => subtotal += item.harga);
        updateTampilanTotal(subtotal);

    } catch (error) {
        alert("Gagal ambil ongkir. Coba lagi nanti.");
        textOngkir.innerText = "Rp 0";
    }
}

function updateTampilanTotal(sub) {
    const totalSemua = sub + ongkirSekarang;
    document.getElementById('text-total').innerText = "Rp " + totalSemua.toLocaleString('id-ID');
}

function cekMetode() {
    const m = document.getElementById('metode-bayar').value;
    document.getElementById('info-rek').style.display = (m === 'Transfer') ? 'block' : 'none';
    document.getElementById('info-qris').style.display = (m === 'QRIS') ? 'block' : 'none';
}

function waPesan(nama) {
    window.open(`https://wa.me/6285731070315?text=Saya ingin pesan: ${nama}`);
}

function waKonsultasi() {
    window.open(`https://wa.me/6285731070315?text=Halo admin, saya ingin konsultasi`);
}

function konfirmasiPesanan() {
    const nama = document.getElementById('nama-pembeli').value;
    const alamat = document.getElementById('alamat-pembeli').value;
    const metode = document.getElementById('metode-bayar').value;
    const kotaSelect = document.getElementById('kota-tujuan');
    const namaKota = kotaSelect.options[kotaSelect.selectedIndex].text;

    if (keranjang.length === 0) return alert("Keranjang kosong!");
    if (!nama || !alamat || !kotaSelect.value) return alert("Lengkapi data pengiriman!");

    let list = "";
    let subtotal = 0;
    keranjang.forEach((item, i) => {
        list += `${i + 1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        subtotal += item.harga;
    });

    const totalFix = subtotal + ongkirSekarang;

    const teks = `*PESANAN BARU - SEHAT FARMA*%0A*Nama:* ${nama}%0A*Alamat:* ${alamat} (${namaKota})%0A*Metode:* ${metode}%0A%0A*Order:*%0A${list}%0A*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}%0A*Ongkir (JNE):* Rp ${ongkirSekarang.toLocaleString('id-ID')}%0A*TOTAL TRANSFER: Rp ${totalFix.toLocaleString('id-ID')}*`;
    
    window.open(`https://wa.me/6285731070315?text=${teks}`);
}
