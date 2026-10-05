# 04. Model Data

Sumber kebenaran: `prisma/schema.prisma`. Dokumen ini menjelaskan artinya, bukan mengulang baris kodenya.

## Gambaran Relasi

```text
User 1 --- * Session
User 1 --- * Account
User 1 --- * Resource
User 1 --- * ApiKey

Session, Account, Verification  -> tabel milik better-auth
Resource                         -> inti produk
ApiKey                           -> token untuk menulis data
```

Semua relasi memakai `onDelete: Cascade`. Kalau user dihapus, session, resource, dan API key ikut terhapus.

## Tabel `user`

```text
User
|-- id                 uuid, primary key
|-- name               string, wajib
|-- email              string, unik
|-- emailVerified      boolean, default false
|-- role               string, "admin" atau "user"
|-- maxResource        int, default 5
|-- image              string, nullable
|-- username           string, unik, nullable
|-- deleteRequestedAt  datetime, nullable
|-- createdAt          datetime
`-- updatedAt          datetime
```

| Field | Penjelasan |
|-------|------------|
| `role` | Dua nilai saja: `admin` dan `user`. Diset manual oleh admin, tidak bisa diubah user sendiri |
| `username` | Dipakai di URL publik `/api/<username>/<slug>`. Wajib diisi agar endpoint publik berfungsi |
| `maxResource` | Kuota resource user. Diset admin lewat panel admin |
| `deleteRequestedAt` | Waktu user mengajukan hapus akun. Dipakai untuk memberi kesempatan batal |

Penting: kolom tambahan ini juga harus didaftarkan di `src/lib/auth.ts` pada bagian `user.additionalFields`.
Kalau menambah kolom di schema tapi lupa mendaftarkannya di situ, better-auth tidak akan membacanya, dan `session.user` tidak akan memuat field tersebut.

## Tabel `resource`

```text
Resource
|-- id         uuid, primary key
|-- userId     uuid, milik User
|-- name       string, nama tampilan, bebas
|-- slug       string, dipakai di URL
|-- data       json, isi JSON milik user
|-- private    boolean, default false
|-- published  boolean, default true
|-- createdAt  datetime
`-- updatedAt  datetime
```

### Slug

`slug` adalah bagian URL. Dibuat dari `name` dengan aturan:

```text
lowercase -> ganti semua karakter selain a-z0-9 dengan "-" -> buang "-" di awal dan akhir
```

Contoh:

| name | slug |
|------|------|
| `My Users` | `my-users` |
| `Products List` | `products-list` |
| `users.json` | `users-json` |
| `user   data!!! 2024` | `user-data-2024` |

Slug harus unik **per user**, bukan unik global. Jadi `revan/users` dan `budi/users` boleh sama-sama ada.

Kalau hasil slug kosong, misalnya `name` cuma `!!!`, hasilnya string kosong. Ini belum divalidasi di server.

### published

`published` adalah sakelar tampil atau tidaknya resource di endpoint publik.

- `false` -> `GET /api/<username>/<slug>` balas `404`
- Resource yang tidak dipublish juga tidak muncul di halaman `/public`

### private

`private` hanya berpengaruh pada method **GET**.

- `false` -> siapa saja boleh `GET`
- `true` -> hanya session pemilik yang boleh `GET`. Selain itu balas `401`

Untuk method tulis, penjagaannya berbeda: harus punya API key yang milik pemilik. Route tulis belum mengecek flag `private`, jadi private resource tetap bisa ditulis selama key benar. Ini keputusan yang bisa diubah nanti, catat di [14-status-dan-rencana.md](14-status-dan-rencana.md).

### Bentuk data

`data` menyimpan JSON apa pun tanpa skema:

- **Object**, misalnya `{"name": "Revan"}`. Bisa di-`GET`, tidak bisa di-`POST` atau `PUT` per item.
- **Array**, misalnya `[{"id": 1, ...}]`. Bisa di-`GET`, `POST`, `PUT`, dan route per item.

Halaman `/public` menandai object sebagai badge `Object` dan array sebagai badge `Collection`.

## Tabel `api_key`

```text
ApiKey
|-- id          uuid, primary key
|-- userId      uuid, milik User
|-- name        string, label dari user
|-- keyId       string, unik, bagian publik dari key
|-- keyHash     string, sha256 dari secret
|-- lastUsedAt  datetime, nullable
|-- expiresAt   datetime, nullable
`-- createAt    datetime
```

Perhatikan nama field-nya `createAt`, bukan `createdAt`. Ini beda dari tabel lain dan sering jadi sumber typo.

Yang disimpan hanya `keyHash`. Key aslinya tidak pernah disimpan, jadi tidak bisa ditampilkan ulang setelah dibuat. User harus menyalin saat membuat.

## Tabel Milik better-auth

| Tabel | Guna |
|-------|------|
| `session` | Session login. Ada `token`, `expiresAt`, `ipAddress`, `userAgent` |
| `account` | Kredensial. Untuk login email/password, password tersimpan di sini sebagai hash |
| `verification` | Token verifikasi, misalnya untuk verifikasi email. Belum dipakai di alur UI sekarang |

Tabel ini sebaiknya tidak diubah manual. Kalau butuh kolom tambahan, pakai mekanisme `additionalFields` di `src/lib/auth.ts`.
## Riwayat Migration

```text
20260910085211_init
20260911144057_better_auth
20260911160000_anonymous_resources
20260911170000_revert_anonymous_resources
20260918121329_add_published
20260921130525_add_private_endpoint
20260922164234_add
20260930114510_add_role_for_users
```

Perhatikan `anonymous_resources` langsung dibalik oleh `revert_anonymous_resources`. Riwayat dibiarkan, jangan dihapus, karena sudah pernah dipakai di database production.

## Cara Menambah Kolom atau Tabel

```bash
# 1. Ubah prisma/schema.prisma
# 2. Buat migration
pnpm prisma migrate dev --name nama_perubahan
# 3. Terapkan ke database
pnpm prisma migrate deploy
# 4. Generate ulang client
pnpm prisma generate
```

Kalau menambah kolom User, jangan lupa daftarkan juga di `additionalFields` `src/lib/auth.ts`.

`prisma.config.ts` menunjuk `prisma/schema.prisma`, folder `prisma/migrations`, dan command seed `npx tsx prisma/seed.ts`.
