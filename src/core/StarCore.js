// src/core/StarCore.js
import { EventEmitter } from "node:events";
import dotenv from "dotenv";
import { createClient } from "./Client.js";

dotenv.config();

const DEFAULTS = {
  botName: process.env.BOT_NAME || "StarCore",
  prefix: process.env.PREFIX || ".",
  owner: process.env.OWNER || "",
  sessionDir: process.env.SESSION_DIR || "./session",
  logLevel: process.env.LOG_LEVEL || "silent",
};

export default class StarCore extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      ...DEFAULTS,
      ...options,
    };

    this.client = null;
    this.started = false;
  }

  async start() {
    if (this.started) return this;

    this.emit("boot", this.options);

    this.client = await createClient(this.options);
    this.#bindClientEvents();

    this.started = true;
    this.emit("ready", this.client);

    return this;
  }

  async stop() {
    if (!this.client) return;

    try {
      if (typeof this.client.logout === "function") {
        await this.client.logout();
      }
    } catch (error) {
      this.emit("error", error);
    } finally {
      this.client = null;
      this.started = false;
      this.emit("stopped");
    }
  }

  getClient() {
    return this.client;
  }

  getConfig() {
    return { ...this.options };
  }

  #bindClientEvents() {
    if (!this.client?.ev) return;

    this.client.ev.on("connection.update", (update) => {
      this.emit("connection.update", update);
    });

    this.client.ev.on("messages.upsert", (payload) => {
      this.emit("messages.upsert", payload);
    });

    this.client.ev.on("creds.update", () => {
      this.emit("creds.update");
    });
  }
}
