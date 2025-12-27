/**
 * Core Module
 *
 * SRP: Aggregates core bot functionality
 * Facade Pattern: Simple interface for complex subsystems
 *
 * Usage:
 *   import { createBot, startBot } from "./core/index.js";
 *   const bot = createBot();
 *   await startBot(bot);
 */

// Configuration
export { loadConfig, validateConfig, type BotConfig } from "./config.js";

// Client factory
export { createClient, createDefaultClient, type ClientOptions } from "./client.js";

import type { Client } from "discord.js";
import { loadConfig, validateConfig, type BotConfig } from "./config.js";
import { createDefaultClient } from "./client.js";

/**
 * Bot instance with configuration
 */
export interface Bot {
	client: Client;
	config: BotConfig;
}

/**
 * Create a bot instance
 * Factory Pattern: Creates fully configured bot
 */
export function createBot(): Bot {
	const config = loadConfig();

	// Validate configuration
	const errors = validateConfig(config);
	if (errors.length > 0) {
		console.error("[Bot] Configuration errors:");
		errors.forEach((err) => console.error(`  - ${err}`));
		throw new Error("Invalid configuration");
	}

	const client = createDefaultClient();

	return { client, config };
}

/**
 * Start the bot
 */
export async function startBot(bot: Bot): Promise<void> {
	console.log("[Bot] Starting...");

	// Login to Discord
	await bot.client.login(bot.config.token);

	console.log("[Bot] Connected to Discord");
}

/**
 * Stop the bot gracefully
 */
export async function stopBot(bot: Bot): Promise<void> {
	console.log("[Bot] Stopping...");
	bot.client.destroy();
	console.log("[Bot] Stopped");
}
