export const onRequestGet: PagesFunction = async ({ env }) => {
await env.DB.exec( CREATE TABLE IF NOT EXISTS todos ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0 ); );
const { results } = await env.DB.prepare(
"SELECT id, title, done FROM todos ORDER BY id DESC"
).all();
return new Response(JSON.stringify(results), {
headers: { "content-type": "application/json" }
});
};
export const onRequestPost: PagesFunction = async ({ request, env }) => {
const body = await request.json().catch(() => ({}));
const title = (body?.title || "").toString().trim();
if (!title) {
return new Response(JSON.stringify({ error: "Title is required" }), {
status: 400,
headers: { "content-type": "application/json" }
});
}
