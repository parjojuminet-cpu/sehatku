let keranjang = [];

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

    if (input === "") {
        tampilkanHalaman('promo');
        return;
    }

    sections.forEach(s => { if(s.id !== 'hero') s.style.display = 'block'; });
    cards.forEach(card => {
        let nama = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = nama.includes(input) ? "block" : "none";
    });
}

// KERANJANG (FUNGSI UTAMA)
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
    const textTotal = document.getElementById('text-total');
    
    container.innerHTML = "";
    let total = 0;

    if (keranjang.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <i class="fas fa-shopping-basket" style="font-size:3rem; color:#eee;"></i>
                <p style="color:#999; margin-top:10px;">Keranjang kosong</p>
            </div>`;
        totalCon.style.display = 'none';
    } else {
        keranjang.forEach((item, i) => {
            total += item.harga;
            container.innerHTML += `
                <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; border-bottom:1px solid #f8f9fa;">
                    <div>
                        <b style="display:block; font-size:0.9rem; color:#2c3e50;">${item.nama}</b>
                        <span style="color:var(--primary); font-weight:800; font-size:0.85rem;">Rp ${item.harga.toLocaleString('id-ID')}</span>
                    </div>
                    <i class="fas fa-trash-alt" style="color:#ff7675; cursor:pointer; padding:10px;" onclick="hapusItem(${i})"></i>
                </div>`;
        });
        totalCon.style.display = 'flex';
        textTotal.innerText = "Rp " + total.toLocaleString('id-ID');
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

function cekMetode() {
    const m = document.getElementById('metode-bayar').value;
    document.getElementById('info-rek').style.display = (m === 'Transfer') ? 'block' : 'none';
    document.getElementById('info-qris').style.display = (m === 'QRIS') ? 'block' : 'none';
}

// WHATSAPP
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

    if (keranjang.length === 0) return alert("Keranjang kosong!");
    if (!nama || !alamat) return alert("Lengkapi data pengiriman!");

    let list = "";
    let total = 0;
    keranjang.forEach((item, i) => {
        list += `${i + 1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        total += item.harga;
    });

    const teks = `*PESANAN BARU - SEHAT FARMA*%0A*Nama:* ${nama}%0A*Alamat:* ${alamat}%0A*Metode:* ${metode}%0A*Order:*%0A${list}*TOTAL: Rp ${total.toLocaleString('id-ID')}*`;
    window.open(`https://wa.me/6285731070315?text=${teks}`);
}
