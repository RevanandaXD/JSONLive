# 01. Apa Itu JSONLive

## Satu Kalimat

JSONLive mengubah data JSON menjadi **public HTTP API** yang bisa langsung dipanggil frontend, mobile app, atau CI/CD.

```text
Paste JSON -> Simpan -> Dapat URL -> fetch() -> JSON
```

## Masalah yang Diselesaikan

Saat membuat frontend, backend sering belum siap. Solusi umum adalah memasang mock server di laptop sendiri, misalnya `json-server`. Masalahnya:

| Cara Lama | Masalah |
|-----------|---------|
| `json-server` di laptop | Hanya jalan di laptop. Rekan tim tidak bisa akses |
| File JSON di repo | Frontend harus import file, bukan `fetch()` |
| Mock di atas req | Hanya untuk satu aplikasi, tidak reusable |
| Deploy backend dummy | Terlalu berat untuk data dummy |

JSONLive memindahkan mock server ke server publik. URL yang dihasilkan bisa diakses dari mana saja: laptop orang lain, server CI, Vercel preview, sampai GitHub Actions.

## Siapa yang Pakai

| Tipe | Contoh |
|------|--------|
| Frontend developer | Butuh data sebelum backend selesai |
| Mahasiswa | Tugas demo atau portofolio |
| Developer pemula | Belajar consume API tanpa bikin server |
| API testing | Butuh endpoint yang bisa di-POST, PATCH, DELETE |
| Tim | Satu fixture dipakai banyak anggota tim |

## Dua Kemampuan Utama

### 1. Baca data tanpa login

Resource yang `published` bisa dibaca siapa saja, tanpa API key:

```http
GET /api/revan/users
```

### 2. Ubah data dengan API key

Kalau butuh CRUD pada resource, user membuat API key di halaman Settings lalu mengirimkannya sebagai header:

```http
POST /api/revan/users
x-api-key: jlv_a1b2c3d4e5f6a7b8_secret...
```

## Ruang Lingkup Saat Ini

Sudah jadi:

- Registrasi, login, logout, session
- Dashboard: daftar, buat, edit, hapus resource
- Editor JSON dengan validasi dan format
- Public GET untuk collection dan per item
- Public write (POST, PUT, PATCH, DELETE) dengan API key
- Resource privat (hanya pemilik yang bisa baca)
- API key dengan masa berlaku
- Halaman `/public` untuk melihat semua endpoint yang dipublish
- Halaman `/docs` sebagai dokumentasi API publik
- Panel admin: kelola user, role, kuota resource
- Pengajuan hapus akun dengan konfirmasi email

Belum jadi:

- Custom status code, custom header, response delay
- Request log
- Expiry resource
- Login social (GitHub, Google)
- Email verifikasi dan reset password
- Rate limit per paket berbayar

## Prinsip Produk

> Simple to create. Simple to consume. Simple to deploy.

Tiga hal yang harus selalu benar:

1. Butuh backend untuk memakai JSON.
2. URL harus bisa di-`fetch()` tanpa setup tambahan.
3. Deploy harus tetap ringan, tidak butuh banyak RAM.

## Batas yang Diketahui

- 5 resource per user
- 5 MB per resource
- 500 request/menit untuk baca, 100 request/menit untuk tulis per IP

Detail lengkap di [09-batas-dan-keamanan.md](09-batas-dan-keamanan.md).
