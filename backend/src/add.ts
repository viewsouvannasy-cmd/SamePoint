import express from "express";

import errorHandler from "./middleware/errorHandler.js";
import notFoundHandler from "./middleware/notFoundHandler.js";

import authRoute from "./routes/auth-route.js";

const app = express();

app.use(express.json());

app.get("/healthz", (req, res) => res.send("Ready"));

app.use("/api/v1/auth", authRoute);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
