// Define the shape of a Todo item for TypeScript
interface Todo {
  id: number;
  title: string;
  done: number; // D1 uses 0 for false, 1 for true
}

// Define the environment bindings, including the D1 database
interface Env {
  DB: D1Database;
}

// A helper function to ensure the table exists
const ensureTableExists = async (db: D1Database) => {
  await db.exec(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  );`);
};

// Main handler for all requests to this route
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Make sure the table exists before any operation
    await ensureTableExists(env.DB);

    switch (request.method) {
      case "GET":
        return await handleGet(env.DB);
      case "POST":
        return await handlePost(request, env.DB);
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  } catch (e) {
    // Catch any unexpected errors
    console.error(e);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// Handles GET requests
const handleGet = async (db: D1Database) => {
  const { results } = await db.prepare(
    "SELECT id, title, done FROM todos ORDER BY id DESC"
  ).all<Todo>();

  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" }
  });
};

// Handles POST requests
const handlePost = async (request: Request, db: D1Database) => {
  let body;
  try {
    body = await request.json<{ title?: string }>();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const title = (body?.title || "").trim();

  if (!title) {
    return new Response(JSON.stringify({ error: "Title is required" }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  // Insert the new todo and return it
  const { results } = await db.prepare(
    "INSERT INTO todos (title, done) VALUES (?1, 0) RETURNING *"
  ).bind(title).all<Todo>();

  const newTodo = results[0];

  return new Response(JSON.stringify(newTodo), {
    status: 201, // 201 Created is more appropriate
    headers: { "content-type": "application/json" }
  });
};
