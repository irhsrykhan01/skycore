// src/core/Logger.js

import pino from "pino";

export default class Logger {
  constructor(options = {}) {
    this.logger = pino({
      level: options.level || "info",
      transport: process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss",
              ignore: "pid,hostname"
            }
          }
        : undefined
    });
  }

  info(message, ...args) {
    this.logger.info(message, ...args);
  }

  success(message, ...args) {
    this.logger.info(`✅ ${message}`, ...args);
  }

  warn(message, ...args) {
    this.logger.warn(`⚠️ ${message}`, ...args);
  }

  error(message, ...args) {
    this.logger.error(`❌ ${message}`, ...args);
  }

  debug(message, ...args) {
    this.logger.debug(message, ...args);
  }

  fatal(message, ...args) {
    this.logger.fatal(`💀 ${message}`, ...args);
  }

  child(bindings = {}) {
    return this.logger.child(bindings);
  }
}
