# 14. Status dan Rencana

Dokumen ini catatan jujur tentang apa yang sudah jadi dan apa yang belum. Kesimpulannya berasal dari pembacaan kode, bukan dari eksekusi atau pengujian.

## Sudah Jadi

| Fitur | Status | Lokasi |
|-------|--------|--------|
| Landing page | Selesai | `app/page.tsx`, `components/marketing/` |
| Registrasi dan login | Selesai | better-auth, `app/login`, `app/register` |
| Logout | Sebagian | `signOut` tersedia di client, belum dipakai di UI |
| Dashboard daftar resource | Selesai | `app/dashboard/page.tsx` |
| Create resource | Selesai | `app/dashboard/new/page.tsx` |
| Edit dan delete resource | Selesai | `app/resources/[id]/page.tsx` |
| Editor JSON dengan validasi | Selesai | `app/dashboard/new/format.tsx` |
| Public GET collection | Selesai | `app/api/[username]/[resource]/route.ts` |
| Public GET item | Selesai | `app/api/[username]/[resource]/[id]/route.ts` |
| Public POST, PUT, PATCH, DELETE | Selesai | Dua route di atas |
| API key dengan masa berlaku | Selesai | `src/lib/api-key.ts`, halaman settings |
| Resource privat | Selesai untuk GET | Flag `private` |
| Flag published | Selesai | Flag `published` |
| Rate limit endpoint publik | Selesai, in-memory | `src/lib/rate-limit.ts` |
| CORS | Selesai | Kedua route publik |
| Halaman `/public` | Selesai | `app/public/page.tsx` |
| Halaman `/docs` | Selesai | `src/lib/docs.ts` |
| Panel admin | Selesai | `app/admin/page.tsx` |
| Role admin dan user | Selesai | Kolom `role` |
| Guard route | Selesai | `proxy.ts` |
| Docker Compose | Sebagian | `docker-compose.yml` |
| GitHub Actions CI | Selesai sampai build | `.github/workflows/ci.yml` |
| Migration Prisma | Selesai | `prisma/migrations/` |
| Data seed | Selesai | `prisma/seed.ts` |
| Unit test | Sebagian | `tests/`, hanya helper |

## Belum Jadi

| Fitur | Kenapa belum |
|-------|--------------|
| Auto deploy ke mini PC | CI baru sampai tahap build |
| Worker penghapus akun | Janji 3 hari belum ada mechanismenya |
| Email verifikasi | Tabel `verification` belum dipakai |
| Reset password | Endpoint dan halaman belum ada |
| Login social | Kode masih dikomentari di `src/lib/auth.ts` |
| Request log | Tidak ada tabel request |
| Expiry resource | Tidak ada kolom untuk itu |
| Custom status code dan header | Tidak ada |
| Response delay | Tidak ada |
| Pagination di `/public` | Query `take: 100` tanpa tombol load next |
| Quota per user yang benar | `user.maxResource` belum dipakai |
| Test route dan database | Hanya helper yang diuji |
| Multi-stage Dockerfile | Image masih single stage |
| Healthcheck container | Belum ada |

## Gap yang Perlu Diperbaiki

Urut dari yang paling penting.

### Prioritas 1, produksi belum aman

| Gap | Lokasi | Perbaikan |
|-----|--------|-----------|
| `PUBLIC_BASE_URL` hardcoded localhost | `src/lib/config.ts` | Baca dari `NEXT_PUBLIC_APP_URL` |
| `docker-compose.yml` tidak punya env auth | `docker-compose.yml` | Tambahkan `env_file` |
| Migration tidak jalan saat container start | `Dockerfile` | Entrypoint menjalankan `migrate deploy` |
| Password database `admin` | `docker-compose.yml` | Pindah ke env |

Kalau `PUBLIC_BASE_URL` tidak diperbaiki, semua URL yang ditampilkan ke user akan mengarah ke localhost, dan ini langsung merusak fungsi utama produk.

### Prioritas 2, kuota tidak sesuai yang dirancang

| Gap | Lokasi | Perbaikan |
|-----|--------|-----------|
| `user.maxResource` tidak dipakai | `POST /api/resources` | Baca `session.user.maxResource` |
| Pesan error menyebut 1 MB, batasnya 5 MB | `POST /api/resources` | Perbaiki teks pesan |

Panel admin sudah bisa mengubah kuota per user, tapi angkanya belum berpengaruh. Ini membingungkan user.

### Prioritas 3, validasi tidak merata

| Gap | Lokasi | Perbaikan |
|-----|--------|-----------|
| `PUT /api/resources/:id` tidak cek ukuran JSON | route resource | Tambahkan cek yang sama seperti POST |
| `PUT /api/resources/:id` tidak cek slug unik | route resource | Tambahkan pengecekan `findFirst` |
| Slug kosong tidak ditolak | `POST /api/resources` | Tolak kalau hasil slug kosong |
| `POST` dan `PUT` public tidak cek ukuran JSON | route publik | Tambahkan cek ukuran |
| `private` tidak dicek di route tulis | route publik | Tentukan mau konsisten atau tidak |

Konsistensi validasi penting, karena sekarang aturan berbeda tergantung endpoint mana yang dipanggil.

### Prioritas 4, privasi dan pemeliharaan akun

| Gap | Lokasi | Perbaikan |
|-----|--------|-----------|
| Janji hapus 3 hari tidak dijalankan | `DELETE /api/account/delete` | Ubah pesannya, atau buat worker sungguhan |
| `force-delete` tanpa konfirmasi kedua | `PATCH /api/admin/users` | Wajibkan parameter konfirmasi |

Kalau tidak ada worker, lebih baik pesannya jujur: akun ditandai dan akan dihapus oleh admin.

### Prioritas 5, kualitas

| Gap | Perbaikan |
|-----|-----------|
| Route tidak ada testnya | Mulai dari `src/lib/api-key.ts` karena murni |
| Tidak ada log request | Tambahkan logging minimal untuk write |
| Halaman `/public` tidak ada pagination | Tambah `skip` atau cursor |
| `useResource` menyembunyikan error | Kembalikan error asli, biar mudah debug |
| Dockerfile single stage | Pisah jadi build stage dan runtime stage |

## Urutan Kerja yang Disarankan

```text
1. Perbaiki PUBLIC_BASE_URL dan env di docker-compose
2. Pasang worker atau perbaiki pesan hapus akun
3. Pakai user.maxResource untuk kuota
4. Ratakan validasi di semua route resource
5. Tambah test untuk src/lib/api-key.ts
6. Siapkan registry image dan deploy dari CI
7. Lanjut ke fitur: request log, expiry resource
```

## Perbandingan dengan PRD

PRD di `AGENTS.md` menyebut rate limit 60 request per menit untuk GET dan 10 untuk write. Implementasi sekarang 500 dan 100. Ini keputusan sadar supaya mini PC tidak kewalahan, tapi belum dicatat di PRD.

PRD juga menyebut auto deploy. Yang ada baru CI sampai build.

PRD menyebut batas 1 MB per resource. Implementasi sekarang 5 MB.

Kalau PRD dipakai sebagai rujukan, tiga hal di atas perlu diperbarui di sana supaya tidak beda dengan kode.

## Cara Pakai Dokumen Ini

Setelah ada perubahan kode, perbarui tiga tempat:

```text
1. src/lib/docs.ts        kalau ada endpoint atau aturan yang berubah
2. File _docs yang relevan kalau arsitektur berubah
3. AGENTS.md              kalau keputusan produk berubah
```

Kalau tidak ada yang berubah dari tiga poin di atas, tidak perlu sentuh dokumen apa pun.
