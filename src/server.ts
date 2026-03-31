import app, { PORT } from "./app";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

main();
