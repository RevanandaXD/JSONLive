# 12. Deploy dan CI

## Target Deployment

```text
Mini PC
  +-- Docker
      +-- jsonlive   aplikasi Next.js
      +-- postgres   database
  +-- Cloudflare Tunnel   expose HTTPS ke internet tanpa buka port
```

Production berjalan di satu mini PC, bukan platform cloud.

## docker-compose.yml

```yaml
services:
  jsonlive:
    build: .
    ports:
      - "4500:3000"
    environment:
      DATABASE_URL: postgresql://postgres:admin@postgres:5432/jsonlive
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: jsonlive
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:
```

Yang sudah benar:

- `postgres` tidak punya `ports`, jadi tidak bisa diakses dari luar host.
- Ada volume `pgdata`, jadi data tidak hilang saat container di-restart.
- `restart: unless-stopped`, jadi container hidup lagi kalau mini PC restart.

Yang belum ada dan perlu dilengkapi sebelum production:

| Kekurangan | Akibatnya |
|------------|-----------|
| Tidak ada `BETTER_AUTH_SECRET` | Auth tidak bisa jalan benar di container |
| Tidak ada `BETTER_AUTH_URL` | URL auth tidak sesuai domain publik |
| Tidak ada `NEXT_PUBLIC_APP_URL` | Klien auth di browser memakai default localhost |
| Password database hardcoded | Tidak aman untuk production |
| Tidak ada `prisma migrate deploy` saat start | Migration tidak otomatis dijalankan |
| Tidak ada healthcheck | Restart container tidak tahu app sudah siap |

Cara memperbaiki paling sederhana: buat file `.env` di side server dan pakai `env_file`, lalu pindahkan `migrate deploy` ke entrypoint.

## Dockerfile

```text
FROM node:22-alpine
RUN corepack enable
RUN corepack prepare pnpm@10.33.2 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
CMD ["pnpm", "start"]
```

Yang perlu diketahui:

- Single stage, jadi image berisi dev dependencies juga. Untuk production, pakai multi-stage agar image lebih kecil.
- `pnpm install --frozen-lockfile` dijalankan sebelum `COPY . .`, supaya layer cache tidak bust tiap kode berubah. Ini sudah benar.
- `postinstall` menjalankan `prisma skills sync || exit 0`. Karena diakhiri `|| exit 0`, kegagalan tidak menggagalkan install.
- `pnpm run build` di dalam build berarti `next build` harus bisa mengakses database, karena ada server component yang query Prisma.

Container expose port 3000 secara internal, lalu di-map ke 4500 di host. Jadi dari luar host, aplikasinya ada di port 4500.

## Cloudflare Tunnel

Tunnel membuat domain publik mengarah ke mini PC tanpa membuka port router.

```text
Domain publik  ->  Cloudflare edge  ->  tunnel  ->  localhost:4500
```

Kelebihannya:

- HTTPS otomatis, tanpa sertifikat yang harus diperpanjang sendiri.
- Port router tetap tertutup.
- IP mini PC tidak terlihat.

Semua traffic masuk lewat Cloudflare, jadi header `cf-connecting-ip` selalu ada. Ini yang dipakai `clientIp()` untuk rate limit.

### Yang Perlu Disiapkan

| Item | Status |
|------|--------|
| Akun Cloudflare dengan domain | Manual |
| DNS record untuk tunnel | Manual |
| Command `cloudflared` | Manual |
| Config tunnel | Manual |
| URL publik disimpan di `PUBLIC_BASE_URL` | Belum, masih hardcoded |

## Continuous Integration

File: `.github/workflows/ci.yml`. Trigger:

```text
push ke main
pull request ke main
```

Pipeline:

```text
1. Checkout
2. Setup pnpm 10.33.2
3. Setup Node 22, cache pnpm
4. pnpm install --frozen-lockfile
5. pnpm prisma generate
6. pnpm prisma migrate deploy
7. pnpm lint
8. pnpm test
9. pnpm run build
```

Postgres dijalankan sebagai service dengan health check `pg_isready`. `DATABASE_URL` diarahkan ke localhost karena CI tidak pakai Docker Compose.

Kalau salah satu langkah gagal, pipeline berhenti di situ dan pull request tidak bisa di-merge.

## Yang Belum Ada: Auto Deploy

PRD menyebut CI/CD harus deploy ke mini PC saat ada push ke branch production. Yang ada sekarang baru sampai build.

Yang masih perlu dibuat:

| Langkah | Ide |
|---------|-----|
| Registry image | Push image ke GHCR |
| Deploy | SSH ke mini PC, lalu `docker compose pull && up -d` |
| Secret | Simpan credential lewat GitHub Secrets |
| Migration di server | Jalankan `migrate deploy` sebelum mengganti container |
| Rollback | Simpan tag image sebelumnya supaya bisa dikembalikan |

Saran urutan: registry dulu, lalu deploy manual per SSH. Automasi penuh setelah dua langkah itu terbukti stabil.

## Environment per Stage

| Stage | DATABASE_URL | BETTER_AUTH_URL | NEXT_PUBLIC_APP_URL | BETTER_AUTH_SECRET |
|-------|--------------|-----------------|---------------------|--------------------|
| Local | localhost | `http://localhost:3000` | `http://localhost:3000` | bebas |
| Docker lokal | `postgres:5432` | `http://localhost:4500` | `http://localhost:4500` | wajib ada |
| Production | domain publik | domain HTTPS | domain HTTPS | wajib, jangan diubah |

`BETTER_AUTH_SECRET` production tidak boleh berubah. Kalau berubah, semua user harus login ulang.

## Perintah Deploy Manual

```bash
# di mini PC
cd /path/to/jsonlive
git pull
docker compose build
docker compose up -d
docker compose logs -f jsonlive
```

Sebelum build, pastikan migration yang baru sudah ada di repo. Kalau belum, `docker compose build` bisa gagal karena schema dan kode tidak sinkron.

## Checklist Sebelum Production

```text
1. BETTER_AUTH_SECRET dibuat dan disimpan aman
2. BETTER_AUTH_URL dan NEXT_PUBLIC_APP_URL memakai domain HTTPS
3. Password PostgreSQL diganti dari "admin"
4. Postgres tidak punya ports di docker-compose
5. PUBLIC_BASE_URL diubah supaya tidak hardcoded localhost
6. Migration sudah di-deploy ke database production
7. Seed tidak dijalankan di production
8. Backup volume pgdata sudah dijadwalkan secara rutin
9. Cloudflare tunnel sudah dites dari jaringan luar
10. Minimal satu user admin sudah dibuat
```
