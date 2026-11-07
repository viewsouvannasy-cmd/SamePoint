import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => res.send("ready"));

export default app;
