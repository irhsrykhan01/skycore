// src/core/Context.js

export default class Context {
  constructor(core, client, message, parsed) {
    this.core = core;
    this.client = client;

    this.message = message;
    this.parsed = parsed;

    this.chat = parsed.chat;
    this.sender = parsed.sender;

    this.command = parsed.command;
    this.args = parsed.args;

    this.text = parsed.text;
    this.body = parsed.body;

    this.isGroup = parsed.isGroup;
    this.quoted = parsed.quoted;
  }

  reply(text, options = {}) {
    return this.client.sendMessage(
      this.chat,
      {
        text,
        ...options
      }
    );
  }

  send(content) {
    return this.client.sendMessage(
      this.chat,
      content
    );
  }

  react(emoji) {
    return this.client.sendMessage(
      this.chat,
      {
        react: {
          text: emoji,
          key: this.message.key
        }
      }
    );
  }

  typing() {
    return this.client.sendPresenceUpdate(
      "composing",
      this.chat
    );
  }

  read() {
    return this.client.readMessages([
      this.message.key
    ]);
  }

}
