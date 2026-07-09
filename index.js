import { startClient } from "./src/core/client.js";

startClient().catch((err) => {
  console.error("❌ Failed to start StarCore:", err);
  process.exit(1);
});
