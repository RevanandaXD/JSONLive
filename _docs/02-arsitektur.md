# 02. Arsitektur

## Gambaran Besar

```text
INTERNET
   |
   v
Cloudflare Tunnel  (HTTPS, hide IP mini PC)
   |
   v
Docker di Mini PC
   |
   +-- jsonlive  :4500 -> Next.js :3000
   |       |
   |       v
   +-- postgres  :5432  (tidak dibuka ke host)
   |       |
   |       v
   +-- volume pgdata  (data JSON user)
```

Database tidak pernah dibuka ke internet. Hanya container `jsonlive` yang bisa bicara ke `postgres`.

## Dua Macam Endpoint

Penting dipahami lebih dulu. Server ini punya dua kelompok endpoint yang beda aturan.

```text
/                       Halaman web (UI)

/api/resources          API dashboard  -> butuh session cookie
/api/api-keys           API dashboard  -> butuh session cookie
/api/account/*          API dashboard  -> butuh session cookie
/api/admin/users        API admin      -> butuh session + role admin
/api/auth/*             milik better-auth

/api/:username/:resource          API data publik
/api/:username/:resource/:id      API data publik
```

| | API dashboard | API data publik |
|---|---|---|
| Dipakai frontend | Ya | Tidak |
| Dipakai aplikasi luar | Tidak | Ya |
| Wajib login | Ya | Tidak (kecuali tulis) |
| Wajib API key | Tidak | Ya, untuk method tulis |
| Rate limit | Tidak | Ya |
| CORS | Tidak | Ya, `*` |
| Prefix URL | `/api/...` | `/api/<username>/<slug>` |

## Lapisan Aplikasi

```text
+-------------------------------------------------+
| Browser                                         |
|   app/         halaman dan server component      |
|   components/  komponen UI                       |
|   hooks/       pembungkus TanStack Query          |
|   stores/      Zustand untuk state UI            |
+------------------+------------------------------+
                   | fetch dari browser
                   v
+-------------------------------------------------+
| proxy.ts        guard route: login dan role      |
+------------------+------------------------------+
                   |
     +-------------+-------------+
     |                           |
     v                           v
+-------------------+   +---------------------+
| Route Handler     |   | Server Component    |
| app/api/**        |   | app/**/page.tsx     |
| + rate limit      |   | baca database       |
| + validasi        |   | langsung            |
+---------+---------+   +----------+----------+
          |                        |
          v                        v
+-------------------+   +---------------------+
| src/lib           |   | prisma/schema.prisma|
|   prisma.ts       |-->| PostgreSQL          |
|   auth.ts         |   +---------------------+
|   api-key.ts      |
|   rate-limit.ts   |
|   config.ts       |
+-------------------+
```

## Alur Request: Public GET

Contoh: `GET /api/revan/users`

```text
1. Client kirim request
2. app/api/[username]/[resource]/route.ts:58  GET()
3. Rate limit dicek lebih dulu            -> 429 kalau habis
4. Cari User by username                 -> 404 kalau tidak ada
5. Cari Resource by userId + slug        -> 404 kalau tidak ada / tidak published
6. Kalau resource private, cek session   -> 401 kalau bukan pemilik
7. Balikin kolom `data` apa adanya dengan header CORS
```

File: `app/api/[username]/[resource]/route.ts`

Yang penting: **response body adalah `data` mentah, bukan dibungkus**. Jadi `fetch()` di frontend langsung dapat array/objek yang sama persis dengan yang disimpan user.

## Alur Request: Public POST

Contoh: `POST /api/revan/users`

```text
1. Client kirim body + header x-api-key
2. Rate limit tulis dicek                -> 429 kalau habis
3. Cari User by username                 -> 404 kalau tidak ada
4. Cari Resource by userId + slug        -> 404 kalau tidak ada / tidak published
5. authenticateApiKey()                 -> 401 kalau key salah
6. Pastikan key itu milik pemilik resource -> 401 kalau beda user
7. Pastikan `data` adalah array          -> 400 kalau bukan
8. Pastikan body adalah object           -> 400 kalau bukan
9. Kalau body tidak punya `id`, buat id baru
10. Simpan array baru ke database
11. Balikin item yang dibuat, status 201
```

File: `app/api/[username]/[resource]/route.ts`

## Alur Request: Create dari Dashboard

Contoh: user klik "Create Resource"

```text
1. Halaman app/dashboard/new/page.tsx
2. User isi name + JSON di FormatJSON editor
3. Validasi JSON di sisi browser
4. hooks/useCreateResource.tsx  mutation
5. src/lib/api.ts  POST /api/resources
6. app/api/resources/route.ts  POST()
7. Cek session                          -> 401 kalau belum login
8. Cek name + data ada                  -> 400 kalau tidak
9. Cek ukuran JSON <= 5 MB              -> 400 kalau lewat
10. Cek jumlah resource < 5              -> 400 kalau penuh
11. Buat slug dari name, cek slug unik   -> 409 kalau bentrok
12. Simpan ke database                   -> 201
13. Query di-refresh, dashboard update
```

Detail lengkap di [07-alur-data-resource.md](07-alur-data-resource.md).

## Guard Route: proxy.ts

Next.js 16 menamai middleware sebagai `proxy.ts`. File ini jalan **sebelum** halaman dirender.

| Path | Tanpa session | Session role user | Session role admin |
|------|---------------|------------------|--------------------|
| `/dashboard` | redirect `/login` | boleh | redirect `/admin` |
| `/resources/*` | redirect `/login` | boleh | boleh |
| `/settings` | redirect `/login` | boleh | boleh |
| `/admin/*` | redirect `/login` | redirect `/dashboard` | boleh |
| `/login`, `/register` | boleh | redirect `/dashboard` | redirect `/admin` |

Perhatikan: ini hanya guard di sisi browser. Route handler `/api/*` tetap wajib cek session sendiri, karena bisa dipanggil langsung tanpa lewat halaman.

## Keputusan Penting

### Satu aplikasi Next.js, tanpa Express

Frontend, API, dan server logic dalam satu proses. Lebih ringan untuk mini PC dan lebih mudah di-deploy.

### Data JSON disimpan apa adanya di kolom JSONB

Tidak ada skema per resource. User bebas menyimpan bentuk JSON apa pun. Ini yang membuat produk ini sederhana, tapi juga artinya validasi struktur hanya bisa dilakukan di level aplikasi, bukan database.

### Rate limit in-memory

`src/lib/rate-limit.ts` menyimpan counter di `Map` pada RAM proses.

Konsekuensi yang harus diketahui:

- Counter hilang setiap restart server.
- Kalau nanti jalan lebih dari satu instance, setiap instance punya counter sendiri.
- Kalau sudah butuh scale, pindah ke Redis atau rate limit di Cloudflare.

### Penulisan collection adalah read-modify-write

`POST`, `PUT`, `PATCH`, `DELETE` pada collection membaca seluruh array, mengubahnya di memory, lalu menulis ulang seluruh array. Jadi:

- Singkat untuk data kecil, dan ini asumsi desainnya.
- Riskanya pada data besar: dua request bersamaan bisa saling menimpa.
- POST pada collection besar akan semakin mahal seiring data bertambah.

## Diagram Modul src/lib

| File | Tugas |
|------|-------|
| `prisma.ts` | Prisma client singleton, pakai adapter pg |
| `auth.ts` | Konfigurasi better-auth di server |
| `auth-client.ts` | Klien better-auth di browser |
| `api-key.ts` | Generate, hash, dan verifikasi API key |
| `rate-limit.ts` | Rate limit in-memory, ambil IP client |
| `config.ts` | Semua angka batas dan URL publik |
| `format.ts` | Helper tampilan: ukuran bytes, waktu relatif, slug |
| `settings.ts` | Helper khusus halaman Settings |
| `docs.ts` | Isi halaman dokumentasi API publik |
| `api.ts` | Fetch wrapper tipis untuk browser |
