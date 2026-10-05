# 10. Halaman dan Komponen

## Peta Halaman

| Path | Akses | Isi |
|------|-------|-----|
| `/` | Publik | Landing page. Section marketing, link ke docs dan halaman public |
| `/login` | Publik | Form login. Kalau sudah login, di-redirect sesuai role |
| `/register` | Publik | Form registrasi. Rate limit 3 per menit |
| `/thanks` | Publik | Halaman singkat setelah registrasi |
| `/dashboard` | Login, role user | Daftar resource milik user, URL publik, toggle publish dan private |
| `/dashboard/new` | Login, role user | Form create resource dengan editor JSON |
| `/resources/[id]` | Login, pemilik | Detail resource, endpoint, edit, hapus |
| `/settings` | Login | Profil, kelola API key, hapus akun |
| `/admin` | Login, role admin | Daftar user, ubah role, ubah kuota, hapus user |
| `/public` | Publik | Semua endpoint yang dipublish, dengan pencarian |
| `/docs` | Publik | Dokumentasi API untuk pengguna akhir |

## Jenis Halaman

Next.js App Router membagi halaman menjadi dua jenis. Pilih yang tepat sebelum menulis.

| Jenis | Dipakai di | Tidak boleh |
|-------|-----------|-------------|
| Server component, tanpa `"use client"` | `app/public/page.tsx`, `app/admin/page.tsx` | Panggil `onClick` atau hook browser |
| Client component, ada `"use client"` | Halaman dashboard, settings, login | Langsung akses database |

Aturan praktis:

- Halaman yang hanya menampilkan data, seperti `/public`, pakai server component supaya tidak perlu round-trip API sendiri.
- Halaman yang butuh interaksi, seperti dashboard, pakai client component dan `hooks/`.
- `app/admin/page.tsx` adalah client component, jadi dia baca data lewat `fetch` ke `/api/admin/users`, bukan langsung ke database.

## Halaman Publik

### `/`

Landing page dirakit dari komponen di `components/marketing/`:

| Komponen | Isi |
|----------|-----|
| `Hero.tsx` | Headline dan CTA utama |
| `Features.tsx` | Daftar fitur |
| `HowItWorks.tsx` | Alur pakai, tiga tahap |
| `Stats.tsx` | Angka statistik |
| `FAQ.tsx` | Pertanyaan umum |

Kerangka halaman pakai `Navbar.tsx` dan `Footer.tsx` dari `components/layout/`.

### `/docs`

Isinya diambil dari `src/lib/docs.ts`, bukan ditulis langsung di komponen. File itu menyimpan:

| Ekspor | Isi |
|--------|-----|
| `HOST` | URL contoh yang dipakai semua contoh request |
| `COLLECTION_ENDPOINTS` | Tabel endpoint collection |
| `ITEM_ENDPOINTS` | Tabel endpoint item |
| `EXAMPLES` | Tujuh contoh lengkap, tiap punya curl dan fetch JavaScript |
| `BEHAVIOR_NOTES` | Catatan perilaku yang mudah terlewat |
| `STATUS_CODES` | Tabel status code |
| `SAMPLE_DATA` | Data contoh |
| `CONSUM_EXAMPLE` | Contoh fetch satu blok |

Tujuh langkah di `EXAMPLES`:

```text
1. Baca seluruh collection
2. Baca satu item
3. Tambah item
4. Ubah satu field dengan PATCH
5. Ganti satu item dengan PUT
6. Hapus item
7. Ganti seluruh collection
```

Kalau menambah endpoint atau mengubah aturan, update `src/lib/docs.ts` supaya halaman `/docs` tidak lagi outdated.

### `/public`

Server component. Query-nya langsung ke Prisma:

```text
prisma.resource.findMany({
  where:   { published: true },
  orderBy: { updatedAt: "desc" },
  take:    100,
  include: { user: { select: { username: true } } },
})
```

`PublicGrid.tsx` yang client component, handling pencarian di sisi browser dengan `useMemo`. Tidak ada query ulang ke server saat mengetik.

Bentuk data yang diteruskan ke `PublicGrid` ada di tipe `PublicRow`: `id`, `name`, `slug`, `username`, `type`, `endpoint`.

`type` ditentukan dari bentuk data: array berarti `Collection`, selain itu `Object`.

## Halaman Login

`AuthShell.tsx` jadi wrapper bersama untuk `/login` dan `/register`, supaya tampilan keduanya sama.

Keduanya memakai `authClient` dari `src/lib/auth-client.ts`:

```ts
await signIn.email({ email, password });
await signUp.email({ email, password, name });
```

## Halaman Dashboard

`app/dashboard/page.tsx` adalah client component dan punya beberapa tanggung jawab:

- `useUser` untuk session
- `useResource` untuk daftar resource
- `useMutation` langsung untuk toggle publish, toggle private, dan delete
- Tampilan bar storage memakai `STORAGE_LIMIT` dari `src/lib/config.ts`

Untuk toggle dan delete, dashboard tidak memakai hook terpisah, tapi `useMutation` langsung dengan `api.patch` dan `api.delete`.

## Halaman Create

`app/dashboard/new/page.tsx` memegang state form:

- `name` untuk nama resource
- `json` untuk isi editor, disimpan sebagai string
- Validasi dengan `JSON.parse` sebelum submit
- Preview URL memakai slug yang dihitung di browser dengan pola yang sama seperti server

`app/dashboard/new/format.tsx` adalah editor JSON-nya. Bukan CodeMirror, cuma `textarea` dengan enhancements:

| Fitur | Cara kerja |
|-------|------------|
| Indentasi | Tekan Tab menambah dua spasi |
| Auto-pair | Tekan `{`, `[`, atau `"` membuat pasangan closing |
| Skip closing | Tekan closing yang tepat saat cursor sudah di sebelahnya |
| Caret | Dipindah dengan `requestAnimationFrame` supaya tidak berkedip |

State `invalid` mengubah warna teks jadi merah saat JSON tidak valid.

## Halaman Detail Resource

`app/resources/[id]/page.tsx`:

- Mengambil `id` dari URL
- Edit nama dan JSON
- Toggle publish dan private
- Tombol copy endpoint
- Hapus dengan konfirmasi

## Halaman Settings

Tiga bagian, tata letaknya dari `SETTINGS_LAYOUT` di `src/lib/settings.ts`:

| Bagian | Isi |
|--------|-----|
| Profil | Nama, email, username, password, dan endpoint publik user |
| API key | Daftar key, buat key baru, hapus key, tampilkan waktu pakai |
| Danger zone | Ajukan hapus akun, batalkan pengajuan |

`describeKeyUsage` dan `displayValue` dari `src/lib/settings.ts` dipakai untuk merapikan tampilan waktu dan nilai kosong.

`isEmailConfirmed` dipakai untuk validasi hapus akun: user harus mengetik email yang sama.

## Halaman Admin

`app/admin/page.tsx` adalah yang paling besar, sekitar 480 baris. Tanggung jawabnya:

- Mengambil daftar user dari `GET /api/admin/users`
- Mengubah role dan kuota lewat `PATCH /api/admin/users`
- `force-delete` user
- Optimistic update pada daftar user supaya tidak perlu reload
- Panel statistik: total user, total resource, total kuota yang dialokasikan

## Komponen

### `components/ui/`

Komponen dasar tanpa logika bisnis. Dipakai ulang di semua halaman.

| Komponen | Tugas |
|----------|-------|
| `Button.tsx` | Tombol dengan beberapa variant |
| `Card.tsx` | Wadah dengan border dan padding |
| `Input.tsx` | Input teks dengan label dan error |
| `Badge.tsx` | Label kecil untuk status |
| `Alert.tsx` | Pesan notifikasi |
| `Modal.tsx` | Dialog, dipakai saat konfirmasi hapus dan tampilkan API key |
| `Tabs.tsx` | Tab navigasi |
| `Switch.tsx` | Toggle boolean |
| `SearchInput.tsx` | Input pencarian |
| `CopyButton.tsx` | Tombol salin ke clipboard |
| `EmptyState.tsx` | Tampilan saat data kosong |
| `Skeleton.tsx` | Placeholder saat loading |

### `components/layout/`

| Komponen | Dipakai di |
|----------|------------|
| `Navbar.tsx` | Halaman publik |
| `Footer.tsx` | Halaman publik |
| `DashboardNav.tsx` | Dashboard, settings, admin |
| `AuthShell.tsx` | Login, register |
| `Background.tsx` | Latar dekoratif |
| `DashboardSkeleton.tsx` | Placeholder dashboard |
| `Logo.tsx` | Logo, dipakai di navbar dan auth shell |

`DashboardNav` punya prop `loginOnly`. Kalau `true`, dia disembunyikan untuk user yang sudah login, dipakai di halaman `/public`.

## Hook

| Hook | Mengembalikan |
|------|---------------|
| `useSession` | Re-export dari `auth-client` |
| `useUser` | `user`, `session`, `isPending`, `error` dari `useSession` |
| `useResource` | Daftar resource milik user |
| `useCreateResources` | Fungsi create, `isPending`, `error` |
| `useApiKeys` | Daftar key, create, delete, status loading |

Dua hal yang perlu dijaga:

`useResource` dan `useApiKeys` mengembalikan array kosong kalau request gagal, bukan melempar error. Ini membuat UI tidak pernah error, tapi juga jadi lebih sulit debugging. `isError` masih tersedia kalau butuh.

`useCreateResources` punya bentuk Jamak, bukan Tunggal. Ini mengikuti penamaan yang sudah dipakai project. Jangan create hook baru dengan pola lain tanpa alasan kuat.

## Alur Request Client-Server

```text
Component
   |
   v
hooks/useXxx          useQuery atau useMutation, queryKey sebagai cache key
   |
   v
src/lib/api.ts        fetch, json header, throw Error kalau tidak ok
   |
   v
app/api/.../route.ts  validasi, cek session, query Prisma
   |
   v
TanStack Query        invalidate queryKey supaya data di-refresh
```

Query key yang dipakai sekarang:

| Query key | Dipakai oleh |
|-----------|--------------|
| `["resources"]` | `useResource`, `useCreateResources` |
| `["api-keys"]` | `useApiKeys` |
