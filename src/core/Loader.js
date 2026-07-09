// src/core/Loader.js

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export default class Loader {
  constructor(pluginDir = "./src/plugins") {
    this.pluginDir = path.resolve(pluginDir);

    this.plugins = new Map();
    this.aliases = new Map();
  }

  async load() {
    this.plugins.clear();
    this.aliases.clear();

    const files = this.scan(this.pluginDir);

    for (const file of files) {
      try {
        const plugin = await this.importPlugin(file);

        if (!plugin) continue;

        this.validate(plugin, file);

        if (this.plugins.has(plugin.name)) {
          throw new Error(`Duplicate plugin: ${plugin.name}`);
        }

        this.plugins.set(plugin.name, plugin);

        if (Array.isArray(plugin.aliases)) {
          for (const alias of plugin.aliases) {
            this.aliases.set(alias, plugin.name);
          }
        }

        console.log(`✓ Loaded ${plugin.name}`);

      } catch (err) {
        console.error(`✗ ${file}`);
        console.error(err.message);
      }
    }

    console.log(`\nLoaded ${this.plugins.size} plugin(s)\n`);
  }

  scan(dir) {
    let result = [];

    const items = fs.readdirSync(dir);

    for (const item of items) {
      const full = path.join(dir, item);

      const stat = fs.statSync(full);

      if (stat.isDirectory()) {
        result.push(...this.scan(full));
      }

      else if (item.endsWith(".js")) {
        result.push(full);
      }
    }

    return result;
  }

  async importPlugin(file) {
    const module = await import(
      pathToFileURL(file).href + `?update=${Date.now()}`
    );

    return module.default;
  }

  validate(plugin, file) {

    if (!plugin.name) {
      throw new Error(`${file} missing "name"`);
    }

    if (typeof plugin.execute !== "function") {
      throw new Error(`${file} missing "execute()"`);
    }

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

  has(command) {
    return !!this.get(command);
  }

      }
