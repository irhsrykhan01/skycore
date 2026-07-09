// src/core/Client.js
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import pino from "pino";
import makeWASocket, {
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

dotenv.config();

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export async function createClient(options = {}) {
  const sessionDir = path.resolve(
    options.sessionDir || process.env.SESSION_DIR || "./session"
  );

  ensureDir(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const logger = pino({
    level: options.logLevel || process.env.LOG_LEVEL || "silent",
  });

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: options.printQRInTerminal ?? true,
    browser: options.browser || ["StarCore", "Chrome", "1.0.0"],
    markOnlineOnConnect: options.markOnlineOnConnect ?? false,
    syncFullHistory: options.syncFullHistory ?? false,
    generateHighQualityLinkPreview:
      options.generateHighQualityLinkPreview ?? false,
  });

  sock.ev.on("creds.update", saveCreds);

  return sock;
}

export default createClient;
