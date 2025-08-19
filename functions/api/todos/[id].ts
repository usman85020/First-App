interface Env { DB: D1Database }
export const onRequestPatch: PagesFunction<Env> = async ({ params, env }) => {
const id = Number(params?.id);
if (!id) return new Response("Bad id", { status: 400 });
await env.DB.exec( CREATE TABLE IF NOT EXISTS todos ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0 ); );
await env.DB.prepare("UPDATE todos SET done = 1 - done WHERE id = ?1")
.bind(id)
.run();
return new Response(JSON.stringify({ ok: true }), {
headers: { "content-type": "application/json" }
});
};
export const onRequestDelete: PagesFunction<Env> = async ({ params, env }) => {
const id = Number(params?.id);
if (!id) return new Response("Bad id", { status: 400 });
await env.DB.exec( CREATE TABLE IF NOT EXISTS todos ( id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0 ); );
await env.DB.prepare("DELETE FROM todos WHERE id = ?1")
.bind(id)
.run();
return new Response(JSON.stringify({ ok: true }), {
headers: { "content-type": "application/json" }
});
};
