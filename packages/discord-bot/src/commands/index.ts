/**
 * Commands Module
 *
 * OCP: Add new commands by importing and adding to array
 * SRP: Each command in its own file
 *
 * Usage in main.ts:
 *   import { commandRegistry, registerAllCommands } from "./commands/index.js";
 *
 *   // Register all commands
 *   registerAllCommands();
 *
 *   // Get handler for a command
 *   const handler = commandRegistry.get(commandName);
 *   if (handler) {
 *     await handler.execute(interaction, context);
 *   }
 */

// Types
export type { CommandHandler, CommandContext, CommandCategory } from "./types.js";

// Registry
export { commandRegistry, defineCommand } from "./registry.js";
import { commandRegistry } from "./registry.js";

// Commands - import as we migrate them
import { healthCommand } from "./health.js";

/**
 * All migrated commands
 * Add new commands here as they are migrated from main.ts
 */
const commands = [
	healthCommand,
	// Add more commands as they are migrated:
	// askCommand,
	// bashCommand,
	// sandboxCommand,
	// etc.
];

/**
 * Register all commands with the registry
 */
export function registerAllCommands(): void {
	commandRegistry.registerAll(commands);
	console.log(`[Commands] Registered ${commandRegistry.size} commands`);
}

/**
 * Get command definitions for Discord registration
 * Use alongside existing slashCommands array during migration
 */
export function getMigratedDefinitions() {
	return commands.map((cmd) => cmd.definition);
}
