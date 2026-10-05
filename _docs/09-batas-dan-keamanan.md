# 09. Batas dan Keamanan

Semua angka batas ada di satu file: `src/lib/config.ts`. Kalau butuh mengubah batas, ubah di sana, jangan menulis angka langsung di route handler.

## Isi config.ts

```ts
PUBLIC_BASE_URL = "http://localhost:3000"
DEFAULT_USERNAME = "User"

LIMITS = {
  MAX_JSON_SIZE:  5 * 1024 * 1024,   // 5 MB
  MAX_RESOURCES:  5,
}

RATE_LIMIT = {
  GET:   { limit: 500, windowMS: 60_000 },
  WRITE: { limit: 100, windowMS: 60_000 },
}

MAX_API_KEYS = 5
STORAGE_LIMIT = LIMITS.MAX_JSON_SIZE * LIMITS.MAX_RESOURCES
```

## Batas Kuota

| Batas | Nilai | Diterapkan di |
|-------|-------|---------------|
| Ukuran JSON per resource | 5 MB | `POST /api/resources` |
| Jumlah resource per user | 5 | `POST /api/resources` |
| Jumlah API key per user | 5 | `POST /api/api-keys` |

Dua hal yang perlu diketahui:

`POST /api/api-keys` memakai `MAX_API_KEYS`, bukan `user.maxResource`. Keduanya hardcoded di config, bukan dibaca dari database.

`POST /api/resources` memakai `LIMITS.MAX_RESOURCES`, bukan `user.maxResource` milik user. Field `maxResource` di database bisa diubah admin lewat panel admin, tapi nilainya belum dipakai saat membuat resource. Kuota efektif selalu 5.

Ukuran JSON dihitung ulang dari `data` setelah di-`JSON.stringify`, lalu diukur dengan `TextEncoder`:

```ts
const bodySize = new TextEncoder().encode(JSON.stringify(data)).length;
```

Batas ini hanya dicek di `POST /api/resources`. `PUT /api/resources/:id` tidak punya pengecekan ini.

## Rate Limit

File: `src/lib/rate-limit.ts`. Store-nya `Map` di memori proses.

```text
RateLimit(key, limit, windowMs)
  - Kalau key belum ada, catat satu timestamp sekarang, selesai
  - Buang timestamp yang sudah lebih dari windowMs dari key itu
  - Kalau jumlah timestamp >= limit, lempar RateLimitExceeded
  - Kalau belum, tambahkan timestamp sekarang
```

Pembersihan otomatis (`maybeSweep`) jalan setiap 100 pemanggilan, dan hanya menghapus bucket yang timestamp-nya sudah kosong.

### Pengaturan

| Jenis | Batas | Jendela |
|-------|-------|---------|
| Baca, semua endpoint publik | 500 per menit | 60 detik |
| Tulis, semua endpoint publik | 100 per menit | 60 detik |

### Kunci

Kuncinya hanya IP client, tidak per endpoint dan tidak per user. Artinya satu IP yang aktif di dashboard dan endpoint publik berbagi kuota yang sama untuk endpoint publik.

`clientIp()` membaca header secara berurutan:

```text
1. cf-connecting-ip      -> dipakai Cloudflare Tunnel
2. x-forwarded-for       -> ambil bagian pertama sebelum koma
3. x-real-ip
4. "unknown"             -> semua orang jadi satu kunci
```

Kalau aplikasi dijalankan tanpa proxy di depannya, semua request lokal akan dapat IP yang sama.

### Batasan yang Harus Diketahui

| Kekurangan | Dampak |
|-----------|--------|
| Disimpan di memori | Hilang saat server restart |
| Satu proses saja | Kalau jalan multi-instance, setiap instance punya kuota sendiri |
| Kunci cuma IP | Di balik NAT atau proxy bersama, satu kuota dipakai banyak user |
| Tidak ada header limit | Client tidak tahu sisa kuota, cuma `Retry-After` saat sudah habis |

Yang sudah ada: response `429` mengirim header `Retry-After` berisi detik menunggu.

## CORS

Header ini ada di dua route publik saja:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key
```

`OPTIONS` selalu balas `204` dengan header tersebut, tanpa cek rate limit dan tanpa cek auth. Ini standar preflight browser.

Kenapa `*`? Karena use case-nya memang endpoint mock yang dipanggil frontend dari domain lain, termasuk `localhost`. Feature ini wajib, bukan kelemahan.

Endpoint dashboard tidak mengirim header CORS, karena dipakai dari origin yang sama.

## Daftar Cek Keamanan

Sudah aman:

- Database tidak dibuka ke host, hanya di jaringan internal Docker.
- Password di-hash oleh better-auth, tidak pernah menyentuh kode JSONLive.
- API key di-hash dengan SHA-256, yang asli tidak disimpan.
- Role, kuota, dan status hapus akun tidak bisa diisi sendiri saat signup.
- Semua query resource difilter `userId`, jadi user tidak bisa akses resource orang lain.
- Resource privat membalas `401` kalau diakses session orang lain.
- Rate limit ada di endpoint publik.
- Batas ukuran JSON ada saat create.

Perlu diperbaiki:

| Masalah | Lokasi | Dampak |
|---------|--------|--------|
| `PUBLIC_BASE_URL` hardcoded ke `http://localhost:3000` | `src/lib/config.ts` | URL yang ditampilkan di UI salah saat production |
| `user.maxResource` tidak dipakai | `POST /api/resources` | Kuota yang diedit admin tidak berpengaruh |
| `PUT /api/resources/:id` tidak cek ukuran JSON | route resource | Bisa menyimpan JSON lebih dari 5 MB |
| `PUT /api/resources/:id` tidak cek slug unik | route resource | Risiko slug duplikat |
| Pesan error menyebut 1 MB padahal batasnya 5 MB | `POST /api/resources` | Menyesatkan user |
| Rate limit in-memory | `src/lib/rate-limit.ts` | Hilang saat restart, tidak shared antar instance |
| `private` tidak dicek di route tulis | route publik | Private resource masih bisa ditulis dengan API key |
| Pesan hapus akun menjanjikan 3 hari | `DELETE /api/account/delete` | Tidak ada worker yang menjalankan |
| `api.get` dan `api.delete` tidak punya batas ukuran response | `src/lib/api.ts` | Browser menerima response sebesar apa pun |

Detail dan urutan perbaikannya di [14-status-dan-rencana.md](14-status-dan-rencana.md).

## Yang Tidak Ada Belum

Hal-hal ini belum ada, jadi jangan mengandalkan untuk keamanan:

- Email verifikasi, jadi `email` bisa dipakai orang lain
- CAPTCHA atau proteksi bot di halaman registrasi
- Log request, jadi tidak ada jejak audit
- Deteksi anomali traffic
- Pembatasan ukuran request di level reverse proxy atau Cloudflare
- Enkripsi saat transit selain HTTPS dari tunnel

## Kalau Ingin Menambah Batas

Tiga pilihan, pilih yang paling masuk akal untuk situasinya:

1. Naikkan angka di `src/lib/config.ts`. Paling cepat, kurang fleksibel.
2. Pakai kolom `user.maxResource` per user. Perlu ubah `POST /api/resources` supaya membaca `session.user.maxResource`. Ini jalur yang paling benar karena infrastrukturnya sudah ada.
3. Pindahkan ke rate limit di Cloudflare. Paling kuat, tidak menyentuh kode.
