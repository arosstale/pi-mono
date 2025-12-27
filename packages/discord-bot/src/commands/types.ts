/**
 * Command Handler Types
 *
 * SRP: Types separated from implementation
 * OCP: New commands extend without modifying core
 */

import type {
	ChatInputCommandInteraction,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/**
 * Command handler interface - each command implements this
 */
export interface CommandHandler {
	/** Command name (matches slash command) */
	name: string;

	/** Command definition for Discord */
	definition:
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

	/** Execute the command */
	execute: (
		interaction: ChatInputCommandInteraction,
		context: CommandContext,
	) => Promise<void>;

	/** Optional: Check if command is available */
	isAvailable?: () => boolean;

	/** Optional: Command category for organization */
	category?: CommandCategory;
}

/**
 * Context passed to command handlers
 */
export interface CommandContext {
	/** Data directory for bot */
	dataDir: string;

	/** Channel-specific data directory */
	channelDir: string;

	/** Database instance */
	db: unknown; // Will be typed properly when integrated

	/** User ID */
	userId: string;

	/** Channel ID */
	channelId: string;

	/** Guild ID (if in a server) */
	guildId?: string;
}

/**
 * Command categories for organization
 */
export type CommandCategory =
	| "core" // ask, bash, read, etc.
	| "memory" // remember, forget, memory
	| "trading" // trading, papertrade, signals
	| "agents" // expert, openhands, daemon
	| "voice" // voice, livekit
	| "admin" // admin, provider, model
	| "utilities"; // health, status, tools
