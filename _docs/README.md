# Dokumentasi JSONLive

Dokumen ini menjelaskan cara kerja, aturan, dan sejarah keputusan project JSONLive.
Ditulis singkat dan to the point supaya enak dibaca manusia maupun AI agent.

## Baca Sesuai Kebutuhan

| Nomor | File | Isi | Baca ketika |
|-------|------|-----|-------------|
| 01 | [Apa Itu JSONLive](01-apa-itu-jsonlive.md) | Masalah, solusi, ruang lingkup | Baru pertama kali |
| 02 | [Arsitektur](02-arsitektur.md) | Diagram sistem, lapisan, alur request | Mau tahu sistemnya seperti apa |
| 03 | [Stack dan Struktur Folder](03-stack-dan-struktur-folder.md) | Teknologi dan tugas tiap folder | Mau ubah kode tapi bingung letaknya |
| 04 | [Model Data](04-model-data.md) | Tabel database dan relasinya | Mau tambah kolom atau tabel |
| 05 | [API Internal](05-api-internal.md) | Endpoint dashboard, API key, akun, admin | Mau kerja di sisi server |
| 06 | [API Data Publik](06-api-publik.md) | Endpoint untuk aplikasi luar | Mau integrasi atau debug endpoint |
| 07 | [Alur Data Resource](07-alur-data-resource.md) | Siklus create sampai delete | Mau paham alur data |
| 08 | [Autentikasi dan Otorisasi](08-autentikasi-dan-otorisasi.md) | Login, role, API key, resource privat | Sedang urusan hak akses |
| 09 | [Batas dan Keamanan](09-batas-dan-keamanan.md) | Rate limit, ukuran JSON, CORS | Mau tahu batasannya apa |
| 10 | [Halaman dan Komponen](10-halaman-dan-komponen.md) | Peta halaman UI dan komponen | Mau buat halaman atau komponen baru |
| 11 | [Setup Lokal](11-setup-lokal.md) | Cara menjalankan project di komputer | Baru mau install atau nemu error |
| 12 | [Deploy dan CI](12-deploy-dan-ci.md) | Docker, GitHub Actions, tunnel | Mau online-kan ke server |
| 13 | [Konvensi dan Cara Kerja](13-konvensi-dan-cara-kerja.md) | Aturan menulis kode, checklist | Sebelum mulai ngoding |
| 14 | [Status dan Rencana](14-status-dan-rencana.md) | Sudah jadi apa, belum jadi apa | Mau tahu prioritas berikutnya |

## Alur Baca

Kalau baru comeback ke project ini setelah lama tidak disentuh, urutan ini paling cepat:

```text
1. 01 Apa Itu JSONLive        pahami ulang produk ini
2. 14 Status dan Rencana      tahu apa yang sudah dan belum jadi
3. 13 Konvensi dan Cara Kerja tahu aturan sebelum ngoding
4. 02 Arsitektur              tahu sistemnya seperti apa
5. 03 Stack dan Struktur      tahu file mana untuk tugas apa
```

Kalau sedang mengerjakan tugas tertentu, langsung ke tabel di atas.

## Aturan Dokumentasi Ini

- Satu file satu topik. Kalau topiknya mulai melebar, pecah jadi file baru dengan nomor berikutnya.
- Perubahan kode yang besar wajib update file yang relevan di folder ini.
- Panjang maksimal satu file sekitar 250 baris. Lebih dari itu, pecah.
- Istilah teknis (endpoint, resource, migration) dipakai apa adanya dalam bahasa Inggris. Penjelasan selalu Bahasa Indonesia.

## Konteks Project

| Item | Nilai |
|------|-------|
| Nama | JSONLive |
| Jenis | Hosted JSON API / mock API |
| Runtime | Next.js 16 App Router + PostgreSQL |
| Package manager | pnpm 10 |
| Branch utama | `main` |
| Status | MVP berjalan, sebagian fitur masih ada gap |

Detail produk ada di [../AGENTS.md](../AGENTS.md).
Dokumen di folder ini adalah versi teknis yang mengikuti kondisi kode saat ini.
Kalau keduanya berbeda, dokumen ini yang lebih benar karena diverifikasi langsung ke kode.
