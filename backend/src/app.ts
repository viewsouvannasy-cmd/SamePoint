// library
import express from "express";

// routes
import oauthRoute from "./routes/oauth-route.js";
import authRoute from "./routes/auth-route.js";

// middleware
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";

const app = express();

app.use(express.json());

// health check
app.get("/health", (req, res) => res.send("ready"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/oauth", oauthRoute);

app.use(errorHandler);
app.use(notFoundHandler);

export default app;
