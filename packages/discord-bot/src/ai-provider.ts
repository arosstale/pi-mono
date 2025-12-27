/**
 * Central AI Provider - Z.AI GLM Integration
 *
 * Single source of truth for AI API calls across the bot.
 * Uses Z.AI GLM-4.7 (GLM Coding Plan subscription) for cost efficiency.
 *
 * OpenAI-compatible API - can fallback to other providers if needed.
 */

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export interface ChatOptions {
	messages: ChatMessage[];
	model?: string;
	maxTokens?: number;
	temperature?: number;
	stream?: boolean;
}

export interface ChatResult {
	success: boolean;
	content: string;
	error?: string;
	model: string;
	usage?: {
		prompt_tokens: number;
		completion_tokens: number;
		total_tokens: number;
	};
}

// Provider configuration
const PROVIDERS = {
	zai: {
		name: "Z.AI GLM",
		baseUrl: "https://api.z.ai/api/coding/paas/v4",
		defaultModel: "glm-4.7",
		getApiKey: () => process.env.ZAI_API_KEY,
	},
	openrouter: {
		name: "OpenRouter",
		baseUrl: "https://openrouter.ai/api/v1",
		defaultModel: "anthropic/claude-sonnet-4",
		getApiKey: () => process.env.OPENROUTER_API_KEY,
	},
	openai: {
		name: "OpenAI",
		baseUrl: "https://api.openai.com/v1",
		defaultModel: "gpt-4o-mini",
		getApiKey: () => process.env.OPENAI_API_KEY,
	},
} as const;

type ProviderName = keyof typeof PROVIDERS;

// Default provider order - Z.AI first (cheapest with subscription)
const PROVIDER_PRIORITY: ProviderName[] = ["zai", "openrouter", "openai"];

/**
 * Get the first available provider with a valid API key
 */
function getActiveProvider(): { name: ProviderName; config: typeof PROVIDERS[ProviderName] } | null {
	for (const name of PROVIDER_PRIORITY) {
		const config = PROVIDERS[name];
		if (config.getApiKey()) {
			return { name, config };
		}
	}
	return null;
}

/**
 * Run a chat completion using the best available provider
 * Priority: Z.AI GLM > OpenRouter > OpenAI
 */
export async function chat(options: ChatOptions): Promise<ChatResult> {
	const provider = getActiveProvider();

	if (!provider) {
		return {
			success: false,
			content: "",
			error: "No AI provider configured. Set ZAI_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY",
			model: "none",
		};
	}

	const { config } = provider;
	const apiKey = config.getApiKey();
	const model = options.model || config.defaultModel;

	try {
		const response = await fetch(`${config.baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
				...(provider.name === "openrouter" && {
					"HTTP-Referer": "https://pi-agent.dev",
					"X-Title": "Pi Bot",
				}),
			},
			body: JSON.stringify({
				model,
				messages: options.messages,
				max_tokens: options.maxTokens || 4096,
				temperature: options.temperature ?? 0.7,
				stream: options.stream || false,
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			return {
				success: false,
				content: "",
				error: `API error (${response.status}): ${errorText}`,
				model,
			};
		}

		const result = await response.json();
		const content = result.choices?.[0]?.message?.content || "";

		return {
			success: true,
			content,
			model,
			usage: result.usage,
		};
	} catch (error) {
		return {
			success: false,
			content: "",
			error: error instanceof Error ? error.message : "Unknown error",
			model,
		};
	}
}

/**
 * Quick chat - simple prompt to response
 */
export async function quickChat(
	prompt: string,
	systemPrompt?: string,
	maxTokens?: number
): Promise<string> {
	const messages: ChatMessage[] = [];

	if (systemPrompt) {
		messages.push({ role: "system", content: systemPrompt });
	}
	messages.push({ role: "user", content: prompt });

	const result = await chat({ messages, maxTokens });
	return result.success ? result.content : `Error: ${result.error}`;
}

/**
 * Vision chat - analyze images
 */
export async function visionChat(
	prompt: string,
	imageUrl: string,
	systemPrompt?: string
): Promise<ChatResult> {
	const messages: ChatMessage[] = [];

	if (systemPrompt) {
		messages.push({ role: "system", content: systemPrompt });
	}

	messages.push({
		role: "user",
		content: [
			{ type: "text", text: prompt },
			{ type: "image_url", image_url: { url: imageUrl } },
		],
	});

	// Vision requires a model that supports it
	// GLM-4.7 supports vision, fallback to Claude if needed
	return chat({ messages, model: "glm-4.7" });
}

/**
 * Get current provider info
 */
export function getProviderInfo(): { name: string; model: string; configured: boolean } {
	const provider = getActiveProvider();
	if (!provider) {
		return { name: "none", model: "none", configured: false };
	}
	return {
		name: provider.config.name,
		model: provider.config.defaultModel,
		configured: true,
	};
}

// Export provider names for status checks
export const AI_PROVIDERS = PROVIDERS;
export type AIProviderName = ProviderName;
