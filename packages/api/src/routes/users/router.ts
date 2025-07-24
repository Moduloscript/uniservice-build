import { Hono } from "hono";
import meRouter from "./me";

const app = new Hono();

// Mount the me router at /users/me
app.route("/users/me", meRouter);

export { app as usersRouter };
