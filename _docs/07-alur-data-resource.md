# 07. Alur Data Resource

Dokumen ini menelusuri satu resource dari dibuat sampai dihapus, lengkap dengan file yang mengerjakan.

## Membuat Resource

### Sisi browser

```text
app/dashboard/new/page.tsx
  |
  +-- user isi name
  +-- user isi JSON di FormatJSON
  |     |
  |     +-- app/dashboard/new/format.tsx
  |           textarea dengan auto-pair { } [ ] " dan indent Tab
  |
  +-- validasi JSON dengan JSON.parse
  +-- hitung slug untuk preview URL
  |
  v
hooks/useCreateResource.tsx
  mutation POST /api/resources
  |
  v
src/lib/api.ts
  request wrapper, json header, lempar Error kalau response tidak ok
```

Kalau sukses, query `["resources"]` di-invalidate supaya `useResource` mengambil data baru.

### Sisi server

File: `app/api/resources/route.ts`, method `POST`.

```text
1. auth.api.getSession()                  -> 401 kalau tidak login
2. Destructure body: name, data, published, private
3. name dan data wajib ada                -> 400 kalau tidak
4. Hitung ukuran JSON dengan TextEncoder  -> 400 kalau > 5 MB
5. prisma.resource.count({ userId })      -> 400 kalau sudah 5
6. Slug dibuat dari name dengan 3 langkah regex
7. Cek slug unik per user                 -> 409 kalau bentrok
8. prisma.resource.create()               -> 201
```

Catatan penting: pengecekan urutan membuat validasi slug terjadi **setelah** pengecekan kuota. Kalau user sudah penuh, slug bentrok tidak akan pernah dilaporkan.

## Menampilkan Resource di Dashboard

`app/dashboard/page.tsx` adalah server component yang membaca session di server, lalu `useResource` mengambil daftar lewat API.

Isi halaman:

- URL publik setiap resource, dibangun dari `PUBLIC_BASE_URL` + username + slug
- Nama, ukuran JSON, waktu relatif update
- Sakelar publish dan private
- Tombol copy URL, edit, hapus
- Bar indikator pemakaian storage, dihitung dari `STORAGE_LIMIT`

## Membaca Data Publik

File: `app/api/[username]/[resource]/route.ts`, method `GET`.

```text
1. Rate limit baca, kunci = IP client     -> 429
2. prisma.user.findUnique({ username })   -> 404 kalau username tidak ada
3. prisma.resource.findFirst({
     userId,
     slug,
     published: true
   })                                     -> 404 kalau tidak ketemu
4. Kalau found.private, cek session
     session.user.id harus sama dengan
     found.userId                          -> 401 kalau tidak
5. Response body = found.data, apa adanya
```

Dua query terpisah, bukan satu join. Ini karena `username` ada di tabel User sedangkan `slug` ada di tabel Resource.

## Menulis Data Publik

Hanya berlaku kalau `data` berupa array. Object tidak bisa di-`POST` atau di-`PUT`.

File: `app/api/[username]/[resource]/route.ts`

### POST, menambah item

```text
1. Rate limit tulis                      -> 429
2. Cari user lalu resource, sama seperti GET
3. authenticateApiKey(headers)            -> 401 kalau key tidak valid
4. key harus milik pemilik resource      -> 401 kalau beda user
5. Array.isArray(found.data) harus true  -> 400 kalau bukan
6. request.json()                        -> 400 kalau body rusak
7. Body harus object, bukan array        -> 400 kalau bukan
8. Kalau tidak ada field id, generate id
9. prisma.resource.update() dengan array baru
10. Response 201 = item yang dibuat
```

### Generasi id

```text
Ambil semua id numerik dari item yang ada.
Kalau ada: id baru = max + 1
Kalau tidak ada: id baru = crypto.randomUUID()
```

Kalau body sudah menyertakan `id`, itu yang dipakai, dan server tidak menimpanya.

### PUT, mengganti seluruh collection

```text
1. Rate limit tulis
2. Cari user lalu resource
3. Authenticate API key, harus milik pemilik
4. Body harus array                       -> 400 kalau bukan
5. Tulis ulang seluruh data
6. Response 200 dengan array hasil
```

## Mengubah Satu Item

File: `app/api/[username]/[resource]/[id]/route.ts`

Pencarian item selalu lewat helper `findItem`:

```text
1. Array.isArray(found.data)              -> 400 kalau bukan array
2. Ubah `:id` dari URL menjadi number kalau nilainya memang angka, selain itu dibiarkan string
3. Cari item pertama yang .id sama persis
4. Belum ketemu                             -> 404
```

Perbedaan tiga method:

| Method | Efek |
|--------|------|
| GET | Kembalikan item, tidak mengubah apa pun |
| PUT | Ganti total. Field yang tidak dikirim hilang. `id` lama dipertahankan kalau body tidak kirim `id` |
| PATCH | Merge. Hanya key yang dikirim berubah |
| DELETE | `splice` item dari array, lalu tulis ulang |

Semua menulis ulang seluruh array ke database.

## Mengganti Nama Resource

`PUT /api/resources/:id` mengirim ulang `name` dan `data` dari form edit.

Di server, slug dihitung ulang dari `name` baru. Jadi kalau user mengganti nama dari `Users` menjadi `Team Members`, URL berubah dari `/revan/users` jadi `/revan/team-members`.

Dua hal yang tidak dicek di jalur ini:

- Batas ukuran JSON tidak diperiksa, jadi `PUT` dari dashboard bisa menyimpan JSON lebih dari 5 MB.
- Bentrok slug tidak diperiksa, jadi dua resource bisa berakhir dengan slug sama.

## Toggle Publish dan Private

`PATCH /api/resources/:id` hanya menerima dua field:

```json
{ "published": false, "private": true }
```

Field yang `undefined` tidak ikut di-update. Ini pola yang dipakai di beberapa route, dan cukup efisien untuk toggle.

## Menghapus

`DELETE /api/resources/:id`. Setelah dihapus, URL publik langsung balas `404` karena `findFirst` tidak menemukan resource lagi.

Resource yang dihapus tidak masuk sampah. Tidak ada soft delete.

## Ringkasan Repository

| Aksi | Query database |
|------|----------------|
| Create resource | 1 count + 1 findFirst + 1 create |
| List resource | 1 findMany |
| Update resource | 1 findUnique + 1 update |
| Public GET | 1 findUnique user + 1 findFirst resource |
| Public POST | 2 find + 1 update |
| Public item write | 2 find + 1 update |

Pola public API selalu dua query: cari user, lalu cari resource. Kalau performansi jadi masalah, ganti dengan satu `findFirst` langsung di tabel Resource dengan relasi ke User.

## Yang Belum Ada

- Tidak ada riwayat versi. Simpan ulang menimpa data lama.
- Tidak ada undo.
- Tidak ada log perubahan data.
- Tidak ada pagination di halaman `/public`. Query-nya `take: 100`, jadi kalau data bertambah, 100 endpoint terbaru saja yang tampil.
