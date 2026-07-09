// src/plugins/system/ping.js

export default {
  name: "ping",

  aliases: [
    "p"
  ],

  category: "System",

  description: "Check bot response speed.",

  cooldown: 3,

  owner: false,

  admin: false,

  group: false,

  private: false,


  async execute(ctx) {

    const start = Date.now();


    await ctx.reply("🏓 Pong!");


    const latency =
      Date.now() - start;


    await ctx.reply(
      `⚡ Response: ${latency}ms`
    );

  }
};
