// library
import { neon } from "@neondatabase/serverless";

// untils
import { getEnv } from "../utils/getEnv.js";

const read_sql = neon(getEnv("NEON_READ_URL"));
const write_sql = neon(getEnv("NEON_WRITE_URL"));

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => {
      return resolve();
    }, ms);
  });

const connectDB = async (retry = 0, ms = 0) => {
  const maxRetries = 5;
  try {
    console.time("connect-time");
    const [connectReadDB] = await read_sql`SELECT NOW()`;
    const [connectWriteDB] = await write_sql`SELECT NOW()`;
    console.timeEnd("connect-time");

    console.log("Neon Read DB Connected", connectReadDB.now);
    console.log("Neon Write DB Connected", connectWriteDB.now);
  } catch (error) {
    console.log(
      `Error To NeonDB (retry ${retry}/${maxRetries} ms: ${ms})`,
      error,
    );

    if (retry === maxRetries) {
      console.error("Cannot Connect To NeonDB, Exiting.");
      process.exit(1);
    }

    await wait(ms);
    return await connectDB(retry + 1, ms + 5000);
  }
};

export { read_sql, write_sql, connectDB };
