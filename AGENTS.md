# JSONLive — Product Requirements Document

**Version:** 2.0
**Status:** Planned / MVP Development
**Product Type:** Hosted JSON API / Mock API Service

---

# 1. Product Overview

**JSONLive** adalah platform yang memungkinkan developer mengubah data JSON menjadi **public HTTP API endpoint** yang dapat langsung digunakan oleh aplikasi frontend, mobile app, testing environment, maupun prototype.

Konsep utama:

```text
Paste JSON
    ↓
Save
    ↓
JSONLive menyimpan data
    ↓
Generate API URL
    ↓
Frontend dapat melakukan fetch()
```

Contoh:

User membuat resource:

```json
{
  "name": "Revan",
  "role": "Developer",
  "skills": ["React", "Next.js"]
}
```

JSONLive memberikan:

```text
https://jsonlive.example/revan/profile
```

Kemudian aplikasi lain dapat:

```javascript
const response = await fetch(
  "https://jsonlive.example/revan/profile"
);

const data = await response.json();
```

dan mendapatkan:

```json
{
  "name": "Revan",
  "role": "Developer",
  "skills": ["React", "Next.js"]
}
```

---

# 2. Problem

Saat melakukan frontend development, developer sering membutuhkan API sebelum backend sebenarnya tersedia.

Contohnya:

```text
Frontend sedang dibuat
        ↓
Backend belum selesai
        ↓
Butuh data JSON
        ↓
Install json-server
        ↓
Setup db.json
        ↓
Menjalankan server lokal
```

JSONLive mencoba mengurangi setup tersebut:

```text
JSON
 ↓
JSONLive
 ↓
Public API
```

Developer cukup membuat JSON dan mendapatkan URL yang dapat diakses dari berbagai environment.

Konsep hosted mock API seperti ini memang sudah digunakan oleh beberapa layanan, tetapi JSONLive akan difokuskan sebagai project yang sederhana, lightweight, dan **self-hosted di mini PC**.

---

# 3. Product Vision

> **The simplest way to turn JSON into a usable API.**

JSONLive tidak bertujuan menjadi API management platform besar.

Fokusnya:

```text
JSON → API → Development
```

---

# 4. Target Users

### Primary

Frontend developer yang membutuhkan mock API untuk development.

### Secondary

* Mahasiswa IT
* Developer pemula
* Programmer yang membuat prototype
* Developer yang melakukan API testing
* Developer yang membutuhkan temporary/public JSON endpoint

---

# 5. Core Use Cases

## Use Case 1 — Frontend Development

Developer belum memiliki backend.

```text
JSONLive
    ↓
GET /users
    ↓
React / Vue / Next.js
```

Frontend dapat dikembangkan tanpa menunggu backend.

---

## Use Case 2 — API Testing

Developer ingin mengetes:

```text
GET
POST
PUT
PATCH
DELETE
```

tanpa membuat backend penuh.

---

## Use Case 3 — Prototype

Developer ingin menunjukkan aplikasi kepada orang lain dengan API yang dapat diakses melalui internet.

---

## Use Case 4 — Shared Development

API dapat diakses dari:

```text
Laptop
Desktop
Mobile
CI/CD
Preview deployment
```

karena endpoint bersifat public.

---

# 6. MVP Scope

MVP harus sesederhana mungkin.

### Wajib

* Create JSON resource
* Validate JSON
* Save JSON
* Generate public URL
* GET public JSON
* Edit JSON
* Delete resource
* Copy endpoint URL
* Dashboard resource list
* Rate limiting dasar
* JSON size limit

### Belum wajib

* OAuth
* Payment
* API subscription
* Complex analytics
* Webhook inspector
* GraphQL
* Kubernetes
* Microservices
* Redis
* Multi-region
* Per-user container

---

# 7. MVP User Flow

```text
User
 ↓
Dashboard
 ↓
Create Resource
 ↓
Input JSON
 ↓
Validate
 ↓
Save
 ↓
Generate URL
 ↓
Copy URL
 ↓
External application
 ↓
GET endpoint
 ↓
JSON response
```

---

# 8. Resource Example

User membuat:

```text
Resource Name:
users
```

Data:

```json
[
  {
    "id": 1,
    "name": "Revan"
  },
  {
    "id": 2,
    "name": "Budi"
  }
]
```

Endpoint:

```text
https://jsonlive.example/revan/users
```

Request:

```http
GET /revan/users
```

Response:

```json
[
  {
    "id": 1,
    "name": "Revan"
  },
  {
    "id": 2,
    "name": "Budi"
  }
]
```

---

# 9. CRUD Strategy

CRUD **tidak harus langsung menjadi MVP utama**.

Development dilakukan bertahap.

## Phase 1

```text
Create resource
      ↓
GET resource
```

## Phase 2

```text
Edit resource
Delete resource
```

## Phase 3

Jika data berbentuk collection:

```text
GET
POST
PUT
PATCH
DELETE
```

Contoh:

```http
GET /revan/users
POST /revan/users
GET /revan/users/1
PUT /revan/users/1
PATCH /revan/users/1
DELETE /revan/users/1
```

Dengan demikian JSONLive dapat berkembang mendekati pengalaman `json-server`.

---

# 10. Multi-Tenant Architecture

JSONLive **tidak menggunakan satu container untuk setiap user**.

Arsitektur:

```text
                    Users
               /      |      \
              /       |       \
             ▼        ▼        ▼
        ┌─────────────────────────┐
        │        Next.js           │
        │       API Server         │
        └────────────┬────────────┘
                     │
                     ▼
              ┌──────────────┐
              │  PostgreSQL  │
              └──────────────┘
```

Satu instance aplikasi melayani banyak user.

Database memisahkan resource berdasarkan owner.

Contoh:

```text
User: Revan
 ├── profile
 ├── users
 └── products

User: Budi
 ├── posts
 └── products
```

Keuntungan:

* lebih hemat RAM
* lebih mudah deployment
* lebih sederhana
* cocok untuk mini PC
* lebih mudah scaling di masa depan

---

# 11. System Architecture

```text
                         INTERNET
                            │
                            ▼
                    Cloudflare Tunnel
                            │
                            ▼
                  ┌──────────────────┐
                  │      Mini PC     │
                  │                  │
                  │     Docker       │
                  │                  │
                  │  ┌────────────┐  │
                  │  │  Next.js   │  │
                  │  │            │  │
                  │  │ Dashboard  │  │
                  │  │ API        │  │
                  │  └─────┬──────┘  │
                  │        │         │
                  │        ▼         │
                  │  ┌────────────┐  │
                  │  │ PostgreSQL │  │
                  │  └────────────┘  │
                  └──────────────────┘
```

---

# 12. Technology Stack

## Frontend

```text
Next.js
TypeScript
Tailwind CSS
```

## Server/API

```text
Next.js Route Handlers
```

Tidak menggunakan Express pada MVP.

Alasannya:

```text
Next.js
├── Frontend
├── API
├── Routing
└── Server-side logic
```

sehingga satu aplikasi lebih sederhana untuk deployment.

---

# 13. State Management

## TanStack Query

Digunakan untuk **server state**.

Contoh:

```text
resources
create resource
update resource
delete resource
loading
error
cache
refetch
```

Architecture:

```text
Component
    ↓
TanStack Query
    ↓
Next.js API
    ↓
Prisma
    ↓
PostgreSQL
```

## Zustand

**Tidak wajib untuk MVP.**

Zustand hanya digunakan apabila terdapat client/UI state yang membutuhkan global store.

Contoh:

```text
sidebar state
editor state
preview state
UI preferences
```

Tidak digunakan untuk menyimpan data resources dari database.

---

# 14. Project Structure

```text
jsonlive/
│
├── app/
│   │
│   ├── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── resources/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   └── api/
│       │
│       ├── resources/
│       │   └── route.ts
│       │
│       └── [username]/
│           └── [resource]/
│               └── route.ts
│
├── components/
│   ├── ui/
│   ├── json-editor.tsx
│   ├── resource-card.tsx
│   └── resource-list.tsx
│
├── hooks/
│   └── use-resources.ts
│
├── lib/
│   ├── db.ts
│   ├── api.ts
│   └── utils.ts
│
├── prisma/
│   └── schema.prisma
│
├── stores/
│   └── ui-store.ts
│
├── types/
│   └── resource.ts
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── .env
```

---

# 15. Database Design

## User

```text
User
├── id
├── username
├── createdAt
└── updatedAt
```

## Resource

```text
Resource
├── id
├── userId
├── name
├── slug
├── data
├── createdAt
└── updatedAt
```

Relationship:

```text
User
 │
 ├── Resource
 ├── Resource
 └── Resource
```

`data` menggunakan PostgreSQL JSON/JSONB.

---

# 16. API Design

## Create Resource

```http
POST /api/resources
```

Request:

```json
{
  "name": "users",
  "data": [
    {
      "id": 1,
      "name": "Revan"
    }
  ]
}
```

---

## Public GET

```http
GET /api/:username/:resource
```

Response:

```json
[
  {
    "id": 1,
    "name": "Revan"
  }
]
```

---

## Update Resource

```http
PUT /api/resources/:id
```

---

## Delete Resource

```http
DELETE /api/resources/:id
```

---

# 17. HTTP Response

Success:

```http
200 OK
Content-Type: application/json
```

Create:

```http
201 Created
```

Invalid JSON:

```http
400 Bad Request
```

Resource tidak ditemukan:

```http
404 Not Found
```

Conflict:

```http
409 Conflict
```

Rate limit:

```http
429 Too Many Requests
```

Server error:

```http
500 Internal Server Error
```

---

# 18. Rate Limiting

Karena endpoint public dan server berjalan pada mini PC, API harus memiliki rate limiting.

MVP awal:

| Method |              Limit |
| ------ | -----------------: |
| GET    | 60 requests/minute |
| POST   | 10 requests/minute |
| PUT    | 10 requests/minute |
| PATCH  | 10 requests/minute |
| DELETE | 10 requests/minute |

Limit diterapkan berdasarkan IP/user sesuai endpoint yang dipilih.

Jika limit tercapai:

```http
429 Too Many Requests
```

Rate limiting dapat ditingkatkan setelah MVP.

---

# 19. Resource Limits

Untuk melindungi mini PC:

### JSON payload

Contoh batas MVP:

```text
Maximum JSON size: 1 MB
```

### Resource per user

Contoh awal:

```text
Maximum resources: 20
```

### Request

Write operation memiliki limit lebih ketat daripada GET.

---

# 20. CORS

Public JSON API harus dapat digunakan oleh frontend dari domain lain.

Response:

```http
Access-Control-Allow-Origin: *
```

pada endpoint public MVP.

Tujuannya agar:

```javascript
fetch("https://jsonlive.example/revan/users")
```

dapat digunakan dari:

```text
localhost
Vercel
Netlify
Mobile app
Desktop app
```

CORS merupakan fitur penting untuk use case mock API karena endpoint memang ditujukan untuk dikonsumsi aplikasi lain. Layanan mock API sejenis juga umumnya menyediakan akses lintas origin untuk development.

---

# 21. Security

MVP harus:

* menggunakan HTTPS
* tidak expose PostgreSQL langsung ke internet
* menyimpan credential melalui environment variable
* memvalidasi JSON
* membatasi ukuran request
* menggunakan rate limiting
* menggunakan identifier resource yang tidak mudah ditebak
* melakukan authorization untuk operasi dashboard
* memisahkan resource berdasarkan owner

---

# 22. Deployment

Production server:

```text
Mini PC / NUC
```

Container:

```text
Docker
├── jsonlive
└── postgres
```

Public access:

```text
Internet
    ↓
Cloudflare
    ↓
Cloudflare Tunnel
    ↓
Mini PC
```

---

# 23. CI/CD

Repository:

```text
GitHub
```

Pipeline:

```text
Developer
    │
    │ git push
    ▼
GitHub
    │
    ▼
GitHub Actions
    │
    ├── Install dependencies
    ├── Lint
    ├── Test
    ├── Build
    └── Deploy
          │
          ▼
       Mini PC
          │
          ▼
        Docker
```

Targetnya adalah setiap perubahan yang masuk ke branch production dapat dibuild dan dideploy secara otomatis.

---

# 24. Docker Architecture

MVP:

```text
docker compose
│
├── jsonlive
│   └── Next.js
│
└── postgres
    └── PostgreSQL
```

PostgreSQL tidak diekspos langsung ke internet.

---

# 25. Performance Strategy

Karena server menggunakan mini PC dengan resource terbatas:

### MVP

```text
Next.js
+
PostgreSQL
+
Cloudflare Tunnel
```

Tidak menggunakan:

```text
Redis
Kubernetes
Microservices
Message Queue
Elasticsearch
```

### Future

Jika traffic meningkat:

```text
GET
 ↓
Cache
 ↓
PostgreSQL
```

Caching dapat digunakan untuk mengurangi database query pada endpoint yang sering dipanggil.

---

# 26. CRUD Performance Strategy

GET:

```text
GET
 ↓
Next.js
 ↓
PostgreSQL
 ↓
JSON
```

Write:

```text
POST / PUT / PATCH / DELETE
 ↓
Next.js
 ↓
Validation
 ↓
PostgreSQL write
 ↓
Response
```

Write operation mendapatkan rate limit lebih ketat karena menyebabkan database mutation.

---

# 27. Dashboard

Dashboard MVP:

```text
┌──────────────────────────────┐
│ JSONLive                     │
├──────────────────────────────┤
│                              │
│ My Resources                 │
│                              │
│ ┌──────────────────────────┐ │
│ │ users                     │ │
│ │ /revan/users              │ │
│ │                           │ │
│ │ [Open] [Copy] [Edit]     │ │
│ └──────────────────────────┘ │
│                              │
│ [+ Create Resource]          │
└──────────────────────────────┘
```

---

# 28. JSON Editor

Editor harus menyediakan:

* JSON syntax highlighting
* validation
* formatting
* minify/pretty JSON
* error indicator

Contoh:

```text
JSON Editor

{
  "name": "Revan",
  "role": "Developer"
}

✓ Valid JSON

[Format] [Save]
```

---

# 29. Resource Detail

Halaman resource:

```text
/users

Endpoint
https://jsonlive.example/revan/users

[Copy URL]

────────────────────────

JSON

[
  {
    "id": 1,
    "name": "Revan"
  }
]

[Edit] [Delete]
```

---

# 30. Future Features

## V2 — Full Mock REST API

```text
GET
POST
PUT
PATCH
DELETE
```

Collection support:

```text
/users
/users/1
```

---

## V3 — API Configuration

User dapat mengatur:

```text
Status code
Response headers
Response delay
CORS
```

---

## V4 — Request Logs

```text
GET     /revan/users
200     14:20:03

POST    /revan/users
201     14:20:11

GET     /revan/products
200     14:20:22
```

---

## V5 — Authentication

```text
Login
Register
API Key
```

---

## V6 — Expiration

Resource dapat memiliki:

```text
1 hour
1 day
7 days
30 days
Never
```

---

## V7 — Advanced Rate Limits

```text
Free
├── GET: 60/min
└── WRITE: 10/min

Pro
├── GET: 300/min
└── WRITE: 60/min
```

---

# 31. Success Criteria

MVP dianggap selesai apabila:

```text
1. User membuka JSONLive
        ↓
2. Membuat resource
        ↓
3. Memasukkan JSON valid
        ↓
4. Menyimpan JSON
        ↓
5. Mendapatkan public URL
        ↓
6. Endpoint dapat di-fetch
        ↓
7. JSON berhasil dikembalikan
        ↓
8. User dapat mengedit JSON
        ↓
9. Endpoint mengembalikan data terbaru
        ↓
10. Resource dapat dihapus
```

---

# 32. Definition of Done

### Application

* [ ] Next.js berjalan
* [ ] Dashboard selesai
* [ ] JSON editor selesai
* [ ] JSON validation selesai
* [ ] Create resource
* [ ] Read resource
* [ ] Update resource
* [ ] Delete resource
* [ ] Public endpoint
* [ ] CORS
* [ ] Rate limiting
* [ ] JSON size limit

### Database

* [ ] PostgreSQL
* [ ] Prisma schema
* [ ] Migration
* [ ] User-resource relationship

### Infrastructure

* [ ] Docker
* [ ] Docker Compose
* [ ] Mini PC deployment
* [ ] Cloudflare Tunnel
* [ ] HTTPS

### CI/CD

* [ ] GitHub repository
* [ ] GitHub Actions
* [ ] Lint
* [ ] Test
* [ ] Build
* [ ] Deployment

---

# 33. Development Priority

Urutan pengerjaan:

```text
Phase 1
Next.js setup
       ↓
Phase 2
Database + Prisma
       ↓
Phase 3
Create JSON
       ↓
Phase 4
GET public endpoint
       ↓
Phase 5
Edit/Delete
       ↓
Phase 6
Dashboard polish
       ↓
Phase 7
Docker
       ↓
Phase 8
Mini PC deployment
       ↓
Phase 9
Cloudflare Tunnel
       ↓
Phase 10
GitHub Actions CI/CD
       ↓
Phase 11
Rate limiting + security hardening
```

---

# 34. Final MVP Architecture

```text
                           INTERNET
                               │
                               ▼
                     ┌──────────────────┐
                     │    Cloudflare    │
                     │      Tunnel      │
                     └────────┬─────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │       MINI PC       │
                    │                     │
                    │      Docker         │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │   JSONLive    │  │
                    │  │   Next.js     │  │
                    │  │               │  │
                    │  │ Dashboard     │  │
                    │  │ API           │  │
                    │  └───────┬───────┘  │
                    │          │          │
                    │          ▼          │
                    │  ┌───────────────┐  │
                    │  │  PostgreSQL   │  │
                    │  └───────────────┘  │
                    │                     │
                    └─────────────────────┘
                              ▲
                              │
                         GitHub Actions
                              ▲
                              │
                         git push
                              │
                          Developer
```

---

# 35. Product Principle

JSONLive harus mengikuti prinsip:

> **Simple to create. Simple to consume. Simple to deploy.**

MVP tidak perlu menjadi platform API besar.

Tujuan pertama hanyalah membuat:

```text
JSON
 ↓
Save
 ↓
URL
 ↓
fetch()
 ↓
JSON
```

berjalan dengan cepat, stabil, dan aman.
