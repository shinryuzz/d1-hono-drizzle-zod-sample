import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { todos } from "../drizzle/schema";
import { createTodoSchema, todoIdSchema, updateTodoSchema } from "./types/todo";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("api");

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// Create TODO
app.post("/todos", zValidator("json", createTodoSchema), async (c) => {
  const { title } = await c.req.valid("json");
  const db = drizzle(c.env.DB);
  const id = crypto.randomUUID();
  const newTodo = await db
    .insert(todos)
    .values({ id, title })
    .returning()
    .get();

  return c.json(newTodo, 201);
});

// Read All TODOs
app.get("/todos", async (c) => {
  const db = drizzle(c.env.DB);
  const allTodos = await db.select().from(todos).all();

  return c.json(allTodos, 200);
});

// Read Single TODO
app.get("/todos/:id", zValidator("param", todoIdSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.valid("param").id;
  const todo = await db.select().from(todos).where(eq(todos.id, id)).get();

  if (!todo) {
    return c.text("Not Found", 404);
  }

  return c.json(todo, 200);
});

// Update TODO
app.put(
  "/todos/:id",
  zValidator("param", todoIdSchema),
  zValidator("json", updateTodoSchema),
  async (c) => {
    const db = drizzle(c.env.DB);
    const id = c.req.param("id");
    const body = await c.req.valid("json");

    const updatedTodo = await db
      .update(todos)
      .set(body)
      .where(eq(todos.id, id))
      .returning()
      .get();

    if (!updatedTodo) {
      return c.text("Not Found", 404);
    }

    return c.json(updatedTodo, 200);
  }
);

// Delete TODO
app.delete("/todos/:id", zValidator("param", todoIdSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.valid("param").id;

  const deletedTodo = await db
    .delete(todos)
    .where(eq(todos.id, id))
    .returning()
    .get();

  if (!deletedTodo) {
    return c.text("Not Found", 404);
  }

  return c.newResponse(null, { status: 204 });
});

export default app;
