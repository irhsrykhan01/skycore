// src/core/Client.js

import fs from "node:fs";
import path from "node:path";

import pino from "pino";

import makeWASocket, {
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    DisconnectReason
} from "@whiskeysockets/baileys";

export async function createClient(core) {

    const config = core.getConfig();

    const sessionDir = path.resolve(config.sessionDir);

    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }

    const { state, saveCreds } =
        await useMultiFileAuthState(sessionDir);

    const { version } =
        await fetchLatestBaileysVersion();

    const sock = makeWASocket({

        version,

        auth: state,

        logger: pino({
            level: "silent"
        }),

        browser: [
            config.botName,
            "Chrome",
            "1.0.0"
        ],

        markOnlineOnConnect: false

    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {

        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            core.logger.info("Scan QR untuk login.");
        }

        if (connection === "open") {

            core.logger.success("WhatsApp Connected.");

        }

        if (connection === "close") {

            const code =
                lastDisconnect?.error?.output?.statusCode;

            if (code !== DisconnectReason.loggedOut) {

                core.logger.warn("Reconnect...");

                return createClient(core);

            }

            core.logger.error("Session Logged Out.");

        }

    });

    sock.ev.on("messages.upsert", async ({ messages, type }) => {

        if (type !== "notify") return;

        const msg = messages?.[0];

        if (!msg) return;

        await core.handler.handle(msg);

    });

    return sock;

}

export default createClient;
