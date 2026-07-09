// src/core/Commands.js

export default class Commands {
  constructor(core) {
    this.core = core;
  }

  /**
   * Execute a command
   * @param {Context} ctx
   */
  async execute(ctx) {
    const pluginManager = this.core.pluginManager;

    if (!pluginManager) {
      throw new Error("PluginManager is not initialized.");
    }

    const command = ctx.command.toLowerCase();

    const plugin = pluginManager.get(command);

    if (!plugin) {
      return ctx.reply(
        `❌ Command "${command}" tidak ditemukan.`
      );
    }

    // Owner Only
    if (plugin.owner && !ctx.isOwner) {
      return ctx.reply("❌ Command ini hanya untuk Owner.");
    }

    // Admin Only
    if (plugin.admin && !ctx.isAdmin) {
      return ctx.reply("❌ Command ini hanya untuk Admin.");
    }

    // Group Only
    if (plugin.group && !ctx.isGroup) {
      return ctx.reply("❌ Command ini hanya bisa digunakan di Grup.");
    }

    // Private Only
    if (plugin.private && ctx.isGroup) {
      return ctx.reply("❌ Command ini hanya bisa digunakan di Private Chat.");
    }

    try {
      await plugin.execute(ctx);
    } catch (error) {
      this.core.logger.error(
        `Command "${plugin.name}" failed.`,
        error
      );

      await ctx.reply(
        "❌ Terjadi kesalahan saat menjalankan command."
      );
    }
  }

  /**
   * Get plugin by name
   */
  get(command) {
    return this.core.pluginManager.get(command);
  }

  /**
   * Check plugin exists
   */
  has(command) {
    return this.core.pluginManager.has(command);
  }

  /**
   * Get all plugins
   */
  list() {
    return this.core.pluginManager.getAll();
  }

  /**
   * Get categories
   */
  categories() {
    return this.core.pluginManager.getCategories();
  }
  }
