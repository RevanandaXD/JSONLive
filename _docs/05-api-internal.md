# 05. API Internal

Endpoint yang dipakai dashboard, pengaturan, dan panel admin.
Semua memakai session cookie, tidak ada API key.

Endpoint untuk aplikasi luar ada di [06-api-publik.md](06-api-publik.md).

Semua response berupa JSON dengan header `Content-Type: application/json`.

## Ringkasan Endpoint

| Method | Path | Auth | Untuk siapa |
|--------|------|------|-------------|
| GET | `/api/resources` | Session | Dashboard |
| POST | `/api/resources` | Session | Dashboard |
| GET | `/api/resources/:id` | Session, pemilik | Dashboard |
| PUT | `/api/resources/:id` | Session, pemilik | Dashboard |
| PATCH | `/api/resources/:id` | Session, pemilik | Dashboard |
| DELETE | `/api/resources/:id` | Session, pemilik | Dashboard |
| GET | `/api/api-keys` | Session | Dashboard |
| POST | `/api/api-keys` | Session | Dashboard |
| DELETE | `/api/api-keys/:id` | Session, pemilik | Dashboard |
| DELETE | `/api/account/delete` | Session | Dashboard |
| POST | `/api/account/cancel-delete` | Session | Dashboard |
| GET | `/api/admin/users` | Session, admin | Panel admin |
| PATCH | `/api/admin/users` | Session, admin | Panel admin |
| ALL | `/api/auth/*` | Bervariasi | Milik better-auth |

Tidak ada rate limit di kelompok endpoint ini. Endpoint publik ada di [06-api-publik.md](06-api-publik.md).

---

## API Dashboard

Dipakai oleh frontend di browser. Semua memakai session cookie, bukan API key.

### GET /api/resources

Mengambil semua resource milik user yang sedang login.

Response:

```json
{ "status": 200, "data": [ /* array of Resource */ ] }
```

### POST /api/resources

Body:

```json
{
  "name": "users",
  "data": [{ "id": 1, "name": "Revan" }],
  "published": true,
  "private": false
}
```

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `name` | Ya | Nama tampilan. Slug dibuat otomatis dari nilai ini |
| `data` | Ya | JSON yang disimpan. Boleh object atau array |
| `published` | Tidak | Default `true` |
| `private` | Tidak | Default `false` |

Response `201`:

```json
{ "status": 201, "data": { "id": "...", "slug": "users", "...": "..." } }
```

Error:

| Code | Kondisi |
|------|---------|
| 400 | `name` atau `data` kosong, JSON lebih dari 5 MB, jumlah resource sudah penuh |
| 401 | Belum login |
| 409 | Slug hasil dari `name` sudah dipakai user ini |
| 500 | Error server |

### GET /api/resources/:id

Mengambil satu resource. Resource milik user lain akan balas `403`.

### PUT /api/resources/:id

Mengganti `name`, `data`, `published`, dan `private` sekaligus.

Perhatikan: `PUT` ini tidak mengecek batas ukuran JSON dan tidak mengecek bentrok slug.
Kalau dua resource punya nama yang menghasilkan slug sama, `PUT` bisa menghasilkan slug duplikat.

### PATCH /api/resources/:id

Hanya mengubah `published` dan `private`. Dipakai untuk toggle cepat dari dashboard.

Body:

```json
{ "published": false }
```

### DELETE /api/resources/:id

Menghapus resource. Cascade: API key milik user tidak ikut terhapus, jadi key masih hidup.

---

## API Key

### GET /api/api-keys

Response:

```json
{
  "status": 200,
  "data": [
    {
      "id": "...",
      "name": "My laptop",
      "keyId": "a1b2c3d4e5f6a7b8",
      "lastUsedAt": null,
      "expiresAt": null,
      "createAt": "..."
    }
  ]
}
```

Field `key` tidak pernah dikembalikan di sini. Yang disimpan hanya hash-nya.

### POST /api/api-keys

Body:

```json
{ "name": "My laptop", "expiresAt": "2026-12-31T00:00:00.000Z" }
```

`expiresAt` boleh `null` untuk key yang tidak kedaluwarsa.

Response `201`. Di sini key **sekali saja** dikembalikan:

```json
{
  "status": 201,
  "data": {
    "id": "...",
    "name": "My laptop",
    "keyId": "a1b2c3d4e5f6a7b8",
    "expiresAt": null,
    "createAt": "...",
    "key": "jlv_a1b2c3d4e5f6a7b8_9f8e7d6c..."
  }
}
```

Kalau key hilang, tidak ada cara melihatnya lagi. User harus hapus dan buat baru.

Batas: 5 key per user. Field `key` sengaja dihapus dari `select` supaya tidak pernah bocor di response `GET`.

### DELETE /api/api-keys/:id

Menghapus key. Langsung berlaku, tidak ada soft delete.

---

## API Akun

### DELETE /api/account/delete

Body:

```json
{ "email": "user@example.com" }
```

Email harus sama dengan email session. Kalau tidak cocok, balas `400` dengan pesan verifikasi email.

Kalau cocok, `deleteRequestedAt` diisi dengan waktu sekarang. **Akun belum dihapus.** Yang terjadi:

- `deleteRequestedAt` terisi
- Response memberi tahu akan dihapus permanen dalam 3 hari

Tidak ada worker atau cron yang benar-benar menghapus otomatis. Penghapusan harus dilakukan manual oleh admin lewat `PATCH /api/admin/users` dengan `action: "force-delete"`.

### POST /api/account/cancel-delete

Kosongkan `deleteRequestedAt`, sehingga pengajuan dibatalkan. Tidak butuh body.

---

## API Admin

Semua butuh session dengan `role === "admin"`. Kalau bukan, balas `403`.

### GET /api/admin/users

Response:

```json
{
  "users": [
    {
      "id": "...",
      "name": "Revan",
      "username": "revan",
      "email": "revan@example.com",
      "role": "user",
      "maxResource": 5,
      "deleteRequestedAt": null,
      "createdAt": "...",
      "_count": { "resources": 3 }
    }
  ]
}
```

Urutannya dari user dengan resource terbanyak.

### PATCH /api/admin/users

Satu endpoint untuk semua aksi admin. Field yang tidak dikirim tidak berubah.

| Field | Nilai | Fungsi |
|-------|-------|--------|
| `userId` | wajib | Target user |
| `role` | `admin` atau `user` | Ubah role |
| `maxResource` | integer >= 0 | Ubah kuota resource |
| `action` | `cancel-delete` | Batalkan pengajuan hapus akun |
| `action` | `force-delete` | Hapus user beserta semua datanya |

Pengaman yang sudah ada:

- Admin tidak bisa mencabut role adminnya sendiri.
- Admin tidak bisa menghapus akunnya sendiri dari panel ini.

`action: "force-delete"` menghapus user permanen. Session, resource, dan API key ikut terhapus karena cascade. Tidak ada konfirmasi kedua di server.

