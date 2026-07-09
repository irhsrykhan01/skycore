import StarCore from "./src/core/StarCore.js";

async function main() {
  try {
    const bot = new StarCore();
    await bot.start();
  } catch (error) {
    console.error("❌ StarCore failed to start:", error);
    process.exit(1);
  }
}

main();
