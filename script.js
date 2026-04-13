let keranjang = [];
let ongkirSekarang = 0;

// 1. GANTI DENGAN URL GOOGLE SCRIPT (GAS) KAMU
const URL_MESIN_ONGKIR = "https://script.google.com/macros/s/AKfycbxn-cQKWoYCkfMbiAQEvZ8T0qHPhzvjGTZZxeU98kWXOnZwvmxNd9WTtGTKNzw3cdhT/exec"; 

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
    const textSubtotal = document.getElementById('text-subtotal');
    const textTotal = document.getElementById('text-total');
    const textOngkir = document.getElementById('text-ongkir');
    
    container.innerHTML = "";
    let subtotal = 0;

    if (keranjang.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 20px;"><p>Keranjang kosong</p></div>`;
        document.getElementById('total-container').style.display = 'none';
        document.getElementById('area-pembayaran').style.display = 'none';
    } else {
        keranjang.forEach((item, i) => {
            subtotal += item.harga;
            container.innerHTML += `
                <div class="cart-item" style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                    <div><b>${item.nama}</b><br>Rp ${item.harga.toLocaleString('id-ID')}</div>
                    <i class="fas fa-trash" style="color:red; cursor:pointer;" onclick="hapusItem(${i})"></i>
                </div>`;
        });
        document.getElementById('total-container').style.display = 'block';
        textSubtotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
        
        // Reset ongkir kalau keranjang berubah tapi belum pilih kota lagi
        if (ongkirSekarang === 0) {
            textTotal.innerText = "Rp " + subtotal.toLocaleString('id-ID');
            textOngkir.innerText = "Rp 0";
        } else {
            textTotal.innerText = "Rp " + (subtotal + ongkirSekarang).toLocaleString('id-ID');
        }
    }
    document.getElementById('modal-keranjang').style.display = 'flex';
}

// FUNGSI CEK ONGKIR OTOMATIS + LOG UNTUK LACAK ERROR
async function hitungOngkirOtomatis() {
    const idKota = document.getElementById('kota-tujuan').value;
    const textOngkir = document.getElementById('text-ongkir');
    const textTotal = document.getElementById('text-total');
    const textSubtotal = document.getElementById('text-subtotal');

    if (!idKota) {
        ongkirSekarang = 0;
        document.getElementById('area-pembayaran').style.display = 'none';
        return;
    }

    textOngkir.innerText = "Cek tarif...";
    console.log("Mencoba cek ongkir ke ID Kota:", idKota);

    try {
        let subtotal = 0;
        keranjang.forEach(item => subtotal += item.harga);

        // Fetch data dari Google Script
        const respon = await fetch(`${URL_MESIN_ONGKIR}?dest=${idKota}&weight=1000`);
        const hasil = await respon.json();
        
        console.log("Respon API:", hasil); // Ini console log untuk cek di Inspect Element laptop

        if (hasil.rajaongkir && hasil.rajaongkir.results[0].costs.length > 0) {
            // Ambil biaya JNE Reguler
            ongkirSekarang = hasil.rajaongkir.results[0].costs[0].cost[0].value;
            
            textOngkir.innerText = "Rp " + ongkirSekarang.toLocaleString('id-ID');
            const totalAkhir = subtotal + ongkirSekarang;
            textTotal.innerText = "Rp " + totalAkhir.toLocaleString('id-ID');

            // Munculkan pembayaran & Sembunyikan notifikasi
            document.getElementById('area-pembayaran').style.display = 'block';
            document.getElementById('notif-ongkir').style.display = 'none';
        } else {
            textOngkir.innerText = "Tidak tersedia";
            alert("Layanan pengiriman tidak tersedia untuk wilayah ini.");
        }

    } catch (error) {
        console.error("Detail Error:", error);
        textOngkir.innerText = "Gagal koneksi";
        alert("Gagal ambil ongkir. Pastikan URL Google Script sudah benar.");
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
    const metode = document.getElementById('metode-bayar').value;
    const kotaSelect = document.getElementById('kota-tujuan');
    const namaKota = kotaSelect.options[kotaSelect.selectedIndex].text;

    if (!nama || !alamat || !kotaSelect.value) return alert("Lengkapi data pengiriman!");

    let list = "";
    let subtotal = 0;
    keranjang.forEach((item, i) => {
        list += `${i + 1}. ${item.nama} (Rp ${item.harga.toLocaleString('id-ID')})%0A`;
        subtotal += item.harga;
    });

    const totalFix = subtotal + ongkirSekarang;
    const teks = `*PESANAN BARU*%0A*Nama:* ${nama}%0A*Alamat:* ${alamat} (${namaKota})%0A*Metode:* ${metode}%0A%0A*Order:*%0A${list}%0A*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}%0A*Ongkir:* Rp ${ongkirSekarang.toLocaleString('id-ID')}%0A*TOTAL: Rp ${totalFix.toLocaleString('id-ID')}*`;
    
    window.open(`https://wa.me/6285731070315?text=${teks}`);
}
