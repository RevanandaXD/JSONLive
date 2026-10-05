# 08. Autentikasi dan Otorisasi

Project pakai better-auth. Dokumen ini menjelaskan konfigurasi yang dipakai dan aturan aksesnya.

## Dua Jenis Keluar Masuk

```text
Session cookie  -> untuk dashboard,Ribbon halaman web
API key         -> untuk menulis data dari aplikasi luar
```

Keduanya tidak bisa saling menggantikan. Session tidak berlaku untuk endpoint publik, dan API key tidak berlaku untuk dashboard.

## Konfigurasi better-auth

File: `src/lib/auth.ts`

```text
baseURL         BETTER_AUTH_URL
database        prismaAdapter, provider postgresql
emailAndPassword aktif
rateLimit       aktif, window 60 detik, max 5
                /sign-up/email dibatasi 3 per 60 detik
```

Kolom User tambahan yang didaftarkan lewat `additionalFields`:

| Field | Tipe | Default | Bisa diisi user |
|-------|------|---------|-----------------|
| `username` | string | tidak ada | Ya |
| `role` | string | `user` | Tidak |
| `maxResource` | number | 5 | Tidak |
| `deleteRequestedAt` | date | tidak ada | Tidak |

`input: false` berarti field tidak diterima dari request signup, sehingga user tidak bisa memberi role admin sendiri.

## Rate Limit Auth

better-auth punya rate limit sendiri, terpisah dari rate limit JSONLive.

| Endpoint | Batas |
|----------|-------|
| Semua endpoint auth | 5 per 60 detik |
| `/sign-up/email` | 3 per 60 detik |

Ini stateless, jadi batasnya per instance server.

## Dua Role

| Role | Akses |
|------|-------|
| `user` | Dashboard sendiri, resource sendiri, API key sendiri |
| `admin` | Panel admin, kelola semua user |

Admin punya behavior tambahan:

- `/dashboard` untuk admin di-redirect ke `/admin`
- `/admin` untuk user biasa di-redirect ke `/dashboard`

Role tidak bisa diubah user sendiri. Hanya admin yang bisa, lewat `PATCH /api/admin/users`.

## Guard Route

File: `proxy.ts`. Next.js 16 memakai nama `proxy.ts`, bukan `middleware.ts`.

`config.matcher` membatasi file ini hanya jalan di path ini:

```text
/dashboard/:path*
/settings/:path*
/resources/:path*
/admin/:path*
/login
/register
```

Aturannya:

```text
Path terlindungi dan tidak punya session -> redirect /login
  dengan ?callbackURL=<path aslinya>

Path /admin dan role bukan admin          -> redirect /dashboard
Path /dashboard dan role admin            -> redirect /admin
Path login/register dan punya session    -> redirect ke halaman sesuai role
```

## Otorisasi API Dashboard

Guard route tidak cukup, karena endpoint bisa dipanggil langsung. Tiap route handler wajib cek sendiri.

Pola yang dipakai:

```ts
const session = await auth.api.getSession({ headers: await headers() });
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```

Untuk resource milik sendiri, selalu cek dua hal:

```ts
if (response.userId !== session.user.id) {
  return NextResponse.json({ error: "Forbidden: You do not own this resource" }, { status: 403 });
}
```

Perbedaan kode:

| Code | Arti |
|------|------|
| 401 | Tidak tahu siapa pemanggil |
| 403 | Tahu pemanggil, tapi tidak berhak |

## Otorisasi API Admin

File: `app/api/admin/users/route.ts`, helper `requireAdmin()`.

```text
1. Cek session                          -> 401 kalau tidak login
2. Cek session.user.role === "admin"    -> 403 kalau bukan admin
```

Pengaman tambahan di level bisnis:

- Admin tidak bisa mengubah role adminnya sendiri menjadi `user`
- Admin tidak bisa `force-delete` akunnya sendiri

## Format API Key

File: `src/lib/api-key.ts`

```text
jlv_<keyId>_<secret>
```

| Bagian | Panjang | Arti |
|--------|---------|------|
| `jlv_` | 4 | Prefix, dipakai untuk mengenali key JSONLive |
| `keyId` | 16 hex | ID publik, disimpan plaintext, dicari lewat `findUnique` |
| `secret` | 48 hex | Bagian rahasia, disimpan sebagai SHA-256 |

Contoh:

```text
jlv_a1b2c3d4e5f6a7b8_9f8e7d6c5b4a39281706f5e4d3c2b1a09f8e7d6c5b4a392817
```

Alasan memakai dua bagian: `keyId` bisa di-index database sehingga tidak perlu compare seluruh tabel, sedangkan `secret` cukup dihash lalu dibandingkan.

## Verifikasi API Key

`authenticateApiKey(headers)` di `src/lib/api-key.ts`:

```text
1. Ambil key dari Authorization: Bearer, kalau tidak ada dari x-api-key
2. Parse, harus mulai dengan jlv_ dan punya separator _
3. prisma.apiKey.findUnique({ keyId })
4. Bandingkan hashSecret(secret) dengan keyHash  -> null kalau beda
5. Cek expiresAt, kalau lewat jangan dipakai
6. Update lastUsedAt, kalau gagal diabaikan saja
7. Return userId dari key itu
```

Kalau salah satu langkah gagal, return `null`. Route tulis membandingkan `userId` hasil auth dengan `userId` pemilik resource.

## Private Resource

Resource dengan `private = true`:

| Method | Siapa boleh |
|--------|-------------|
| GET | Hanya pemilik yang punya session |
| POST, PUT, PATCH, DELETE | Pemegang API key milik pemilik |

Resource privat yang tidak dipublish tidak bisa diakses apa pun, karena route publik selalu menyaring `published: true`.

## Penghapusan Akun

Alurnya dua tahap, dan tahap kedua belum ada worker-nya.

```text
1. User buka Settings, isi emailnya, klik hapus akun
2. DELETE /api/account/delete
   - email harus cocok dengan session
   - deleteRequestedAt diisi dengan waktu sekarang
   - response: akun akan dihapus dalam 3 hari
3. User berubah pikiran
   - POST /api/account/cancel-delete
   - deleteRequestedAt dikosongkan
4. Setelah 3 hari
   - belum ada apa-apa. Tidak ada cron, tidak ada worker
   - admin harus menghapus manual lewat panel admin
```

Jadi `deleteRequestedAt` sekarang hanya penanda, bukan pemicu penghapusan.

## Yang Belum Ada

- Verifikasi email. Field `emailVerified` ada tapi tidak dipakai alur UI, dan `verification` table belum dipakai.
- Reset password. better-auth dukung, tapi belum ada halaman dan endpoint-nya.
- Login social. `src/lib/auth.ts` sudah punya blok komentar untuk GitHub, belum diaktifkan.
- Ganti password dari halaman Settings.
- Logout dari server. `authClient` mengekspos `signOut`, tapi belum dipakai di UI.

## Catatan Keamanan

- `role`, `maxResource`, dan `deleteRequestedAt` selalu `input: false` di better-auth. Jangan diubah jadi `true`.
- API key hanya dikirim sekali, saat dibuat. Kalau user menutup modal tanpa menyalin, key hilang.
- Password user tidak pernah menyentuh kode JSONLive. Disimpan di tabel `account` milik better-auth sebagai hash.
