// src/core/Handler.js
export default class Handler {
  constructor(core, options = {}) {
    this.core = core;
    this.prefix = options.prefix || core?.getConfig?.()?.prefix || ".";
    this.plugins = options.plugins || new Map();
  }

  setPlugins(pluginMap) {
    this.plugins = pluginMap instanceof Map ? pluginMap : new Map();
  }

  getClient() {
    return this.core?.getClient?.();
  }

  parseMessage(message) {
    const msg = message?.message || {};
    const text =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      "";

    const body = text.trim();
    const isCommand = body.startsWith(this.prefix);
    const withoutPrefix = isCommand ? body.slice(this.prefix.length).trim() : body;
    const [commandRaw, ...args] = withoutPrefix.split(/\s+/);
    const command = (commandRaw || "").toLowerCase();

    return {
      body,
      text,
      isCommand,
      command,
      args,
      sender: message?.key?.participant || message?.key?.remoteJid || "",
      chat: message?.key?.remoteJid || "",
      fromMe: !!message?.key?.fromMe,
      isGroup: (message?.key?.remoteJid || "").endsWith("@g.us"),
      quoted:
        msg.extendedTextMessage?.contextInfo?.quotedMessage ||
        msg.imageMessage?.contextInfo?.quotedMessage ||
        msg.videoMessage?.contextInfo?.quotedMessage ||
        null,
      raw: message,
    };
  }

  async handle(message) {
    const client = this.getClient();
    if (!client) return;

    if (!message || message.key?.fromMe) return;

    const parsed = this.parseMessage(message);
    if (!parsed.text) return;

    const ctx = this.createContext(client, parsed);

    if (!parsed.isCommand) return;

    const plugin = this.findPlugin(parsed.command);

    if (plugin?.execute && typeof plugin.execute === "function") {
      try {
        await plugin.execute(ctx);
      } catch (error) {
        console.error(`❌ Plugin error in "${parsed.command}":`, error);
        await ctx.reply("Terjadi error saat menjalankan command.");
      }
      return;
    }

    if (parsed.command === "ping") {
      await ctx.reply("Pong! 🚀");
      return;
    }

    await ctx.reply(`Command "${parsed.command}" belum tersedia.`);
  }

  findPlugin(command) {
    if (!command) return null;

    for (const plugin of this.plugins.values()) {
      const names = [
        plugin?.name,
        ...(Array.isArray(plugin?.aliases) ? plugin.aliases : []),
      ]
        .filter(Boolean)
        .map((name) => String(name).toLowerCase());

      if (names.includes(command)) {
        return plugin;
      }
    }

    return null;
  }

  createContext(client, parsed) {
    const reply = async (text, options = {}) => {
      return client.sendMessage(parsed.chat, { text, ...options });
    };

    const send = async (content, options = {}) => {
      return client.sendMessage(parsed.chat, { ...content, ...options });
    };

    return {
      bot: this.core,
      client,
      prefix: this.prefix,
      command: parsed.command,
      args: parsed.args,
      text: parsed.text,
      body: parsed.body,
      sender: parsed.sender,
      chat: parsed.chat,
      isGroup: parsed.isGroup,
      quoted: parsed.quoted,
      raw: parsed.raw,
      reply,
      send,
    };
  }
          }
