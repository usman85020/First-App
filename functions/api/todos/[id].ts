interface Env {
  DB: D1Database;
}

// Main handler for requests to /api/todos/[id]
export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  // `params.id` contains the ID from the URL
  const todoId = params.id as string;

  if (!todoId) {
    return new Response("ID parameter is missing", { status: 400 });
  }

  try {
    switch (request.method) {
      case "PUT": // Or PATCH
        return await handleUpdate(request, env.DB, todoId);
      case "DELETE":
        return await handleDelete(env.DB, todoId);
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  } catch (e) {
    console.error(e);
    return new Response("Internal Server Error", { status: 500 });
  }
};

// Handles PUT requests to update a todo (e.g., mark as done)
const handleUpdate = async (request: Request, db: D1Database, id: string) => {
  const body = await request.json<{ title?: string; done?: boolean }>();

  // For this example, we only allow updating the 'done' status
  const isDone = body.done === true ? 1 : 0; // Convert boolean to integer for D1

  const { success } = await db.prepare(
    "UPDATE todos SET done = ?1 WHERE id = ?2"
  ).bind(isDone, id).run();

  if (success) {
    return new Response(JSON.stringify({ message: `Todo ${id} updated.` }), {
      headers: { "content-type": "application/json" }
    });
  } else {
    return new Response(`Failed to update todo ${id}`, { status: 500 });
  }
};

// Handles DELETE requests
const handleDelete = async (db: D1Database, id: string) => {
  const { success } = await db.prepare(
    "DELETE FROM todos WHERE id = ?1"
  ).bind(id).run();

  if (success) {
    // Return 204 No Content for a successful deletion with no body
    return new Response(null, { status: 204 });
  } else {
    return new Response(`Failed to delete todo ${id}`, { status: 500 });
  }
};
