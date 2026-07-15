<div align="center">

# 🧾 AntiNgutang

**Foto struk. Tap siapa pesen apa. Selesai.**

Nggak perlu ngetik ulang item satu-satu, nggak perlu buka kalkulator, nggak perlu jadi "bendahara" yang direpotin ngitung manual abis makan bareng.

</div>

---

## Masalah

Tiap habis makan atau belanja bareng teman, hampir selalu terjadi hal yang sama:

- Satu orang bayar dulu, lalu semua orang harus diingetin buat transfer bagiannya
- Kalau pesenan beda-beda, ngitung manual siapa bayar berapa itu ribet dan gampang salah — apalagi kalau ada pajak dan service charge yang harus dibagi proporsional, bukan rata
- Aplikasi split bill yang sudah ada tetap butuh **ngetik ulang** semua item dan harga secara manual

## Solusi

AntiNgutang biarkan AI yang baca struknya, jadi kamu tinggal foto dan assign siapa pesen apa.

```
Foto struk
   ↓
AI baca & extract semua item + harga
   ↓
Tap nama peserta ke tiap item
   ↓
Pajak & service dihitung proporsional otomatis
   ↓
Copy ringkasan, kirim ke grup
```

## Fitur

- **Scan struk otomatis** — AI vision baca item, harga, pajak, dan service charge dari foto struk
- **Assign per item** — tap nama ke tiap baris, bisa lebih dari satu orang kalau item-nya di-share
- **Split proporsional** — pajak dan service charge dibagi sesuai porsi subtotal masing-masing, bukan rata
- **Copy & share** — ringkasan siap paste ke WhatsApp, nggak perlu screenshot
- **Tanpa akun** — buka, pakai, selesai. Nggak ada sign up, nggak ada instal aplikasi
- **PWA** — bisa diinstall di HP layaknya aplikasi native

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19 + Vite |
| AI | Groq (Llama 4 Scout — vision) |
| Hosting | Vercel |
| PWA | vite-plugin-pwa + Workbox |

Stateless by design — semua proses ada di client + satu API endpoint buat panggil AI. Nggak ada database, nggak ada backend rumit.

## Getting Started

### Prasyarat

- Node.js 18+
- API key dari [Groq](https://console.groq.com) (gratis)

### Instalasi

```bash
git clone https://github.com/your-username/antingutang.git
cd antingutang/antingutang

npm install

cp .env.example .env
# isi GROQ_API_KEY di .env dengan API key dari console.groq.com

npm run dev
```

App berjalan di `http://localhost:5173`, API server di `http://localhost:3001`.

### Environment Variables

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxx
```

### Deploy ke Vercel

```bash
vercel deploy
```

Tambahkan `GROQ_API_KEY` di Vercel Dashboard → Settings → Environment Variables.

## Roadmap

**MVP (sudah ada):**
- [x] Upload/foto struk
- [x] AI extract item & harga
- [x] Assign item ke peserta
- [x] Split proporsional pajak & service charge
- [x] Copy ringkasan ke clipboard
- [x] PWA (installable di HP)

**Kalau masih semangat lanjut:**
- [ ] Gabung beberapa struk jadi satu sesi
- [ ] Riwayat split sebelumnya (local storage)
- [ ] Custom split manual untuk kasus di luar per-item

## Contributing

Kalau ada ide atau nemu bug, issue dan PR selalu welcome.

## License

MIT

---

<div align="center">
<sub>Dibuat karena capek jadi bendahara dadakan tiap abis makan bareng.</sub>
</div>
