export const HOST = "https://jsonlive.revandev.my.id";
export const BASE_URL = `${HOST}/api`;
export const API_KEY_PREFIX = "jlv_";

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";

export type EndpointAuth = "none" | "key";

export type Endpoint = {
  method: HttpMethod;
  path: string;
  desc: string;
  auth: EndpointAuth;
  status: string;
};

export type DocExample = {
  step: string;
  title: string;
  method: HttpMethod;
  path: string;
  summary: string;
  note?: string;
  result?: string;
  curl: string;
  js: string;
  status: string;
  response: string;
};

export type BehaviorNote = {
  title: string;
  body: string;
};

export const SAMPLE_DATA = `[
  { "id": 1, "name": "Revan", "role": "Developer" },
  { "id": 2, "name": "Budi", "role": "Designer" }
]`;

export const CONSUME_EXAMPLE = `// Read the whole collection (no key needed)
const res = await fetch("${HOST}/api/revan/users");
const users = await res.json();

// Add an item (needs API key)
await fetch("${HOST}/api/revan/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${API_KEY_PREFIX}...",
  },
  body: JSON.stringify({ name: "Siti", role: "QA" }),
});`;

export const AUTH_EXAMPLES = [
  {
    label: "Custom header",
    code: `x-api-key: ${API_KEY_PREFIX}...`,
  },
  {
    label: "Bearer token",
    code: `Authorization: Bearer ${API_KEY_PREFIX}...`,
  },
];

export const COLLECTION_ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/{owner}/{resource}",
    desc: "Read the whole collection.",
    auth: "none",
    status: "200 / 401 / 404",
  },
  {
    method: "POST",
    path: "/api/{owner}/{resource}",
    desc: "Append one item to the collection.",
    auth: "key",
    status: "201 / 400 / 401",
  },
  {
    method: "PUT",
    path: "/api/{owner}/{resource}",
    desc: "Replace the whole collection.",
    auth: "key",
    status: "200 / 400 / 401",
  },
  {
    method: "OPTIONS",
    path: "/api/{owner}/{resource}",
    desc: "CORS preflight for browser clients.",
    auth: "none",
    status: "204",
  },
];

export const ITEM_ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/{owner}/{resource}/{id}",
    desc: "Read one item.",
    auth: "none",
    status: "200 / 400 / 404",
  },
  {
    method: "PATCH",
    path: "/api/{owner}/{resource}/{id}",
    desc: "Update selected fields.",
    auth: "key",
    status: "200 / 400 / 401 / 404",
  },
  {
    method: "PUT",
    path: "/api/{owner}/{resource}/{id}",
    desc: "Replace the whole item.",
    auth: "key",
    status: "200 / 400 / 401 / 404",
  },
  {
    method: "DELETE",
    path: "/api/{owner}/{resource}/{id}",
    desc: "Delete the item.",
    auth: "key",
    status: "200 / 400 / 401 / 404",
  },
  {
    method: "OPTIONS",
    path: "/api/{owner}/{resource}/{id}",
    desc: "CORS preflight for browser clients.",
    auth: "none",
    status: "204",
  },
];

export const EXAMPLES: DocExample[] = [
  {
    step: "1",
    title: "Read the whole collection",
    method: "GET",
    path: `${HOST}/api/revan/users`,
    summary:
      "No key needed. Anyone can call this URL and gets the full array back.",
    curl: `curl ${HOST}/api/revan/users`,
    js: `const res = await fetch("${HOST}/api/revan/users");
const users = await res.json();`,
    status: "200 OK",
    response: `[
  { "id": 1, "name": "Revan", "role": "Developer" },
  { "id": 2, "name": "Budi", "role": "Designer" }
]`,
  },
  {
    step: "2",
    title: "Read one item",
    method: "GET",
    path: `${HOST}/api/revan/users/1`,
    summary:
      "Add the id of an entry after the resource name. The id must match the id field inside the JSON.",
    curl: `curl ${HOST}/api/revan/users/1`,
    js: `const res = await fetch("${HOST}/api/revan/users/1");
const user = await res.json();`,
    status: "200 OK",
    response: `{ "id": 1, "name": "Revan", "role": "Developer" }`,
  },
  {
    step: "3",
    title: "Add an item",
    method: "POST",
    path: `${HOST}/api/revan/users`,
    summary:
      "Send one object. The new entry is appended to the end of the array, and an id is added for you.",
    note: "Needs an API key. Get one in Settings, then send it as x-api-key.",
    curl: `curl -X POST ${HOST}/api/revan/users \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${API_KEY_PREFIX}..." \\
  -d '{ "name": "Siti", "role": "QA" }'`,
    js: `const res = await fetch("${HOST}/api/revan/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${API_KEY_PREFIX}...",
  },
  body: JSON.stringify({ name: "Siti", role: "QA" }),
});

// 201 — the response body contains the generated id
const created = await res.json();`,
    status: "201 Created",
    response: `{ "id": 3, "name": "Siti", "role": "QA" }`,
  },
  {
    step: "4",
    title: "Change one field of an item",
    method: "PATCH",
    path: `${HOST}/api/revan/users/1`,
    summary:
      "Send only the fields you want to change. Every other field stays exactly as it was.",
    note: "Needs an API key.",
    curl: `curl -X PATCH ${HOST}/api/revan/users/1 \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${API_KEY_PREFIX}..." \\
  -d '{ "role": "Senior Developer" }'`,
    js: `await fetch("${HOST}/api/revan/users/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${API_KEY_PREFIX}...",
  },
  body: JSON.stringify({ role: "Senior Developer" }),
});`,
    status: "200 OK",
    response: `{ "id": 1, "name": "Revan", "role": "Senior Developer" }`,
  },
  {
    step: "5",
    title: "Replace an item",
    method: "PUT",
    path: `${HOST}/api/revan/users/1`,
    summary:
      "The whole item becomes the body you send. Fields you leave out are removed, so include everything you still need.",
    note: "Needs an API key.",
    curl: `curl -X PUT ${HOST}/api/revan/users/1 \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${API_KEY_PREFIX}..." \\
  -d '{ "id": 1, "name": "Revan" }'`,
    js: `await fetch("${HOST}/api/revan/users/1", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${API_KEY_PREFIX}...",
  },
  body: JSON.stringify({ id: 1, name: "Revan" }),
});`,
    status: "200 OK",
    response: `{ "id": 1, "name": "Revan" }`,
    result: "The role field is gone because it was not sent.",
  },
  {
    step: "6",
    title: "Delete an item",
    method: "DELETE",
    path: `${HOST}/api/revan/users/1`,
    summary:
      "The entry is removed from the array. A fresh GET confirms it is gone.",
    note: "Needs an API key.",
    curl: `curl -X DELETE ${HOST}/api/revan/users/1 \\
  -H "x-api-key: ${API_KEY_PREFIX}..."`,
    js: `const res = await fetch("${HOST}/api/revan/users/1", {
  method: "DELETE",
  headers: { "x-api-key": "${API_KEY_PREFIX}..." },
});

// 200 — { "success": true }
const result = await res.json();`,
    status: "200 OK",
    response: `{ "success": true }`,
  },
  {
    step: "7",
    title: "Replace the whole collection",
    method: "PUT",
    path: `${HOST}/api/revan/users`,
    summary:
      "Send an array to overwrite the entire dataset at once. Useful to reset a demo or seed fixtures.",
    note: "Needs an API key.",
    curl: `curl -X PUT ${HOST}/api/revan/users \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${API_KEY_PREFIX}..." \\
  -d '[
    { "id": 1, "name": "Revan", "role": "Developer" },
    { "id": 2, "name": "Budi", "role": "Designer" }
  ]'`,
    js: `await fetch("${HOST}/api/revan/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${API_KEY_PREFIX}...",
  },
  body: JSON.stringify([
    { id: 1, name: "Revan", role: "Developer" },
    { id: 2, name: "Budi", role: "Designer" },
  ]),
});`,
    status: "200 OK",
    response: `[
  { "id": 1, "name": "Revan", "role": "Developer" },
  { "id": 2, "name": "Budi", "role": "Designer" }
]`,
  },
];

export const BEHAVIOR_NOTES: BehaviorNote[] = [
  {
    title: "IDs are automatic",
    body: "If a posted object has no id field, one is generated for you. Item routes (/{id}) match against the id field inside the JSON, not the array position.",
  },
  {
    title: "PATCH merges, PUT replaces",
    body: "PATCH updates only the fields you send; PUT on an item replaces the entire object, dropping any fields you omit.",
  },
  {
    title: "Resources are public by default",
    body: "Anyone with the URL can read a resource. Mark a resource as private from the dashboard to require an API key for reads too.",
  },
  {
    title: "Validation happens on write",
    body: "Only valid JSON is stored. Invalid payloads are rejected with 400 Bad Request before anything is saved.",
  },
  {
    title: "CORS is open",
    body: "Endpoints can be called directly from browsers, mobile apps, and CI/CD pipelines with no proxy needed.",
  },
];

export const STATUS_CODES = [
  { code: "200 OK", desc: "Successful read, update, or delete." },
  { code: "201 Created", desc: "Item appended via POST." },
  { code: "204 No Content", desc: "OPTIONS preflight succeeded." },
  { code: "400 Bad Request", desc: "Invalid JSON body or malformed request." },
  { code: "401 Unauthorized", desc: "Missing or invalid API key on a write." },
  { code: "404 Not Found", desc: "Unknown resource, owner, or item id." },
  {
    code: "413 Payload Too Large",
    desc: "JSON exceeds the per-resource size limit.",
  },
  {
    code: "429 Too Many Requests",
    desc: "Rate limit exceeded; retry after the Retry-After header.",
  },
];
