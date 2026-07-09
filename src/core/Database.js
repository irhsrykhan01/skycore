// src/core/Database.js

import fs from "node:fs";
import path from "node:path";

export default class Database {
  constructor(directory = "./database") {
    this.directory = path.resolve(directory);

    this.files = {
      users: "users.json",
      groups: "groups.json",
      settings: "settings.json"
    };

    this.data = {};
  }

  async init() {
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }

    for (const [key, file] of Object.entries(this.files)) {
      const filePath = path.join(this.directory, file);

      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{}");
      }

      this.data[key] = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );
    }

    return this;
  }

  get(collection, id) {
    return this.data[collection]?.[id];
  }

  set(collection, id, value) {
    this.data[collection][id] = value;
  }

  has(collection, id) {
    return id in this.data[collection];
  }

  delete(collection, id) {
    delete this.data[collection][id];
  }

  async save(collection) {
    const file = this.files[collection];

    if (!file) return;

    fs.writeFileSync(
      path.join(this.directory, file),
      JSON.stringify(this.data[collection], null, 2)
    );
  }

  async saveAll() {
    for (const collection of Object.keys(this.files)) {
      await this.save(collection);
    }
  }
    }
