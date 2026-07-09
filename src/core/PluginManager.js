// src/core/PluginManager.js

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export default class PluginManager {
  constructor(pluginDir = "./src/plugins") {
    this.pluginDir = path.resolve(pluginDir);

    this.plugins = new Map();
    this.aliases = new Map();
    this.categories = new Map();
  }

  async load() {
    this.plugins.clear();
    this.aliases.clear();
    this.categories.clear();

    const files = this.scan(this.pluginDir);

    for (const file of files) {
      try {
        const plugin = await this.importPlugin(file);

        if (!plugin) continue;

        this.validate(plugin, file);

        if (this.plugins.has(plugin.name)) {
          throw new Error(`Duplicate plugin "${plugin.name}"`);
        }

        this.plugins.set(plugin.name, plugin);

        for (const alias of plugin.aliases) {
          this.aliases.set(alias, plugin.name);
        }

        if (!this.categories.has(plugin.category)) {
          this.categories.set(plugin.category, []);
        }

        this.categories.get(plugin.category).push(plugin);

        console.log(`✓ ${plugin.name}`);

      } catch (err) {
        console.error(`✗ ${file}`);
        console.error(err.message);
      }
    }

    console.log(`Loaded ${this.plugins.size} plugins.`);
  }

  scan(dir) {
    let files = [];

    if (!fs.existsSync(dir)) return files;

    for (const item of fs.readdirSync(dir)) {
      const full = path.join(dir, item);

      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        files.push(...this.scan(full));
      } else if (item.endsWith(".js")) {
        files.push(full);
      }
    }

    return files;
  }

  async importPlugin(file) {
    const module = await import(
      pathToFileURL(file).href + "?update=" + Date.now()
    );

    return module.default;
  }

  validate(plugin, file) {
    if (!plugin.name)
      throw new Error(`${file} missing name`);

    if (typeof plugin.execute !== "function")
      throw new Error(`${file} missing execute()`);

    plugin.aliases ??= [];
    plugin.category ??= "General";
    plugin.description ??= "";
    plugin.cooldown ??= 0;

    plugin.owner ??= false;
    plugin.admin ??= false;
    plugin.group ??= false;
    plugin.private ??= false;
  }

  get(command) {

    if (this.plugins.has(command))
      return this.plugins.get(command);

    const alias = this.aliases.get(command);

    if (!alias) return null;

    return this.plugins.get(alias);
  }

  getAll() {
    return [...this.plugins.values()];
  }

  getCategories() {
    return this.categories;
  }

  has(command) {
    return !!this.get(command);
  }

  reload() {
    return this.load();
  }

}
