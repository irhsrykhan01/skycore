// src/core/Handler.js

import Context from "./Context.js";

export default class Handler {

  constructor(core) {
    this.core = core;
    this.prefix = core.getConfig().prefix;
  }


  async handle(message) {

    if (!message) return;

    if (message.key?.fromMe) return;


    const client = this.core.getClient();

    if (!client) return;


    const parsed = await this.parse(message);


    if (!parsed) return;


    const ctx = new Context(
      this.core,
      client,
      message,
      parsed
    );


    if (!ctx.isCommand) return;


    await this.core.commands.execute(ctx);

  }



  async parse(message) {

    const msg = message.message;

    if (!msg) return null;


    const text =
      msg.conversation ||
      msg.extendedTextMessage?.text ||
      msg.imageMessage?.caption ||
      msg.videoMessage?.caption ||
      "";


    const body = text.trim();


    const isCommand =
      body.startsWith(this.prefix);



    let command = "";

    let args = [];


    if (isCommand) {

      const content =
        body.slice(this.prefix.length).trim();


      const split =
        content.split(/\s+/);


      command =
        split.shift()?.toLowerCase() || "";


      args = split;

    }



    const chat =
      message.key.remoteJid;


    const sender =
      message.key.participant ||
      message.key.remoteJid;



    const isGroup =
      chat.endsWith("@g.us");



    return {

      text,

      body,

      command,

      args,

      isCommand,

      chat,

      sender,

      isGroup,

      fromMe:
        message.key.fromMe,


      quoted:
        this.getQuoted(msg),


      raw:
        message

    };

  }
    getQuoted(message) {

    return (
      message.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage ||
      message.imageMessage
        ?.contextInfo
        ?.quotedMessage ||
      message.videoMessage
        ?.contextInfo
        ?.quotedMessage ||
      null
    );

  }



  async checkOwner(sender) {

    const owner =
      this.core.getConfig().owner;


    if (!owner) return false;


    const cleanSender =
      sender.replace(/\D/g, "");


    const cleanOwner =
      owner.replace(/\D/g, "");


    return cleanSender.includes(cleanOwner);

  }




  async checkAdmin(client, chat, sender) {

    try {

      const metadata =
        await client.groupMetadata(chat);


      const participant =
        metadata.participants.find(
          p => p.id === sender
        );


      return (
        participant?.admin === "admin" ||
        participant?.admin === "superadmin"
      );


    } catch {

      return false;

    }

  }




  async checkBotAdmin(client, chat) {

    try {

      const metadata =
        await client.groupMetadata(chat);


      const bot =
        client.user.id.split(":")[0] +
        "@s.whatsapp.net";


      const participant =
        metadata.participants.find(
          p => p.id === bot
        );


      return (
        participant?.admin === "admin" ||
        participant?.admin === "superadmin"
      );


    } catch {

      return false;

    }

  }




  detectMedia(message) {

    const msg =
      message.message;


    if (!msg)
      return {
        type: null,
        hasMedia: false
      };


    if (msg.imageMessage) {

      return {
        type: "image",
        hasMedia: true
      };

    }


    if (msg.videoMessage) {

      return {
        type: "video",
        hasMedia: true
      };

    }


    if (msg.audioMessage) {

      return {
        type: "audio",
        hasMedia: true
      };

    }


    if (msg.documentMessage) {

      return {
        type: "document",
        hasMedia: true
      };

    }


    if (msg.stickerMessage) {

      return {
        type: "sticker",
        hasMedia: true
      };

    }


    return {
      type: null,
      hasMedia: false
    };

  }



}
