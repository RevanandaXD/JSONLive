# 06. API Data Publik

Ini API yang dipakai aplikasi luar. Dipakai oleh frontend, mobile app, CI/CD, atau apa pun yang bisa `fetch()`.

Endpoint internal dashboard ada di [05-api-internal.md](05-api-internal.md).

## Bentuk URL

```text
/api/<username>/<slug>
```

`username` milik user, `slug` milik resource. Contoh dari data seed:

```bash
curl http://localhost:3000/api/revan/users
```

Perhatikan: `slug` bukan `name`. Name `My Users` punya slug `my-users`.

## Ringkasan Endpoint

| Method | Path | Auth | Rate limit |
|--------|------|------|------------|
| GET | `/api/:username/:resource` | Publik | 500 per menit |
| POST | `/api/:username/:resource` | API key pemilik | 100 per menit |
| PUT | `/api/:username/:resource` | API key pemilik | 100 per menit |
| OPTIONS | `/api/:username/:resource` | Tidak perlu | Tidak dihitung |
| GET | `/api/:username/:resource/:id` | Publik | 500 per menit |
| PUT | `/api/:username/:resource/:id` | API key pemilik | 100 per menit |
| PATCH | `/api/:username/:resource/:id` | API key pemilik | 100 per menit |
| DELETE | `/api/:username/:resource/:id` | API key pemilik | 100 per menit |
| OPTIONS | `/api/:username/:resource/:id` | Tidak perlu | Tidak dihitung |

## Dua Route Saja

Semua endpoint di atas dilayani dua file:

```text
app/api/[username]/[resource]/route.ts       collection
app/api/[username]/[resource]/[id]/route.ts  item
```

Jadi menambah atau mengubah endpoint publik hampir selalu berarti menyentuh dua file ini.

## Collection

### GET /api/:username/:resource

Tidak butuh API key. Mengembalikan kolom `data` mentah, tanpa dibungkus.

Kalau data berupa array, balannya array penuh. Kalau object, balannya object itu.

Kondisi gagal:

| Code | Kondisi |
|------|---------|
| 401 | Resource `private` dan pemanggil bukan pemilik |
| 404 | Username tidak ada, resource tidak ada, atau resource tidak `published` |
| 429 | Rate limit habis |

Contoh:

```bash
curl http://localhost:3000/api/revan/users
```

```javascript
const res = await fetch("http://localhost:3000/api/revan/users");
const users = await res.json();
```

### POST /api/:username/:resource

Menambah satu item ke array.

Syarat:

- `data` resource harus array, kalau tidak balas `400`
- Body harus satu object, kalau tidak balas `400`
- Wajib API key milik pemilik, kalau tidak balas `401`

Kalau body tidak punya field `id`, server membuatkannya:

- Kalau ada item dengan `id` numerik, id baru = id numerik terbesar + 1
- Kalau tidak ada `id` numerik sama sekali, id baru = UUID

Response `201` adalah item yang baru dibuat, termasuk `id` yang digenerate.

Contoh:

```bash
curl -X POST http://localhost:3000/api/revan/users \
  -H "Content-Type: application/json" \
  -H "x-api-key: jlv_a1b2c3d4e5f6a7b8_secret" \
  -d '{ "name": "Siti", "role": "QA" }'
```

### PUT /api/:username/:resource

Mengganti seluruh isi collection.

- Body harus array, kalau tidak balas `400`
- Balas `200` dengan array hasil

Berguna untuk reset data demo atau mengisi ulang fixture.

### OPTIONS

Selalu balas `204` dengan header CORS, tanpa cek rate limit dan tanpa cek auth. Ini standar preflight browser.

## Item

Path: `/api/:username/:resource/:id`

Syarat umum:

- `data` harus array. Kalau bukan, balas `400`
- Harus ada item dengan `id` sama persis dengan `:id`. Kalau tidak, balas `404`

Perbandingan `id` bergantung pada tipe datanya. `Number("1")` jadi `1`, sehingga `/users/1` cocok dengan item yang `id`-nya angka `1`.
Kalau `id` di URL tidak bisa jadi angka, dicocokkan sebagai string.

### GET /api/:username/:resource/:id

Sama seperti collection GET, tapi mengembalikan satu item. Resource privat tetap butuh session pemilik.

### PUT /api/:username/:resource/:id

Mengganti satu item. Kalau body tidak menyertakan `id`, id lama dipertahankan.

Perhatikan: field yang tidak ada di body akan **hilang**, karena ini penggantian total, bukan merge.

```bash
curl -X PUT http://localhost:3000/api/revan/users/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: jlv_a1b2c3d4e5f6a7b8_secret" \
  -d '{ "id": 1, "name": "Revan" }'
```

Field `role` hilang di sini, karena tidak ikut dikirim.

### PATCH /api/:username/:resource/:id

Merge. Hanya key yang dikirim yang berubah, sisanya tetap.

```json
{ "role": "Senior Developer" }
```

Kalau body menyertakan `id` yang berbeda, `id` akan berubah juga, karena `PATCH` di sini memperlakukan `id` seperti field biasa.

### DELETE /api/:username/:resource/:id

Menghapus item dari array. Response:

```json
{ "success": true }
```

## Cara Kirim API Key

Dua cara, keduanya didukung:

```http
x-api-key: jlv_a1b2c3d4e5f6a7b8_secret
```

```http
Authorization: Bearer jlv_a1b2c3d4e5f6a7b8_secret
```

Kalau keduanya ada, `Authorization` yang dibaca duluan.

Format dan cara verifikasinya ada di [08-autentikasi-dan-otorisasi.md](08-autentikasi-dan-otorisasi.md).

## CORS

Semua endpoint publik mengirim header ini:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, x-api-key
```

Endpoint dashboard tidak mengirim header CORS. Itu benar, karena dipakai dari origin yang sama.

## Bentuk Response

Penting: format response tidak seragam, dan itu disengaja.

| Kelompok | Bentuk |
|----------|--------|
| Endpoint dashboard | `{ "status": 200, "data": ... }`, error pakai `{ "error": "..." }` |
| Endpoint admin | `{ "users": [...] }` atau `{ "user": {...} }` |
| Endpoint publik GET | JSON mentah, sama persis dengan `data` |
| Endpoint publik tulis | JSON hasil operasi, misal item dibuat atau `{ "success": true }` |

Endpoint publik sengaja mengembalikan JSON mentah supaya `fetch()` di frontend tidak perlu membongkar wrapper.

## Catatan Perilaku

- Hanya resource `published` yang bisa diakses. Selain itu balas `404`, bukan `403`.
- Resource `private` hanya memblokir GET. Method tulis tetap jalan kalau API key benar.
- Method tulis tidak mengecek batas ukuran JSON, berbeda dari `POST /api/resources` di dashboard.
- Penulisan collection adalah read-modify-write: seluruh array dibaca, diubah, lalu ditulis ulang. Dua request bersamaan bisa saling menimpa.
- `POST` hanya jalan pada resource berbentuk array.
- Route per item hanya jalan pada resource berbentuk array yang punya field `id`.

## Status Code

| Code | Arti |
|------|------|
| 200 | Berhasil |
| 201 | Item dibuat |
| 204 | Preflight OPTIONS berhasil |
| 400 | Body rusak, atau bentuk JSON tidak sesuai aturan route |
| 401 | Belum login, API key salah, atau GET pada resource privat |
| 403 | Sumber daya ada tapi bukan milik user |
| 404 | Username, resource, atau id tidak ada |
| 409 | Slug bentrok saat create resource |
| 429 | Rate limit habis, lihat header `Retry-After` |
| 500 | Error server |

## Kalau Butuh Dokumentasi untuk User Akhir

Halaman `/docs` di aplikasi memakai isi dari `src/lib/docs.ts`, bukan dokumen ini.
Kalau aturan endpoint berubah, update kedua tempat itu dan `src/lib/docs.ts`.
