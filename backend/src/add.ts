import express from "express";

const app = express();

app.get("/healthz", (req, res) => res.send("Ready"));

export default app;
