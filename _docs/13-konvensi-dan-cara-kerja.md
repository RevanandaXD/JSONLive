# 13. Konvensi dan Cara Kerja

## Aturan Dasar

| Aturan | Kenapa |
|--------|--------|
| Selalu pakai `@/` untuk import | Alias di `tsconfig.json`, path relatif mudah rusak saat file dipindah |
| Bahasa kode dan UI dalam bahasa Inggris | Konsisten dengan kode yang sudah ada |
| Komentar dalam bahasa Inggris | Sama dengan alasan di atas |
| Tanpa emoji di kode | Tidak profesional dan menambah noise |
| Angka batas hanya di `src/lib/config.ts` | Supaya semua batas kelihatan di satu tempat |
| Server component kalau tidak perlu interaksi | Mengurangi JavaScript yang dikirim ke browser |
| Query database hanya di `src/lib/` dan `app/api/` | Menjaga logika akses data tetap terpusat |

## Format Kode

Format yang dipakai: dua spasi untuk indent, double quote untuk string, semicolon di akhir baris.

Ikuti default ESLint yang sudah ada di `eslint.config.mjs`. Kalau lint complain, perbaiki kodenya, jangan mematikan aturannya.

Tidak ada tool formatter dan type-checker khusus di project ini, jadi andalkan `pnpm lint` dan `pnpm build` sebagai penaga.

## Nama

| Jenis | Pola | Contoh |
|-------|------|--------|
| Komponen | PascalCase | `ResourceCard.tsx` |
| File lain | camelCase | `rate-limit.ts` |
| Route segment | huruf kecil | `app/dashboard/new/page.tsx` |
| Hook | `use` di depan | `useApiKeys.tsx` |
| Handler | Method HTTP uppercase | `export async function GET()` |
| Tipe | PascalCase | `interface Resource` |
| Konstanta | SCREAMING_SNAKE | `MAX_JSON_SIZE` |

Route handler wajib nama method HTTP. `export default` tidak dipakai di folder `route.ts`.

## Format Response

Dua pola yang berbeda, dan tidak boleh dicampur dalam satu kelompok.

```text
Endpoint dashboard  { "status": 200, "data": ... }
                     error: { "error": "..." }

Endpoint admin      { "users": [...] }  atau  { "user": {...} }
                     error: { "error": "..." }

Endpoint publik     JSON mentah, sama persis dengan kolom data
                     error: { "error": "..." }
```

Endpoint publik sengaja mengembalikan JSON mentah supaya `fetch()` di frontend tidak perlu membongkar wrapper.

## Menambah Endpoint Baru

```text
1. Tentukan dulu kelompoknya: dashboard, admin, atau publik
2. Buat file di app/api/<path>/route.ts
3. Tulis handler dengan nama method HTTP
4. Kalau endpoint dashboard: cek session, lalu cek kepemilikan
5. Kalau endpoint publik: pakai helper rate limit yang sudah ada
6. Pakai corsHeaders kalau endpoint publik
7. Kembalikan NextResponse.json()
8. Tambahkan baris baru di src/lib/docs.ts kalau endpoint ini untuk user
9. Test manual dengan curl
10. Update _docs/05-api-internal.md untuk endpoint internal,
    atau _docs/06-api-publik.md untuk endpoint publik
```

Helper rate limit yang sudah ada di kedua route publik:

```ts
const limited = applyReadLimit(request);   // GET
const limited = applyWriteLimit(request);  // POST, PUT, PATCH, DELETE
if (limited) return limited;
```

Helper ini mengembalikan `NextResponse` kalau sudah habis, atau `null` kalau aman. Selalu cek sebelum lanjut.

## Menambah Halaman Baru

```text
1. Buat folder di app/<nama-route>/
2. Buat page.tsx
3. Tentukan client atau server component
4. Kalau butuh session, sudah tercakup proxy.ts
   kalau path-nya baru, tambahkan ke PROTECTED_PREFIXES dan config.matcher
5. Server component untuk halaman baca data
6. Client component plus hooks untuk halaman interaktif
7. Tambahkan menu di components/layout/DashboardNav.tsx
8. Update _docs/10-halaman-dan-komponen.md
```

## Menambah Kolom Database

```text
1. Ubah prisma/schema.prisma
2. Kalau kolomnya di User, daftarkan juga di additionalFields
   pada src/lib/auth.ts
3. pnpm prisma migrate dev --name nama_perubahan
4. Cek semua tempat yang pakai kolom itu
5. Update _docs/04-model-data.md
```

Jangan lupa langkah 2. Kolom User yang tidak terdaftar di `additionalFields` tidak akan muncul di `session.user`, jadi `proxy.ts` dan route admin tidak bisa membacanya.

## Menambah Rate Limit atau Batas

```text
1. Tambah atau ubah angka di src/lib/config.ts
2. Kalau batas baru, pakai di route yang relevan
3. Kalau batas per user, pastikan kolomnya sudah ada dan dipakai
4. Update _docs/09-batas-dan-keamanan.md
```

## Test

Test sekarang hanya menutup helper murni, bukan route atau database.

```text
Layak di-test tanpa mock:
  formatBytes, timeAgo, slugify
  describeKeyUsage, displayValue, isEmailConfirmed
  parseApiKey, hashSecret, toComparisonId
  nextId
```

Belum di-test, dan ini sudah jadi celah:

```text
app/api/resources/route.ts
app/api/api-keys/route.ts
app/api/admin/users/route.ts
app/api/[username]/[resource]/route.ts
app/api/[username]/[resource]/[id]/route.ts
proxy.ts
```

Fungsi di `src/lib/api-key.ts` dan helper `nextId` di route publik adalah kandidat paling baik untuk test berikutnya, karena murni dan tidak butuh database.

Jangan lupa: file test baru harus ditambahkan eksplisit ke script `test` di `package.json`.

## Format Commit

Sudah dipakai di riwayat repo:

```text
feat:  menambah fitur
fix:   memperbaiki bug
refactor: mengubah struktur tanpa mengubah fungsi
docs:  hanya dokumentasi
```

Contoh dari repo:

```text
feat: add API-KEY for users who want using operation CRUD on it
fix: switch middleware to proxy
refactor some file for easy maintance
```

 Ikuti pola `feat:` untuk perubahan yang menambah perilaku.

## Sebelum Push

```text
1. pnpm lint        tidak ada error
2. pnpm test        semua lolos
3. pnpm run build   berhasil
4. Kalau ada perubahan API, update _docs/05-api-internal.md dan _docs/06-api-publik.md
5. Kalau ada perubahan struktur, update _docs/03-stack-dan-struktur-folder.md
6. Kalau ada perubahan aturan, update _docs yang relevan
7. Kalau ada perubahan database, sertakan migration di commit
8. Jangan commit .env
```

## Kalau Sendiri Lupa Project

Semua jawaban ada di folder `_docs`. Mulai dari `_docs/README.md`, lalu ikut tabel "Baca Sesuai Kebutuhan".

Tiga perintah pertama yang hampir selalu menjawab banyak pertanyaan:

```bash
pnpm run build     # compile error dan type error muncul di sini
pnpm lint          # masalah kode yang tidak ketahuan compiler
pnpm prisma studio # lihat data yang sebenarnya ada di database
```

## Kesalahan yang Sudah Pernah Terjadi

| Kesalahan | Kenapa terjadi | Pencegahan |
|-----------|---------------|------------|
| Migration tidak ikut ter-commit | Lupa `git add prisma/migrations` | Cek `git status` sebelum commit |
| Prisma client stale | Lupa `pnpm prisma generate` | Jalankan ulang kalau ada error tipe |
| Middleware tidak jalan | Next.js 16 pakai `proxy.ts`, bukan `middleware.ts` | Sudah diperbaiki di commit `fix: switch middleware to proxy` |
| `middleware.ts` tetap ada setelah rename | Tidak dihapus manual | Pastikan hanya ada `proxy.ts` |
| Session role tidak terbaca | Kolom User tidak terdaftar di `additionalFields` | Cek `src/lib/auth.ts` |
| Slug bentrok | Nama berbeda tapi hasil slug sama | Uji slug sebelum create |
