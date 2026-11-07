// configs
import { connectDB } from "./configs/database.js";

import { getEnv } from "./utils/getEnv.js";

import app from "./app.js";

const server = async () => {
  try {
    await connectDB();

    const port = getEnv("PORT");

    app.listen(port, () => {
      console.log(`Mode = ${getEnv("NODE_ENV")}`);
      console.log(`Server is live on port:${port}`);
    });
  } catch (error) {
    console.log("Server error", error);
  }
};

server();
