// src/core/StarCore.js

import { EventEmitter } from "node:events";
import dotenv from "dotenv";

import Logger from "./Logger.js";
import Database from "./Database.js";
import PluginManager from "./PluginManager.js";
import Commands from "./Commands.js";
import Handler from "./Handler.js";
import { createClient } from "./Client.js";

dotenv.config();

export default class StarCore extends EventEmitter {
  constructor(options = {}) {
    super();

    this.options = {
      botName: process.env.BOT_NAME || "StarCore",
      prefix: process.env.PREFIX || ".",
      owner: process.env.OWNER || "",
      sessionDir: process.env.SESSION_DIR || "./session",
      pluginDir: "./src/plugins",
      databaseDir: "./database",
      ...options
    };

    this.logger = new Logger();

    this.database = new Database(
      this.options.databaseDir
    );

    this.pluginManager = new PluginManager(
      this.options.pluginDir
    );

    this.commands = new Commands(this);

    this.handler = new Handler(this);

    this.client = null;

    this.started = false;
  }

  async start() {
    if (this.started) return this;

    this.logger.info("Starting StarCore...");

    await this.database.init();

    await this.pluginManager.load();

    this.client = await createClient(this.options);

    this.started = true;

    this.logger.success("StarCore initialized.");

    this.emit("ready");

    return this;
  }

  async stop() {
    if (!this.client) return;

    try {
      if (typeof this.client.logout === "function") {
        await this.client.logout();
      }

      await this.database.saveAll();

      this.logger.info("Database saved.");

    } catch (error) {
      this.logger.error(error);
    }

    this.started = false;

    this.emit("stopped");
  }

  getClient() {
    return this.client;
  }

  getConfig() {
    return this.options;
  }
}
