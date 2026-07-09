// src/events/messages.js

import Handler from "../core/Handler.js";

export default class MessagesEvent {
  constructor(core) {
    this.core = core;
    this.handler = new Handler(core);
  }

  /**
   * Register messages.upsert event
   * @param {import("@whiskeysockets/baileys").WASocket} client
   */
  register(client) {
    client.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type !== "notify") return;

      const message = messages?.[0];
      if (!message) return;

      try {
        await this.handler.handle(message);
      } catch (error) {
        console.error("[MessagesEvent]", error);
      }
    });
  }
}
