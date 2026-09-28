export const HOST = "https://jsonlive.example";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

export type Endpoint = {
  method: HttpMethod;
  path: string;
  desc: string;
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

export const SAMPLE_DATA = `[
  { "id": 1, "name": "Revan", "role": "Developer" },
  { "id": 2, "name": "Budi", "role": "Designer" }
]`;

export const CONSUME_EXAMPLE = `// Any framework works — this is plain fetch, no SDK needed.
const res = await fetch("${HOST}/api/revan/users");

if (!res.ok) {
  throw new Error("Request failed: " + res.status);
}

const users = await res.json();
console.log(users);`;

export const COLLECTION_ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/:username/:resource",
    desc: "Read the resource. Objects are returned as-is, arrays return every item.",
    status: "200 / 401 / 404",
  },
  {
    method: "POST",
    path: "/api/:username/:resource",
    desc: "Append an item to an array resource. Generates an id when the body omits one.",
    status: "201 / 400 / 401",
  },
  {
    method: "PUT",
    path: "/api/:username/:resource",
    desc: "Replace the whole collection with the array sent in the body.",
    status: "200 / 400 / 401",
  },
  {
    method: "OPTIONS",
    path: "/api/:username/:resource",
    desc: "CORS preflight for browser clients.",
    status: "204",
  },
];

export const ITEM_ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/:username/:resource/:id",
    desc: "Read one item by its id field.",
    status: "200 / 400 / 404",
  },
  {
    method: "PUT",
    path: "/api/:username/:resource/:id",
    desc: "Replace one item. Fields absent from the body are removed.",
    status: "200 / 400 / 404",
  },
  {
    method: "PATCH",
    path: "/api/:username/:resource/:id",
    desc: "Merge fields into one item. Only the sent keys change.",
    status: "200 / 400 / 404",
  },
  {
    method: "DELETE",
    path: "/api/:username/:resource/:id",
    desc: "Remove one item from the collection.",
    status: "200 / 400 / 404",
  },
  {
    method: "OPTIONS",
    path: "/api/:username/:resource/:id",
    desc: "CORS preflight for browser clients.",
    status: "204",
  },
];

export const EXAMPLES: DocExample[] = [
  {
    step: "1",
    title: "Read the whole collection",
    method: "GET",
    path: `${HOST}/api/revan/users`,
    summary: "No key needed. Anyone can call this URL and gets the full array back.",
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
  -H "x-api-key: jlv_..." \\
  -d '{ "name": "Siti", "role": "QA" }'`,
    js: `const res = await fetch("${HOST}/api/revan/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
  },
  body: JSON.stringify({ name: "Siti", role: "QA" }),
});

const created = await res.json(); // 201, includes the generated id`,
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
  -H "x-api-key: jlv_..." \\
  -d '{ "role": "Senior Developer" }'`,
    js: `await fetch("${HOST}/api/revan/users/1", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
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
  -H "x-api-key: jlv_..." \\
  -d '{ "id": 1, "name": "Revan" }'`,
    js: `await fetch("${HOST}/api/revan/users/1", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
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
    summary: "The entry is removed from the array. A fresh GET confirms it is gone.",
    note: "Needs an API key.",
    curl: `curl -X DELETE ${HOST}/api/revan/users/1 \\
  -H "x-api-key: jlv_..."`,
    js: `const res = await fetch("${HOST}/api/revan/users/1", {
  method: "DELETE",
  headers: { "x-api-key": "jlv_..." },
});

const result = await res.json(); // { "success": true }`,
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
  -H "x-api-key: jlv_..." \\
  -d '[
    { "id": 1, "name": "Revan", "role": "Developer" },
    { "id": 2, "name": "Budi", "role": "Designer" }
  ]'`,
    js: `await fetch("${HOST}/api/revan/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "jlv_...",
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

export const BEHAVIOR_NOTES = [
  "Only published resources are reachable. Unpublished ones answer with 404.",
  "A private resource only serves GET to its owner session. Public data needs no login at all.",
  "Item routes (:id) require an array resource whose entries carry an id field.",
  "POST and PUT on a collection require an array body; POST and PUT on an item require an object body.",
  "POST generates the next numeric id, or a UUID when the collection has no numeric ids.",
  "Every public response ships Access-Control-Allow-Origin: * so browsers can call it from any origin.",
];

export const STATUS_CODES = [
  { code: "200 OK", desc: "Request succeeded." },
  { code: "201 Created", desc: "POST created a new item." },
  { code: "204 No Content", desc: "OPTIONS preflight succeeded." },
  {
    code: "400 Bad Request",
    desc: "Malformed JSON, or a body shape the route does not accept.",
  },
  {
    code: "401 Unauthorized",
    desc: "Write request without a valid API key, or GET on a private resource.",
  },
  { code: "404 Not Found", desc: "Unknown username, resource, or item id." },
  {
    code: "429 Too Many Requests",
    desc: "Rate limit reached. See the Retry-After header.",
  },
];
