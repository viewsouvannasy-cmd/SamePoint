// library
import express from "express";

// routes
import oauthRoute from "./routes/oauth-route.js";
import authRoute from "./routes/auth-route.js";
import refreshTokenRoute from "./routes/refresh-token-route.js";
import userRoute from "./routes/user-route.js";
import projectRoute from "./routes/project-route.js";

// middleware
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import verifyAccessToken from "./middlewares/token/verifyAccessToken.js";

const app = express();

app.use(express.json());

// health check
app.get("/health", (req, res) => res.send("ok"));

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/oauth", oauthRoute);
app.use("/api/v1/refresh-token", refreshTokenRoute);

app.use("/api/v1/user", verifyAccessToken, userRoute);
app.use("/api/v1/project", verifyAccessToken, projectRoute);

app.use(errorHandler);
app.use(notFoundHandler);

export default app;
