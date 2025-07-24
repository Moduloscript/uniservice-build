import { Hono } from "hono";
import dashboard from "./dashboard";
import bookings from "./bookings";

const app = new Hono();

// Mount student routes
app.route("/dashboard", dashboard);
app.route("/bookings", bookings);

export default app;
