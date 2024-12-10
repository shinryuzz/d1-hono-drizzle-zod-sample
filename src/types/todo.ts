import { z } from "zod";
import { todos } from "../../drizzle/schema";
import { createInsertSchema } from "drizzle-zod";

const insertTodoSchema = createInsertSchema(todos, {
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(100, "タイトルは100文字以内にしてください"),
  isCompleted: z.boolean(),
});

export const createTodoSchema = insertTodoSchema.pick({ title: true });
export const updateTodoSchema = insertTodoSchema.pick({
  title: true,
  isCompleted: true,
});
export const todoIdSchema = insertTodoSchema.pick({ id: true });
