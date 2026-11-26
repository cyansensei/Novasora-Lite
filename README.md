# Novasora Lite

UI lobi game RPG berbasis web (HTML, CSS, JavaScript murni, tanpa framework). Bisa dimainkan di browser HP dan dipasang sebagai aplikasi (PWA).

**Main sekarang:** https://cyansensei.github.io/Novasora-Lite/

## Isi game

Lobi dengan menu Inventory, Craft, Equipment, Skill, Char, Shop, Task, Daily Reward, Notice, dan Social. Tampilan dirancang landscape (1280×576) dan menyesuaikan layar otomatis.

Progres tersimpan di `localStorage` browser (kunci `rpg_game`), jadi terikat pada alamat tempat game dibuka.

## Struktur folder

```
index.html            halaman utama
manifest.json         data instal aplikasi (PWA)
sw.js                 service worker (cadangan offline)
css/
  base.css            gaya dasar
  style.css           gaya tampilan game
js/
  game.js             logika game utama
  efek.js             efek ketuk (sprite) dan zoom
  geser.js            geser daftar dengan jari
  layar-penuh.js      tombol layar penuh dan penyegaran ukuran
assets/
  icons/              ikon aplikasi
  img/
    ui/               ikon menu dan tombol
    equipment/        ikon equipment
    items/            ikon batu enhancement
    fx/               sprite efek
```

## Arsitektur data (di `js/game.js`)

Data game diakses lewat tiga objek "satu pintu", supaya fitur lain tidak menyentuh data mentah:

| Objek | Mengurus |
|-------|----------|
| `Inv` | stok item (`DATA.inv`) |
| `Eq`  | equipment dan slotnya (`DATA.eq`, `DATA.eqSlots`) |
| `Char` | progres karakter, daftar karakter, form tim (`DATA.prog`, `DATA.chars`, `DATA.formSel`) |

Blok migrasi data saat load adalah satu-satunya tempat yang langsung membaca `DATA.*`.

## Menjalankan di komputer

Buka lewat server lokal, jangan klik dua kali `index.html` (browser memblokir pemuatan file lain dari `file://`):

```
python3 -m http.server 8000
```

lalu buka `http://localhost:8000`.

## Mengubah game

Setelah mengubah file, naikkan nomor versi cache di `sw.js` (`novasora-v2` menjadi `novasora-v3`) bila menambah atau memindah file, dan perbarui daftar `FILES` di dalamnya.
